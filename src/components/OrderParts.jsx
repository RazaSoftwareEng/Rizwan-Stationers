import { formatRs, ORDER_STATUSES } from "../cart.jsx";
import { products } from "../data/products.js";
import ProductThumb from "./ProductThumb.jsx";

export function formatOrderDate(iso) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Status timeline: Received → Confirmed → Dispatched → Delivered
export function StatusTrack({ status, pickup }) {
  const steps = pickup ? ["Received", "Confirmed", "Ready for pickup", "Collected"] : ORDER_STATUSES;
  const at = Math.max(0, ORDER_STATUSES.indexOf(status));
  return (
    <ol className="track" aria-label="Order status">
      {steps.map((s, i) => (
        <li key={s} className={"track__step" + (i <= at ? " is-done" : "") + (i === at ? " is-current" : "")}>
          <span className="track__dot" />
          <span className="track__label">{s}</span>
        </li>
      ))}
    </ol>
  );
}

export function OrderItems({ items, total, delivery }) {
  return (
    <ul className="order-items">
      {items.map((i) => {
        const product = products.find((p) => p.id === i.id) || { category: i.category, images: i.image ? [i.image] : [] };
        return (
          <li key={i.id}>
            <ProductThumb product={product} />
            <span className="order-items__name">
              {i.name}
              <small>
                {formatRs(i.price)} × {i.qty}
              </small>
            </span>
            <span className="order-items__sum">{formatRs(i.price * i.qty)}</span>
          </li>
        );
      })}
      {delivery && (
        <li className="order-items__row">
          <span>Delivery</span>
          <span>{delivery}</span>
        </li>
      )}
      <li className="order-items__row order-items__total">
        <span>Total</span>
        <span>{formatRs(total)}</span>
      </li>
    </ul>
  );
}
