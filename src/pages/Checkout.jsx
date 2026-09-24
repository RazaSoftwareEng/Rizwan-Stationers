import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart, formatRs, FREE_DELIVERY_FROM, saveOrder, loadCustomer, saveCustomer, forgetCustomer } from "../cart.jsx";
import { shop } from "../data/shop.js";
import ProductThumb from "../components/ProductThumb.jsx";
import Icon from "../components/Icon.jsx";

const cities = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Other"];

export function Steps({ current }) {
  const steps = ["Cart", "Details", "Confirmed"];
  return (
    <ol className="steps" aria-label="Checkout progress">
      {steps.map((s, i) => (
        <li
          key={s}
          className={"steps__item" + (i < current ? " is-done" : "") + (i === current ? " is-current" : "")}
          aria-current={i === current ? "step" : undefined}
        >
          <span className="steps__dot">{i < current ? <Icon name="check" strokeWidth={2.4} /> : i + 1}</span>
          {s}
        </li>
      ))}
    </ol>
  );
}

function validate(f) {
  const e = {};
  if (f.name.trim().length < 3) e.name = "Please enter your full name.";
  if (!/^(\+92|0)3\d{2}[\s-]?\d{7}$/.test(f.phone.replace(/\s/g, "")))
    e.phone = "Enter a mobile number like 0300 1234567.";
  if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = "That email doesn't look right.";
  if (f.method === "delivery" && f.address.trim().length < 8) e.address = "Please enter your full address.";
  return e;
}

export default function Checkout() {
  const { lines, total, reset } = useCart();
  const navigate = useNavigate();
  const [saved] = useState(loadCustomer);
  const [form, setForm] = useState(() => ({
    name: "",
    phone: "",
    email: "",
    method: "delivery",
    address: "",
    city: "Lahore",
    ...(saved || {}),
    notes: "",
    payment: "cod",
  }));
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!lines.length) {
    return (
      <section className="section">
        <div className="container empty">
          <img src="/seal.png" alt="" width="96" height="96" />
          <h1 className="checkout__empty-title">Your cart is empty</h1>
          <p>Add something to your cart to check out.</p>
          <Link to="/shop" className="btn btn--lg">Browse the shop</Link>
        </div>
      </section>
    );
  }

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    if (errors[k]) setErrors({ ...errors, [k]: undefined });
  };

  const pickup = form.method === "pickup";
  const freeDelivery = pickup || (form.city === "Lahore" && total >= FREE_DELIVERY_FROM);
  const deliveryText = pickup ? "Free (pickup)" : freeDelivery ? "Free" : "Confirmed on call";

  function onSubmit(e) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`co-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setSubmitting(true);
    // TODO(backend): replace with an API call that creates the order and returns its number.
    const order = {
      number: "RS-" + Date.now().toString().slice(-6),
      date: new Date().toISOString(),
      status: "Received",
      customer: form,
      items: lines.map((l) => ({
        id: l.product.id,
        name: l.product.name,
        price: l.product.price,
        qty: l.qty,
        image: l.product.images?.[0] || null,
        category: l.product.category,
      })),
      total,
      delivery: deliveryText,
    };
    saveOrder(order);
    if (remember) {
      const { name, phone, email, method, address, city } = form;
      saveCustomer({ name, phone, email, method, address, city });
    } else {
      forgetCustomer();
    }
    reset();
    navigate(`/order-confirmed?n=${order.number}`);
  }

  const field = (k, label, props = {}) => (
    <label className={"field" + (errors[k] ? " has-error" : "")}>
      <span className="field__label">
        {label}
        {props.optional && <em> (optional)</em>}
      </span>
      {props.textarea ? (
        <textarea id={`co-${k}`} rows={props.rows || 3} value={form[k]} onChange={set(k)} placeholder={props.placeholder} aria-invalid={!!errors[k]} />
      ) : (
        <input
          id={`co-${k}`}
          type={props.type || "text"}
          value={form[k]}
          onChange={set(k)}
          placeholder={props.placeholder}
          autoComplete={props.autoComplete}
          inputMode={props.inputMode}
          aria-invalid={!!errors[k]}
        />
      )}
      {errors[k] && <span className="field__error">{errors[k]}</span>}
    </label>
  );

  return (
    <section className="section section--tight">
      <div className="container">
        <Steps current={1} />
        <h1 className="checkout__title">Checkout</h1>

        <form className="checkout" onSubmit={onSubmit} noValidate>
          <div className="checkout__main">
            <fieldset className="panel">
              <legend className="panel__title">
                <span className="panel__num">1</span> Your details
              </legend>
              {saved && (
                <p className="panel__hint">
                  <Icon name="check" strokeWidth={2} /> We've filled in your details from last time.
                </p>
              )}
              {field("name", "Full name", { autoComplete: "name", placeholder: "e.g. Ali Raza" })}
              <div className="field-row">
                {field("phone", "Mobile number", { type: "tel", autoComplete: "tel", inputMode: "tel", placeholder: "0300 1234567" })}
                {field("email", "Email", { type: "email", autoComplete: "email", optional: true, placeholder: "you@example.com" })}
              </div>
            </fieldset>

            <fieldset className="panel">
              <legend className="panel__title">
                <span className="panel__num">2</span> Delivery
              </legend>
              <div className="choices">
                <label className={"choice" + (!pickup ? " is-active" : "")}>
                  <input type="radio" name="method" value="delivery" checked={!pickup} onChange={set("method")} />
                  <Icon name="truck" />
                  <span>
                    <strong>Home delivery</strong>
                    <small>Free in Lahore over {formatRs(FREE_DELIVERY_FROM)}</small>
                  </span>
                </label>
                <label className={"choice" + (pickup ? " is-active" : "")}>
                  <input type="radio" name="method" value="pickup" checked={pickup} onChange={set("method")} />
                  <Icon name="pin" />
                  <span>
                    <strong>Pick up from shop</strong>
                    <small>Main Urdu Bazar, Lahore</small>
                  </span>
                </label>
              </div>
              {!pickup && (
                <>
                  {field("address", "Full address", { autoComplete: "street-address", placeholder: "House / street, area", textarea: true, rows: 2 })}
                  <label className="field">
                    <span className="field__label">City</span>
                    <select className="select select--field" value={form.city} onChange={set("city")} autoComplete="address-level2">
                      {cities.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                </>
              )}
              {field("notes", "Order notes", { textarea: true, optional: true, placeholder: "Anything we should know? e.g. school list, delivery timing" })}
            </fieldset>

            <fieldset className="panel">
              <legend className="panel__title">
                <span className="panel__num">3</span> Payment
              </legend>
              <div className="choices">
                <label className={"choice" + (form.payment === "cod" ? " is-active" : "")}>
                  <input type="radio" name="payment" value="cod" checked={form.payment === "cod"} onChange={set("payment")} />
                  <Icon name="box" />
                  <span>
                    <strong>{pickup ? "Pay at the shop" : "Cash on delivery"}</strong>
                    <small>Pay when you receive your order</small>
                  </span>
                </label>
                <div className="choice is-disabled" aria-disabled="true">
                  <Icon name="shield" />
                  <span>
                    <strong>Card / JazzCash / EasyPaisa</strong>
                    <small>Coming soon</small>
                  </span>
                </div>
              </div>
            </fieldset>
          </div>

          <aside className="summary checkout__summary">
            <h2>Order summary</h2>
            <ul className="summary__items">
              {lines.map(({ product, qty }) => (
                <li key={product.id}>
                  <span className="summary__thumb">
                    <ProductThumb product={product} />
                    <span className="summary__qty">{qty}</span>
                  </span>
                  <span className="summary__name">{product.name}</span>
                  <span className="summary__price">{formatRs(product.price * qty)}</span>
                </li>
              ))}
            </ul>
            <dl>
              <div><dt>Subtotal</dt><dd>{formatRs(total)}</dd></div>
              <div><dt>Delivery</dt><dd>{deliveryText}</dd></div>
              <div className="summary__total"><dt>Total</dt><dd>{formatRs(total)}</dd></div>
            </dl>
            <label className="remember">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Save my details for next time
            </label>
            <button type="submit" className="btn btn--gold btn--lg btn--block" disabled={submitting}>
              {submitting ? "Placing order…" : `Place order — ${formatRs(total)}`}
            </button>
            <p className="summary__note">
              <Icon name="phone" /> We'll call you on your number to confirm the order before dispatch.
            </p>
            <Link to="/cart" className="text-btn">← Back to cart</Link>
          </aside>
        </form>
        <p className="checkout__help">
          Need help? Call or WhatsApp <a href={`tel:${shop.phone.replace(/\s/g, "")}`}>{shop.phone}</a>
        </p>
      </div>
    </section>
  );
}
