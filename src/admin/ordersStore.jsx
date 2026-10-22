import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { loadOrders, updateOrderStatus, removeOrder } from "../cart.jsx";
import { ordersEnabled, supabase, adminSession, adminSignIn, adminSignOut, isOrdersAdmin, listOrders, setOrderStatus, deleteOrder } from "../orders.js";
import { AdminIcon } from "./ui.jsx";

// All orders for the admin. With Supabase configured they come from the `orders` table
// (needs the admin's Supabase sign-in); without it, from this browser's local orders.
const Ctx = createContext(null);

export function AdminOrdersProvider({ children }) {
  // status: loading | signin | notadmin | ready | error
  const [state, setState] = useState({ status: ordersEnabled ? "loading" : "ready", orders: ordersEnabled ? [] : loadOrders(), error: "", email: "" });

  const load = useCallback(async () => {
    if (!ordersEnabled) return setState({ status: "ready", orders: loadOrders(), error: "" });
    if (!(await adminSession())) {
      // local development only: sign in to orders automatically with the account from .env.
      // import.meta.env.DEV is false in production builds, so these values never reach the live site.
      const devEmail = import.meta.env.DEV && import.meta.env.VITE_ORDERS_ADMIN_EMAIL;
      const devPassword = import.meta.env.DEV && import.meta.env.VITE_ORDERS_ADMIN_PASSWORD;
      if (devEmail && devPassword) {
        try {
          await adminSignIn(devEmail, devPassword);
        } catch (err) {
          console.warn("Orders auto sign-in failed:", err.message);
        }
      }
      if (!(await adminSession())) return setState((s) => ({ ...s, status: "signin" }));
    }
    setState((s) => ({ ...s, status: s.orders.length ? "ready" : "loading", error: "" }));
    try {
      // signed in but not in public.admins → RLS would silently return no orders
      const who = await isOrdersAdmin();
      if (!who.admin) return setState({ status: "notadmin", orders: [], error: "", email: who.email });
      setState({ status: "ready", orders: await listOrders(), error: "", email: who.email });
    } catch (err) {
      setState((s) => ({ ...s, status: "error", error: err.message }));
    }
  }, []);

  useEffect(() => {
    load();
    if (!supabase) return;
    // new orders show up without a refresh
    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => load())
      .subscribe();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") load();
    });
    return () => {
      supabase.removeChannel(channel);
      data.subscription.unsubscribe();
    };
  }, [load]);

  const changeStatus = useCallback(async (number, status) => {
    if (!ordersEnabled) return setState((s) => ({ ...s, orders: updateOrderStatus(number, status) }));
    const updated = await setOrderStatus(number, status);
    setState((s) => ({ ...s, orders: s.orders.map((o) => (o.number === number ? updated : o)) }));
  }, []);

  const remove = useCallback(async (number) => {
    if (!ordersEnabled) return setState((s) => ({ ...s, orders: removeOrder(number) }));
    await deleteOrder(number);
    setState((s) => ({ ...s, orders: s.orders.filter((o) => o.number !== number) }));
  }, []);

  return <Ctx.Provider value={{ ...state, reload: load, changeStatus, remove }}>{children}</Ctx.Provider>;
}

export const useAdminOrders = () => useContext(Ctx);

// shown in Orders / Dashboard until the admin connects their Supabase account
export function OrdersGate({ children }) {
  const { status, error, reload, email: signedInAs } = useAdminOrders();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  if (status === "loading") return <div className="adm-note">Loading orders…</div>;
  if (status === "error")
    return (
      <div className="adm-note adm-note--bad">
        <AdminIcon name="alert" />
        <span>Couldn't load orders: {error}</span>
        <button type="button" className="adm-btn adm-btn--ghost" onClick={reload}>
          Retry
        </button>
      </div>
    );
  if (status === "notadmin")
    return (
      <div className="adm-card adm-connect">
        <div>
          <h2>This account can't see orders yet</h2>
          <p className="adm-muted">
            You're signed in to orders as <strong>{signedInAs}</strong>, but it isn't on the admin list. In Supabase → SQL Editor run:
          </p>
        </div>
        <pre className="adm-code">{`insert into public.admins (user_id)
select id from auth.users where email = '${signedInAs}';`}</pre>
        <div className="adm-form__actions">
          <button type="button" className="adm-btn adm-btn--ghost" onClick={() => adminSignOut()}>
            Use another account
          </button>
          <button type="button" className="adm-btn adm-btn--primary" onClick={reload}>
            <AdminIcon name="refresh" />
            I've run it — check again
          </button>
        </div>
      </div>
    );
  if (status === "signin")
    return (
      <form
        className="adm-card adm-connect"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setMsg("");
          try {
            await adminSignIn(email, password);
          } catch (err) {
            setMsg(err.message);
          }
          setBusy(false);
        }}
      >
        <div>
          <h2>Connect orders</h2>
          <p className="adm-muted">Orders are stored in Supabase. Sign in once with the orders admin account — this device remembers it.</p>
        </div>
        {msg && (
          <div className="adm-note adm-note--bad" role="alert">
            <AdminIcon name="alert" />
            <span>{msg}</span>
          </div>
        )}
        <div className="adm-form__row">
          <label className="adm-field">
            <span>Email</span>
            <input className="adm-input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="adm-field">
            <span>Password</span>
            <input className="adm-input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
        </div>
        <div className="adm-form__actions">
          <button type="submit" className="adm-btn adm-btn--primary" disabled={busy || !email || !password}>
            <AdminIcon name="lock" />
            {busy ? "Connecting…" : "Connect"}
          </button>
        </div>
      </form>
    );
  return children;
}
