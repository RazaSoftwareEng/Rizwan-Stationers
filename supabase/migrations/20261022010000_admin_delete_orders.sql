-- Rizwan Stationer — let admins delete orders from the dashboard (e.g. test orders).
-- Run once in Supabase: Dashboard → SQL Editor → paste this file → Run.

drop policy if exists "admins delete orders" on public.orders;
create policy "admins delete orders" on public.orders
  for delete to authenticated using (public.is_admin());

grant delete on public.orders to authenticated;
