import { Link, useSearchParams } from "react-router-dom";
import { formatRs, loadOrder } from "../cart.jsx";
import { shop } from "../data/shop.js";
import Icon from "../components/Icon.jsx";
import { OrderItems, StatusTrack } from "../components/OrderParts.jsx";
import { Steps } from "./Checkout.jsx";

export function orderWhatsAppLink(order) {
  const c = order.customer;
  const text =
    `Assalam-o-Alaikum, my order ${order.number}:\n` +
    order.items.map((i) => `• ${i.name} × ${i.qty}`).join("\n") +
    `\nTotal: ${formatRs(order.total)}\nName: ${c.name}\nPhone: ${c.phone}` +
    (c.method === "pickup" ? "\nPickup from shop" : `\nAddress: ${c.address}, ${c.city}`) +
    (c.notes ? `\nNotes: ${c.notes}` : "");
  return `https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(text)}`;
}

export default function OrderConfirmed() {
  const [params] = useSearchParams();
  const order = loadOrder(params.get("n"));

  if (!order) {
    return (
      <section className="section">
        <div className="container empty">
          <p>We couldn't find that order.</p>
          <Link to="/orders" className="btn btn--lg">My orders</Link>
        </div>
      </section>
    );
  }

  const c = order.customer;
  const pickup = c.method === "pickup";

  return (
    <section className="section section--tight">
      <div className="container confirm">
        <Steps current={2} />
        <div className="confirm__card">
          <span className="confirm__icon">
            <Icon name="check" strokeWidth={2.4} />
          </span>
          <p className="eyebrow">Order placed</p>
          <h1>Thank you, {c.name.split(" ")[0]}!</h1>
          <p className="confirm__lead">
            Your order <strong>{order.number}</strong> has been received. We'll call you on{" "}
            <strong>{c.phone}</strong> to confirm it
            {pickup ? " and let you know when it's ready to collect." : " before dispatch."}
          </p>

          <StatusTrack status={order.status} pickup={pickup} />

          <OrderItems items={order.items} total={order.total} delivery={order.delivery} />

          <div className="confirm__details">
            <div>
              <p className="confirm__label">{pickup ? "Pickup" : "Delivery to"}</p>
              <p>{pickup ? shop.address : `${c.address}, ${c.city}`}</p>
            </div>
            <div>
              <p className="confirm__label">Payment</p>
              <p>{pickup ? "Pay at the shop" : "Cash on delivery"}</p>
            </div>
          </div>

          <div className="confirm__actions">
            <a className="btn btn--gold btn--lg" href={orderWhatsAppLink(order)} target="_blank" rel="noopener noreferrer">
              <Icon name="chat" /> Send order on WhatsApp
            </a>
            <Link to="/orders" className="btn btn--ghost btn--lg">My orders</Link>
          </div>
          <Link to="/shop" className="text-btn">Continue shopping</Link>
        </div>
      </div>
    </section>
  );
}
