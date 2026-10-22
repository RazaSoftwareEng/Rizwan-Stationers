-- Rizwan Stationer — orders
-- Run once in Supabase: Dashboard → SQL Editor → paste this file → Run.
--
-- Who can do what:
--   • The website never writes orders directly. Checkout calls the `place-order` Edge Function,
--     which re-prices the cart from the product API and inserts with the service role.
--   • Customers can look up ONE order with its number + their phone (track_order function).
--   • Admins (rows in public.admins) can read every order and change its status.

create extension if not exists pgcrypto;

-- ---------- order numbers: RS-<yy>-<5 digits>, e.g. RS-26-10001 ----------
create sequence if not exists public.order_number_seq start 10001;

create or replace function public.next_order_number()
returns text
language sql
volatile
set search_path = public
as $$
  select 'RS-' || to_char(now() at time zone 'Asia/Karachi', 'YY') || '-' || nextval('public.order_number_seq')::text;
$$;

-- ---------- orders ----------
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  number          text not null unique default public.next_order_number(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  status          text not null default 'Received'
                  check (status in ('Received', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled')),
  customer_name   text not null check (char_length(customer_name) between 2 and 120),
  phone           text not null check (char_length(phone) between 10 and 16),
  email           text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  method          text not null default 'delivery' check (method in ('delivery', 'pickup')),
  address         text,
  city            text,
  notes           text check (notes is null or char_length(notes) <= 1000),
  payment         text not null default 'cod',
  -- [{ product_id, name, price, qty, image }] — prices as charged, taken from the product API
  items           jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) > 0),
  subtotal        numeric(12, 2) not null check (subtotal >= 0),
  delivery        text not null,
  total           numeric(12, 2) not null check (total >= 0),
  email_sent_at   timestamptz
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

-- digits only, last 10 — so "0300 1234567", "+92 300 1234567" and "923001234567" all match
create or replace function public.phone_key(p text)
returns text
language sql
immutable
as $$ select right(regexp_replace(coalesce(p, ''), '\D', '', 'g'), 10) $$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$ begin new.updated_at := now(); return new; end $$;

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

-- ---------- admins ----------
-- Add an admin after creating their user in Authentication → Users:
--   insert into public.admins (user_id) select id from auth.users where email = 'admin@rizwanstationers.com';
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;

-- ---------- row level security ----------
alter table public.orders enable row level security;
alter table public.admins enable row level security;

drop policy if exists "admins read orders" on public.orders;
create policy "admins read orders" on public.orders
  for select to authenticated using (public.is_admin());

drop policy if exists "admins update orders" on public.orders;
create policy "admins update orders" on public.orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins see admins" on public.admins;
create policy "admins see admins" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- admins may only change the status (and nothing else) from the dashboard
revoke update on public.orders from authenticated;
grant update (status) on public.orders to authenticated;
grant select on public.orders to authenticated;
-- no direct access for anonymous visitors at all
revoke all on public.orders from anon;

-- ---------- customer order tracking ----------
-- Returns the order only when the number AND the phone match; never lists other orders.
create or replace function public.track_order(p_number text, p_phone text)
returns table (
  number text, status text, created_at timestamptz, updated_at timestamptz,
  customer_name text, method text, city text, items jsonb, subtotal numeric, delivery text, total numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select o.number, o.status, o.created_at, o.updated_at,
         split_part(o.customer_name, ' ', 1),   -- first name only
         o.method, o.city, o.items, o.subtotal, o.delivery, o.total
  from public.orders o
  where upper(o.number) = upper(trim(p_number))
    and public.phone_key(o.phone) = public.phone_key(p_phone)
    and char_length(public.phone_key(p_phone)) = 10
  limit 1;
$$;

revoke all on function public.track_order(text, text) from public;
grant execute on function public.track_order(text, text) to anon, authenticated;

-- ---------- live updates for the admin dashboard ----------
-- (RLS still applies: only admins receive order changes)
do $$
begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null;
end $$;
