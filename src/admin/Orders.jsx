import { useEffect, useMemo, useState } from "react";
import { formatRs } from "../cart.jsx";
import { ADMIN_STATUSES as ORDER_STATUSES, ordersEnabled } from "../orders.js";
import { useAdminOrders, OrdersGate } from "./ordersStore.jsx";
import { PageHead, AdminIcon, Empty, formatDateTime } from "./ui.jsx";

const itemCount = (o) => (o.items || []).reduce((n, i) => n + (i.qty || 0), 0);

function OrderPanel({ order, onClose, onStatus: change, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  async function doDelete() {
    setDeleting(true);
    setSaveError("");
    try {
      await onDelete(order.number);
      onClose();
    } catch (err) {
      setSaveError(err.message || "Couldn't delete the order.");
      setDeleting(false);
      setConfirming(false);
    }
  }
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  async function onStatus(number, s) {
    setSaving(true);
    setSaveError("");
    try {
      await change(number, s);
    } catch (err) {
      setSaveError(err.message || "Couldn't save the status.");
    }
    setSaving(false);
  }
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const c = order.customer || {};
  return (
    <div className="adm-panel-wrap" role="dialog" aria-modal="true" aria-label={`Order ${order.number}`}>
      <button type="button" className="adm-scrim" aria-label="Close" onClick={onClose} />
      <aside className="adm-panel">
        <div className="adm-panel__head">
          <div>
            <h2>{order.number}</h2>
            <p className="adm-muted">{formatDateTime(order.date)}</p>
          </div>
          <button type="button" className="adm-iconbtn" onClick={onClose} aria-label="Close">
            <AdminIcon name="close" />
          </button>
        </div>

        <label className="adm-field">
          <span>Status</span>
          <select className="adm-select" value={order.status} onChange={(e) => onStatus(order.number, e.target.value)} disabled={saving}>
            {ORDER_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>

        {saveError && <small className="adm-field__error">{saveError}</small>}
        {saving && <small className="adm-muted">Saving…</small>}

        <h3>Customer</h3>
        <dl className="adm-dl">
          <div>
            <dt>Name</dt>
            <dd>{c.name || "—"}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{c.phone ? <a href={`tel:${c.phone}`}>{c.phone}</a> : "—"}</dd>
          </div>
          {c.email && (
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${c.email}`}>{c.email}</a>
              </dd>
            </div>
          )}
          <div>
            <dt>Delivery</dt>
            <dd>{order.delivery || c.method || "—"}</dd>
          </div>
          {(c.address || c.city) && (
            <div>
              <dt>Address</dt>
              <dd>{[c.address, c.city].filter(Boolean).join(", ")}</dd>
            </div>
          )}
          {c.notes && (
            <div>
              <dt>Notes</dt>
              <dd>{c.notes}</dd>
            </div>
          )}
        </dl>

        <h3>Items</h3>
        <ul className="adm-items">
          {(order.items || []).map((i) => (
            <li key={i.id}>
              <span>
                {i.name} <span className="adm-muted">× {i.qty}</span>
              </span>
              <span>{formatRs((i.price || 0) * (i.qty || 0))}</span>
            </li>
          ))}
          <li className="adm-items__total">
            <span>Total</span>
            <span>{formatRs(order.total || 0)}</span>
          </li>
        </ul>

        <div className="adm-danger">
          {confirming ? (
            <>
              <p>
                Delete order <strong>{order.number}</strong> for good? The customer won't be able to track it any more. This can't be undone.
              </p>
              <div className="adm-form__actions">
                <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setConfirming(false)} disabled={deleting}>
                  Cancel
                </button>
                <button type="button" className="adm-btn adm-btn--danger" onClick={doDelete} disabled={deleting}>
                  <AdminIcon name="trash" />
                  {deleting ? "Deleting…" : "Delete order"}
                </button>
              </div>
            </>
          ) : (
            <button type="button" className="adm-btn adm-btn--ghost adm-danger__open" onClick={() => setConfirming(true)}>
              <AdminIcon name="trash" />
              Delete order
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}

export default function Orders() {
  const { orders, changeStatus, reload, remove } = useAdminOrders();
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [openNumber, setOpenNumber] = useState(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (status === "all" || o.status === status) &&
        (!q || o.number.toLowerCase().includes(q) || (o.customer?.name || "").toLowerCase().includes(q) || (o.customer?.phone || "").includes(q)),
    );
  }, [orders, status, query]);

  const counts = ORDER_STATUSES.reduce((m, s) => ({ ...m, [s]: orders.filter((o) => o.status === s).length }), {});
  const open = orders.find((o) => o.number === openNumber);

  return (
    <>
      <PageHead title="Orders" sub={`${orders.length} orders${ordersEnabled ? " · live from Supabase" : ""}`}>
        {ordersEnabled && (
          <button type="button" className="adm-btn adm-btn--ghost" onClick={reload}>
            <AdminIcon name="refresh" />
            Refresh
          </button>
        )}
      </PageHead>
      {!ordersEnabled && (
        <div className="adm-note">
          <AdminIcon name="lock" />
          <span>
            Supabase isn't configured, so this lists orders placed through checkout in <strong>this browser</strong> only.
          </span>
        </div>
      )}
      <OrdersGate>

      <div className="adm-card">
        <div className="adm-filters">
          <div className="adm-tabs" role="group" aria-label="Filter by status">
            {["all", ...ORDER_STATUSES].map((s) => (
              <button key={s} type="button" className={"adm-tab" + (status === s ? " is-active" : "")} onClick={() => setStatus(s)} aria-pressed={status === s}>
                {s === "all" ? "All" : s}
                <span>{s === "all" ? orders.length : counts[s]}</span>
              </button>
            ))}
          </div>
          <label className="adm-search">
            <AdminIcon name="search" />
            <input type="search" placeholder="Order no., name or phone" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search orders" />
          </label>
        </div>

        {list.length ? (
          <div className="adm-table-wrap">
            <table className="adm-table adm-table--click">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th className="num">Items</th>
                  <th className="num">Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {list.map((o) => (
                  <tr key={o.number} onClick={() => setOpenNumber(o.number)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setOpenNumber(o.number)}>
                    <td className="adm-strong">{o.number}</td>
                    <td>
                      {o.customer?.name || "—"}
                      {o.customer?.phone && <span className="adm-prod__desc">{o.customer.phone}</span>}
                    </td>
                    <td className="adm-muted">{formatDateTime(o.date)}</td>
                    <td className="num">{itemCount(o)}</td>
                    <td className="num adm-strong">{formatRs(o.total || 0)}</td>
                    <td>
                      <span className={`adm-status adm-status--${(o.status || "").toLowerCase()}`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>{orders.length ? "No orders match these filters." : "No orders yet."}</Empty>
        )}
      </div>

      </OrdersGate>

      {open && (
        <OrderPanel
          order={open}
          onClose={() => setOpenNumber(null)}
          onStatus={changeStatus}
          onDelete={remove}
        />
      )}
    </>
  );
}
