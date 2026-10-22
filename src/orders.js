import { createClient } from "@supabase/supabase-js";

// Orders live in Supabase (see supabase/migrations and supabase/functions/place-order).
// Set in .env.local (dev) and in Netlify's environment variables (live):
//   VITE_SUPABASE_URL=https://<project>.supabase.co
//   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_…   (or VITE_SUPABASE_ANON_KEY)
// The anon key is public by design — the database only allows what the RLS policies permit.
const URL = import.meta.env.VITE_SUPABASE_URL;
// the newer "publishable" key or the legacy "anon" key — both are public
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

// Online orders are switched off for now: checkout keeps orders in the browser and downloads an invoice.
// To turn Supabase orders (and order tracking) back on, set VITE_ORDERS_ONLINE=true in .env / Netlify.
export const ordersEnabled = !!(URL && KEY) && import.meta.env.VITE_ORDERS_ONLINE === "true";
export const supabase = ordersEnabled ? createClient(URL, KEY, { auth: { storageKey: "rs-orders-auth" } }) : null;

export const ADMIN_STATUSES = ["Received", "Confirmed", "Dispatched", "Delivered", "Cancelled"];

export class OrderError extends Error {
  constructor(message, { fields, code } = {}) {
    super(message);
    this.fields = fields || {};
    this.code = code;
  }
}

// Supabase row → the order shape the site's order components use
export function fromRow(r) {
  return {
    number: r.number,
    date: r.created_at,
    updated: r.updated_at,
    status: r.status,
    customer: {
      name: r.customer_name || "",
      phone: r.phone || "",
      email: r.email || "",
      method: r.method || "delivery",
      address: r.address || "",
      city: r.city || "",
      notes: r.notes || "",
    },
    items: (r.items || []).map((i) => ({ id: `api-${i.product_id}`, productId: i.product_id, name: i.name, price: Number(i.price), qty: i.qty, image: i.image })),
    subtotal: Number(r.subtotal ?? r.total),
    total: Number(r.total),
    delivery: r.delivery,
    emailed: !!r.email_sent_at || !!r.emailed,
  };
}

/* ---------- checkout ---------- */
// cart lines: [{ product, qty }]; customer: the checkout form
// Saves the order in Supabase through the create_order() database function
// (supabase/migrations/20261022000000_create_order.sql), which checks the details,
// recalculates the total and returns the order number.
// Throws OrderError with code "unavailable" when the service or function isn't reachable,
// so checkout can fall back to keeping the order in this browser.
export async function placeOrder(customer, lines) {
  let res;
  try {
    res = await supabase.rpc("create_order", {
      p_customer: customer,
      p_items: lines.map((l) => ({
        product_id: l.product.apiId,
        name: l.product.name,
        price: l.product.price,
        qty: l.qty,
        image: l.product.images?.[0] || null,
      })),
    });
  } catch {
    throw new OrderError("unavailable", { code: "unavailable" });
  }
  const { data, error } = res;
  if (error) {
    // 22023 = a message written for the customer in create_order (bad phone, empty cart…)
    if (error.code === "22023") throw new OrderError(error.message);
    console.error("create_order", error);
    throw new OrderError("unavailable", { code: "unavailable" });
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.number) throw new OrderError("unavailable", { code: "unavailable" });
  return { ...row, emailed: false };
}

/* ---------- customer tracking ---------- */
export async function trackOrder(number, phone) {
  const { data, error } = await supabase.rpc("track_order", { p_number: number.trim(), p_phone: phone });
  if (error) throw new OrderError("We couldn't check that order right now. Please try again.");
  const row = Array.isArray(data) ? data[0] : data;
  return row ? fromRow({ ...row, phone }) : null;
}

/* ---------- admin ---------- */
export async function adminSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}
export async function adminSignIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new OrderError(error.message === "Invalid login credentials" ? "That email and password don't match an orders admin." : error.message);
}
export async function adminSignOut() {
  if (supabase) await supabase.auth.signOut();
}
// true when the signed-in Supabase user is listed in public.admins (RLS lets a user see only their own row)
export async function isOrdersAdmin() {
  const { data: u } = await supabase.auth.getUser();
  if (!u?.user) return { admin: false, email: "" };
  const { data, error } = await supabase.from("admins").select("user_id").eq("user_id", u.user.id).limit(1);
  if (error) throw new OrderError(error.message);
  return { admin: (data || []).length > 0, email: u.user.email || "" };
}

export async function listOrders() {
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(1000);
  if (error) throw new OrderError(error.message);
  return data.map(fromRow);
}
export async function deleteOrder(number) {
  const { data, error } = await supabase.from("orders").delete().eq("number", number).select("number");
  if (error) throw new OrderError(error.message);
  // RLS returns no rows (instead of an error) when this account isn't allowed to delete
  if (!data?.length) throw new OrderError("This order couldn't be deleted. Run supabase/migrations/20261022010000_admin_delete_orders.sql in Supabase, then try again.");
}

export async function setOrderStatus(number, status) {
  const { data, error } = await supabase.from("orders").update({ status }).eq("number", number).select().single();
  if (error) throw new OrderError(error.message);
  return fromRow(data);
}
