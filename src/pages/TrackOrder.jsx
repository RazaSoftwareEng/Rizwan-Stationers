import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSeo } from "../seo.js";
import PageHeader from "../components/PageHeader.jsx";
import Icon from "../components/Icon.jsx";
import { OrderItems, StatusTrack, formatOrderDate } from "../components/OrderParts.jsx";
import { ordersEnabled, trackOrder } from "../orders.js";
import { shop } from "../data/shop.js";
import InvoiceButton from "../components/InvoiceButton.jsx";

const NUMBER = /^RS-[\w-]{3,20}$/i;

export default function TrackOrder() {
  useSeo({
    title: "Track Your Order",
    description: "Check the status of your Rizwan Stationer order with your order number and phone number.",
    path: "/track",
  });
  const [params, setParams] = useSearchParams();
  const [number, setNumber] = useState(params.get("n") || "");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState({ status: "idle" }); // idle | loading | found | missing | error
  const [errors, setErrors] = useState({});

  // pre-fill from the link in the confirmation email
  useEffect(() => {
    const n = params.get("n");
    if (n) setNumber(n);
  }, [params]);

  async function onSubmit(e) {
    e.preventDefault();
    const found = {};
    if (!NUMBER.test(number.trim())) found.number = "Enter your order number, like RS-26-10001.";
    if (phone.replace(/\D/g, "").length < 10) found.phone = "Enter the phone number used for the order.";
    setErrors(found);
    if (Object.keys(found).length) return;
    setState({ status: "loading" });
    setParams({ n: number.trim().toUpperCase() }, { replace: true });
    try {
      const order = await trackOrder(number, phone);
      setState(order ? { status: "found", order } : { status: "missing" });
    } catch (err) {
      setState({ status: "error", message: err.message });
    }
  }

  const order = state.order;
  const pickup = order?.customer.method === "pickup";
  const cancelled = order?.status === "Cancelled";

  return (
    <>
      <PageHeader eyebrow="Your order" title="Track your order" lead="Enter your order number and the phone number you ordered with." />
      <section className="section section--tight">
        <div className="container track-page">
          {!ordersEnabled ? (
            <div className="empty">
              <p>Online order tracking isn't available yet.</p>
              <a className="btn btn--lg" href={`https://wa.me/${shop.whatsapp}`} target="_blank" rel="noopener noreferrer">
                Ask us on WhatsApp
              </a>
            </div>
          ) : (
            <>
              <form className="track-form" onSubmit={onSubmit} noValidate>
                <label className={"field" + (errors.number ? " has-error" : "")}>
                  <span className="field__label">Order number</span>
                  <input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="RS-26-10001" autoCapitalize="characters" spellCheck="false" />
                  {errors.number && <span className="field__error">{errors.number}</span>}
                </label>
                <label className={"field" + (errors.phone ? " has-error" : "")}>
                  <span className="field__label">Phone number</span>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0300 1234567" inputMode="tel" autoComplete="tel" />
                  {errors.phone && <span className="field__error">{errors.phone}</span>}
                </label>
                <button type="submit" className="btn btn--gold btn--lg" disabled={state.status === "loading"}>
                  <Icon name="search" />
                  {state.status === "loading" ? "Checking…" : "Track order"}
                </button>
              </form>

              {state.status === "missing" && (
                <div className="track-result track-result--empty" role="status">
                  <p>
                    <strong>No order found.</strong> Check the order number and use the same phone number you ordered with.
                  </p>
                  <a href={`https://wa.me/${shop.whatsapp}`} target="_blank" rel="noopener noreferrer">
                    Still stuck? Ask us on WhatsApp
                  </a>
                </div>
              )}
              {state.status === "error" && (
                <div className="track-result track-result--empty" role="alert">
                  <p>{state.message}</p>
                </div>
              )}

              {state.status === "found" && (
                <div className="track-result" role="status">
                  <div className="track-result__head">
                    <div>
                      <p className="eyebrow">Order {order.number}</p>
                      <h2>{cancelled ? "This order was cancelled" : `Hi ${order.customer.name}, your order is ${order.status.toLowerCase()}`}</h2>
                      <p className="muted">
                        Placed {formatOrderDate(order.date)}
                        {order.updated && order.updated !== order.date ? ` · updated ${formatOrderDate(order.updated)}` : ""}
                      </p>
                    </div>
                    <span className={`order-status order-status--${order.status.toLowerCase()}`}>{order.status}</span>
                  </div>
                  {!cancelled && <StatusTrack status={order.status} pickup={pickup} />}
                  <OrderItems items={order.items} total={order.total} delivery={order.delivery} />
                  <InvoiceButton order={order} className="btn btn--ghost track-result__invoice" />
                  <p className="muted track-result__help">
                    Questions about this order? Call <a href={`tel:${shop.phone.replace(/\s/g, "")}`}>{shop.phone}</a> or{" "}
                    <a href={`https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(`Assalam-o-Alaikum, about my order ${order.number}:`)}`} target="_blank" rel="noopener noreferrer">
                      message us on WhatsApp
                    </a>
                    .
                  </p>
                </div>
              )}

              <p className="muted track-page__foot">
                Ordered on this device? See <Link to="/orders">My orders</Link>.
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
