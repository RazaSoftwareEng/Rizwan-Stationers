import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart, formatRs, loadOrders, loadOrder } from "../cart.jsx";
import { shop } from "../data/shop.js";
import PageHeader from "../components/PageHeader.jsx";
import ProductThumb from "../components/ProductThumb.jsx";
import Icon from "../components/Icon.jsx";
import { OrderItems, StatusTrack, formatOrderDate } from "../components/OrderParts.jsx";
import { orderWhatsAppLink } from "./OrderConfirmed.jsx";
import { products } from "../data/products.js";

function useReorder() {
  const { reorder, openDrawer } = useCart();
  return (order) => {
    reorder(order.items);
    openDrawer();
  };
}

/* ---------- list ---------- */
export default function Orders() {
  const [orders] = useState(loadOrders);
  const reorder = useReorder();

  return (
    <>
      <PageHeader eyebrow="Your account" title="My orders" lead="Orders placed from this device, newest first." />
      <section className="section section--tight">
        <div className="container orders">
          {orders.length === 0 ? (
            <div className="empty">
              <img src="/seal.png" alt="" width="96" height="96" />
              <p>You haven't placed any orders yet.</p>
              <Link to="/shop" className="btn btn--lg">Start shopping</Link>
            </div>
          ) : (
            <ul className="orders__list">
              {orders.map((o) => {
                const count = o.items.reduce((n, i) => n + i.qty, 0);
                return (
                  <li key={o.number} className="order-card">
                    <div className="order-card__head">
                      <div>
                        <p className="order-card__num">{o.number}</p>
                        <p className="muted">{formatOrderDate(o.date)}</p>
                      </div>
                      <span className={`status status--${(o.status || "Received").toLowerCase()}`}>{o.status || "Received"}</span>
                    </div>
                    <div className="order-card__thumbs">
                      {o.items.slice(0, 4).map((i) => (
                        <ProductThumb
                          key={i.id}
                          product={products.find((p) => p.id === i.id) || { category: i.category, images: i.image ? [i.image] : [] }}
                        />
                      ))}
                      {o.items.length > 4 && <span className="order-card__more">+{o.items.length - 4}</span>}
                    </div>
                    <div className="order-card__foot">
                      <p>
                        {count} {count === 1 ? "item" : "items"} · <strong>{formatRs(o.total)}</strong>
                      </p>
                      <div className="order-card__actions">
                        <button type="button" className="btn btn--ghost" onClick={() => reorder(o)}>
                          Reorder
                        </button>
                        <Link to={`/orders/${o.number}`} className="btn">
                          View details
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="orders__note">
            <Icon name="shield" /> For this preview, orders are saved in this browser only. Questions about an order? Call{" "}
            <a href={`tel:${shop.phone.replace(/\s/g, "")}`}>{shop.phone}</a>.
          </p>
        </div>
      </section>
    </>
  );
}

/* ---------- single order ---------- */
export function OrderDetail() {
  const { number } = useParams();
  const order = loadOrder(number);
  const reorder = useReorder();
  const navigate = useNavigate();

  if (!order || order.number !== number) {
    return (
      <section className="section">
        <div className="container empty">
          <p>We couldn't find order {number}.</p>
          <Link to="/orders" className="btn btn--lg">My orders</Link>
        </div>
      </section>
    );
  }

  const c = order.customer;
  const pickup = c.method === "pickup";

  return (
    <section className="section section--tight">
      <div className="container orders">
        <button type="button" className="link-arrow link-arrow--back" onClick={() => navigate("/orders")}>
          <Icon name="arrow" /> All orders
        </button>
        <div className="order-detail">
          <div className="order-detail__head">
            <div>
              <h1>Order {order.number}</h1>
              <p className="muted">Placed {formatOrderDate(order.date)}</p>
            </div>
            <span className={`status status--${(order.status || "Received").toLowerCase()}`}>{order.status || "Received"}</span>
          </div>

          <StatusTrack status={order.status} pickup={pickup} />

          <OrderItems items={order.items} total={order.total} delivery={order.delivery} />

          <div className="confirm__details">
            <div>
              <p className="confirm__label">Customer</p>
              <p>{c.name}<br />{c.phone}{c.email && <><br />{c.email}</>}</p>
            </div>
            <div>
              <p className="confirm__label">{pickup ? "Pickup" : "Delivery to"}</p>
              <p>{pickup ? shop.address : `${c.address}, ${c.city}`}</p>
            </div>
            <div>
              <p className="confirm__label">Payment</p>
              <p>{pickup ? "Pay at the shop" : "Cash on delivery"}</p>
            </div>
            {c.notes && (
              <div>
                <p className="confirm__label">Notes</p>
                <p>{c.notes}</p>
              </div>
            )}
          </div>

          <div className="confirm__actions confirm__actions--start">
            <button type="button" className="btn btn--lg" onClick={() => reorder(order)}>
              <Icon name="bag" /> Reorder
            </button>
            <a className="btn btn--ghost btn--lg" href={orderWhatsAppLink(order)} target="_blank" rel="noopener noreferrer">
              <Icon name="chat" /> Ask about this order
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
