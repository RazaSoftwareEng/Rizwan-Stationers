# Orders on Supabase — setup

Products still come from the Django API. Only **orders** live in Supabase.

```
Checkout ──► Edge Function "place-order" ──► re-prices from the product API ──► orders table
                                         └─► confirmation email (Gmail via Apps Script, or Resend)
/track   ──► track_order(number, phone)   — one order, only with the matching phone
/admin   ──► orders table (admins only)   — list, live updates, change status
```

## 1. Database
Supabase Dashboard → **SQL Editor** → paste `migrations/20261021000000_orders.sql` → **Run**.

## 2. Admin account for orders
1. **Authentication → Users → Add user**: email + password (e.g. `admin@rizwanstationers.com`). Tick *Auto confirm*.
2. SQL Editor:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'admin@rizwanstationers.com';
   ```
   If the Django admin signs in with this same email + password, orders connect automatically;
   otherwise the Orders tab asks for it once per device.

## 3. Email
**For now — Gmail, free, no domain:** follow the steps at the top of `email/apps-script.gs`
(paste it at script.google.com, deploy as a Web app, then add `EMAIL_SCRIPT_URL` and
`EMAIL_SCRIPT_SECRET` to the Edge Function secrets). Emails go out from that Gmail account,
about 100 a day.

**Later — your own domain:** create a Resend account, verify the domain, and set
`RESEND_API_KEY` + `RESEND_FROM` instead (remove `EMAIL_SCRIPT_URL`).

## 4. Edge Function
With the Supabase CLI (`npm i -g supabase`, then `supabase login`):

```bash
supabase link --project-ref <your-project-ref>
supabase secrets set EMAIL_SCRIPT_URL=https://script.google.com/macros/s/xxx/exec \
  EMAIL_SCRIPT_SECRET=the-same-secret-as-in-the-script \
  SHOP_EMAIL=rizwanstationers.official@gmail.com \
  SITE_URL=https://rizwanstationers.com
supabase functions deploy place-order --no-verify-jwt
```

(Or Dashboard → **Edge Functions → Deploy new function** → paste `functions/place-order/index.ts`,
turn **off** "Verify JWT", and add the secrets under **Edge Functions → Secrets**.)

## 5. Website
Dashboard → **Settings → API**: copy the **Project URL** and the **anon public** key.

- Local: create `.env.local` in the project root (see `.env.example`), restart `npm run dev`.
- Netlify: **Site configuration → Environment variables** → add the same two, redeploy.

Never put the **service_role** key in the website — it bypasses all security. The Edge Function gets it automatically.
