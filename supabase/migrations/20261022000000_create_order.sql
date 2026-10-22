-- Rizwan Stationer — let the website create orders directly (no Edge Function needed).
-- Run once in Supabase: Dashboard → SQL Editor → paste this file → Run.
-- Needs the earlier migration (20261021000000_orders.sql) to have been run first.
--
-- Visitors can only CREATE an order through this function; they still can't read or change
-- anyone's orders (tracking stays number + phone only, via track_order).
-- The total is always recalculated here from the items, never taken from the browser.
-- Item prices come from the website, so every order is confirmed on a phone call before dispatch.

create or replace function public.create_order(p_customer jsonb, p_items jsonb)
returns table (number text, status text, created_at timestamptz, items jsonb, subtotal numeric, delivery text, total numeric)
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_name     text := left(trim(coalesce(p_customer->>'name', '')), 120);
  v_phone    text := left(trim(coalesce(p_customer->>'phone', '')), 20);
  v_email    text := nullif(lower(left(trim(coalesce(p_customer->>'email', '')), 200)), '');
  v_method   text := case when p_customer->>'method' = 'pickup' then 'pickup' else 'delivery' end;
  v_address  text := left(trim(coalesce(p_customer->>'address', '')), 400);
  v_city     text := coalesce(nullif(left(trim(coalesce(p_customer->>'city', '')), 60), ''), 'Lahore');
  v_notes    text := nullif(left(trim(coalesce(p_customer->>'notes', '')), 1000), '');
  v_items    jsonb := '[]'::jsonb;
  v_subtotal numeric := 0;
  v_delivery text;
  v_line     jsonb;
  v_qty      int;
  v_price    numeric;
  v_order    public.orders;
begin
  -- customer details
  if char_length(v_name) < 3 then raise exception 'Please enter your full name.' using errcode = '22023'; end if;
  if regexp_replace(v_phone, '[\s-]', '', 'g') !~ '^(\+92|92|0)3\d{9}$' then
    raise exception 'Enter a mobile number like 0300 1234567.' using errcode = '22023';
  end if;
  if v_email is not null and v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'That email doesn''t look right.' using errcode = '22023';
  end if;
  if v_method = 'delivery' and char_length(v_address) < 8 then
    raise exception 'Please enter your full address.' using errcode = '22023';
  end if;

  -- items (max 50 lines, qty 1–99, sensible prices)
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your cart is empty.' using errcode = '22023';
  end if;
  if jsonb_array_length(p_items) > 50 then raise exception 'Too many items in one order.' using errcode = '22023'; end if;
  for v_line in select * from jsonb_array_elements(p_items) loop
    v_qty := least(99, greatest(1, coalesce((v_line->>'qty')::int, 1)));
    v_price := round(coalesce((v_line->>'price')::numeric, -1), 2);
    if v_price < 0 or v_price > 1000000 or coalesce(trim(v_line->>'name'), '') = '' then
      raise exception 'Something in your cart looks wrong — please refresh and try again.' using errcode = '22023';
    end if;
    v_items := v_items || jsonb_build_object(
      'product_id', v_line->'product_id',
      'name', left(v_line->>'name', 200),
      'price', v_price,
      'qty', v_qty,
      'image', left(v_line->>'image', 500)
    );
    v_subtotal := v_subtotal + v_price * v_qty;
  end loop;

  -- simple spam guard: one order per phone number every 20 seconds
  if exists (
    select 1 from public.orders o
    where public.phone_key(o.phone) = public.phone_key(v_phone) and o.created_at > now() - interval '20 seconds'
  ) then
    raise exception 'You just placed an order — please wait a few seconds before placing another.' using errcode = '22023';
  end if;

  v_delivery := case
    when v_method = 'pickup' then 'Free (pickup)'
    when v_city = 'Lahore' and v_subtotal >= 2000 then 'Free'
    else 'Confirmed on call'
  end;

  insert into public.orders (customer_name, phone, email, method, address, city, notes, items, subtotal, delivery, total)
  values (v_name, v_phone, v_email, v_method,
          case when v_method = 'pickup' then null else v_address end,
          case when v_method = 'pickup' then null else v_city end,
          v_notes, v_items, v_subtotal, v_delivery, v_subtotal)
  returning * into v_order;

  return query select v_order.number, v_order.status, v_order.created_at, v_order.items, v_order.subtotal, v_order.delivery, v_order.total;
end;
$$;

revoke all on function public.create_order(jsonb, jsonb) from public;
grant execute on function public.create_order(jsonb, jsonb) to anon, authenticated;
