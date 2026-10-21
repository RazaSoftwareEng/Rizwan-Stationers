import { useEffect, useMemo, useState } from "react";
import { formatRs, loadOrders, updateOrderStatus, ORDER_STATUSES } from "../cart.jsx";
import { PageHead, AdminIcon, Empty, formatDateTime } from "./ui.jsx";

const itemCount = (o) => (o.items || []).reduce((n, i) => n + (i.qty || 0), 0);

function OrderPanel({ order, onClose, onStatus }) {
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
          <select className="adm-select" value={order.status} onChange={(e) => onStatus(order.number, e.target.value)}>
            {ORDER_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>

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
      </aside>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState(loadOrders);
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
      <PageHead title="Orders" sub={`${orders.length} orders`} />
      <div className="adm-note">
        <AdminIcon name="lock" />
        <span>
          There's no orders API yet, so this lists orders placed through checkout in <strong>this browser</strong>. Once the
          orders endpoint is connected, every order will show here.
        </span>
      </div>

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

      {open && (
        <OrderPanel
          order={open}
          onClose={() => setOpenNumber(null)}
          onStatus={(number, s) => setOrders(updateOrderStatus(number, s))}
        />
      )}
    </>
  );
}
