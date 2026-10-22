// Supabase Edge Function: place-order
// Checkout posts the cart here. The function:
//   1. re-prices every line from the product API (the browser's prices are never trusted),
//   2. saves the order (service role — the table isn't writable from the browser),
//   3. emails the customer (and optionally the shop).
//
// Email goes out one of two ways (emails are skipped if neither is set):
//   • Gmail through Google Apps Script — no domain needed (see supabase/email/apps-script.gs)
//       EMAIL_SCRIPT_URL     the script's Web app URL (https://script.google.com/macros/s/…/exec)
//       EMAIL_SCRIPT_SECRET  the same SECRET written in the script
//   • Resend — once you have your own domain
//       RESEND_API_KEY       Resend API key
//       RESEND_FROM          sender, e.g. "Rizwan Stationer <orders@rizwanstationers.com>" (domain verified in Resend)
//
// Other secrets (Dashboard → Edge Functions → Secrets, or `supabase secrets set`):
//   SHOP_EMAIL         optional — a copy of every order goes here
//   SITE_URL           e.g. https://rizwanstationers.com (for the "track your order" link)
//   PRODUCTS_API_URL   optional, defaults to https://api.qomunix.com/api/public/products/
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase automatically.

import { createClient } from "jsr:@supabase/supabase-js@2.117.2";

const FREE_DELIVERY_FROM = 2000;
const MAX_LINES = 50;
const MAX_QTY = 99;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const env = (k: string, fallback = "") => Deno.env.get(k) ?? fallback;
const clean = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const rs = (n: number) => "Rs " + Math.round(n).toLocaleString("en-PK");
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

type ApiProduct = { id: number; name: string; price: string; in_stock: boolean; image: string | null };

function validate(c: Record<string, string>) {
  const errors: Record<string, string> = {};
  if (c.name.length < 3) errors.name = "Please enter your full name.";
  if (!/^(\+92|92|0)3\d{9}$/.test(c.phone.replace(/[\s-]/g, ""))) errors.phone = "Enter a mobile number like 0300 1234567.";
  if (c.email && !/^\S+@\S+\.\S+$/.test(c.email)) errors.email = "That email doesn't look right.";
  if (c.method === "delivery" && c.address.length < 8) errors.address = "Please enter your full address.";
  return errors;
}

function emailHtml(order: Record<string, any>, trackUrl: string) {
  const rows = (order.items as any[])
    .map(
      (i) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee5d3">${esc(i.name)} <span style="color:#646b7a">× ${i.qty}</span></td>
        <td style="padding:10px 0;border-bottom:1px solid #eee5d3;text-align:right;white-space:nowrap">${rs(i.price * i.qty)}</td>
      </tr>`,
    )
    .join("");
  const where = order.method === "pickup" ? "Pickup from Main Urdu Bazar, Lahore" : `${esc(order.address || "")}, ${esc(order.city || "")}`;
  return `<!doctype html><html><body style="margin:0;background:#f6f1e7;font-family:Arial,Helvetica,sans-serif;color:#18223a">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f1e7;padding:24px 12px"><tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
    <tr><td style="background:#14254a;padding:22px 28px;color:#d9bf85;font-family:Georgia,serif;font-size:22px">Rizwan Stationer</td></tr>
    <tr><td style="padding:28px">
      <p style="margin:0 0 6px;color:#b08a3e;font-size:12px;letter-spacing:2px;text-transform:uppercase">Order received</p>
      <h1 style="margin:0 0 12px;font-family:Georgia,serif;font-size:26px;color:#14254a">Thank you, ${esc(order.customer_name.split(" ")[0])}!</h1>
      <p style="margin:0 0 18px;line-height:1.6">Your order <strong>${esc(order.number)}</strong> has been received. We'll call you on <strong>${esc(order.phone)}</strong> to confirm it before dispatch.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">${rows}
        <tr><td style="padding:10px 0;color:#646b7a">Delivery</td><td style="padding:10px 0;text-align:right">${esc(order.delivery)}</td></tr>
        <tr><td style="padding:10px 0;font-weight:bold;font-size:16px">Total</td><td style="padding:10px 0;text-align:right;font-weight:bold;font-size:16px">${rs(order.total)}</td></tr>
      </table>
      <p style="margin:18px 0 4px;color:#646b7a;font-size:13px">${order.method === "pickup" ? "Pickup" : "Deliver to"}</p>
      <p style="margin:0 0 22px;line-height:1.5">${where}</p>
      <a href="${trackUrl}" style="display:inline-block;background:#b08a3e;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:bold">Track your order</a>
      <p style="margin:22px 0 0;color:#646b7a;font-size:12px;line-height:1.6">Keep your order number <strong>${esc(order.number)}</strong> and phone number — you need both to check the status on our website. Payment: cash on delivery.</p>
    </td></tr>
    <tr><td style="background:#f6f1e7;padding:16px 28px;color:#646b7a;font-size:12px">Rizwan Stationer · Main Urdu Bazar, Lahore · +92 300 8433723</td></tr>
  </table></td></tr></table></body></html>`;
}

async function sendEmail(to: string[], subject: string, html: string) {
  if (!to.length) return false;
  // Gmail via Apps Script (the script sends from the Google account that deployed it)
  const scriptUrl = env("EMAIL_SCRIPT_URL");
  if (scriptUrl) {
    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ secret: env("EMAIL_SCRIPT_SECRET"), to: to.join(","), subject, html, name: "Rizwan Stationer", replyTo: env("SHOP_EMAIL") }),
      redirect: "follow",
    });
    const text = await res.text();
    let ok = false;
    try {
      ok = JSON.parse(text).ok === true;
    } catch {
      /* not JSON — usually a Google sign-in page: the script isn't shared with "Anyone" */
    }
    if (!ok) console.error("Apps Script email failed", res.status, text.slice(0, 300));
    return ok;
  }
  const key = env("RESEND_API_KEY");
  if (!key) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env("RESEND_FROM", "Rizwan Stationer <onboarding@resend.dev>"), to, subject, html }),
  });
  if (!res.ok) console.error("Resend error", res.status, await res.text());
  return res.ok;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json(405, { error: "Use POST" });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Invalid request" });
  }

  const c = body?.customer || {};
  const customer = {
    name: clean(c.name, 120),
    phone: clean(c.phone, 20),
    email: clean(c.email, 200).toLowerCase(),
    method: c.method === "pickup" ? "pickup" : "delivery",
    address: clean(c.address, 400),
    city: clean(c.city, 60) || "Lahore",
    notes: clean(c.notes, 1000),
  };
  const errors = validate(customer);
  if (Object.keys(errors).length) return json(422, { error: "Please check your details.", fields: errors });

  // merge duplicate lines and cap quantities
  const wanted = new Map<number, number>();
  for (const line of Array.isArray(body?.items) ? body.items.slice(0, MAX_LINES) : []) {
    const id = Number(line?.api_id);
    const qty = Math.floor(Number(line?.qty));
    if (Number.isInteger(id) && qty > 0) wanted.set(id, Math.min(MAX_QTY, (wanted.get(id) || 0) + qty));
  }
  if (!wanted.size) return json(422, { error: "Your cart is empty." });

  // 1. real prices and stock from the product API
  let catalog: ApiProduct[];
  try {
    const res = await fetch(env("PRODUCTS_API_URL", "https://api.qomunix.com/api/public/products/"), { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    catalog = Array.isArray(data) ? data : data.results || [];
  } catch (err) {
    console.error("product API", err);
    return json(503, { error: "We couldn't check prices right now. Please try again in a moment." });
  }
  const byId = new Map(catalog.map((p) => [p.id, p]));
  const items = [];
  const problems: string[] = [];
  for (const [id, qty] of wanted) {
    const p = byId.get(id);
    if (!p) problems.push(`A product in your cart is no longer available.`);
    else if (!p.in_stock) problems.push(`${p.name} is out of stock.`);
    else items.push({ product_id: p.id, name: p.name, price: Number(p.price), qty, image: p.image });
  }
  if (problems.length) return json(409, { error: problems.join(" "), code: "cart_changed" });

  const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);
  const pickup = customer.method === "pickup";
  const delivery = pickup ? "Free (pickup)" : customer.city === "Lahore" && subtotal >= FREE_DELIVERY_FROM ? "Free" : "Confirmed on call";

  // 2. save
  const db = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });
  const { data: order, error } = await db
    .from("orders")
    .insert({
      customer_name: customer.name,
      phone: customer.phone,
      email: customer.email || null,
      method: customer.method,
      address: pickup ? null : customer.address,
      city: pickup ? null : customer.city,
      notes: customer.notes || null,
      items,
      subtotal,
      delivery,
      total: subtotal,
    })
    .select()
    .single();
  if (error || !order) {
    console.error("insert", error);
    return json(500, { error: "We couldn't save your order. Please try again or order on WhatsApp." });
  }

  // 3. emails (a failure here never loses the order)
  const site = env("SITE_URL", new URL(req.headers.get("origin") || "https://rizwanstationers.com").origin);
  const trackUrl = `${site}/track?n=${encodeURIComponent(order.number)}`;
  let emailed = false;
  try {
    if (order.email) {
      emailed = await sendEmail([order.email], `Order ${order.number} received — Rizwan Stationer`, emailHtml(order, trackUrl));
      if (emailed) await db.from("orders").update({ email_sent_at: new Date().toISOString() }).eq("id", order.id);
    }
    const shop = env("SHOP_EMAIL");
    if (shop) await sendEmail([shop], `New order ${order.number} — ${rs(order.total)} — ${order.customer_name}`, emailHtml(order, trackUrl));
  } catch (err) {
    console.error("email", err);
  }

  return json(201, {
    number: order.number,
    status: order.status,
    created_at: order.created_at,
    items: order.items,
    subtotal: Number(order.subtotal),
    delivery: order.delivery,
    total: Number(order.total),
    emailed,
  });
});
