import { useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import Icon from "../components/Icon.jsx";
import { shop } from "../data/shop.js";

export default function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // no backend yet: the form hands the message to WhatsApp
  function onSubmit(e) {
    e.preventDefault();
    const text = `Assalam-o-Alaikum, I'm ${form.name} (${form.phone}).\n${form.message}`;
    window.open(`https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }

  const info = [
    { icon: "pin", label: "Visit", value: shop.address },
    { icon: "clock", label: "Open", value: shop.hours },
    { icon: "phone", label: "Call", value: shop.phone, href: `tel:${shop.phone.replace(/\s/g, "")}` },
    { icon: "mail", label: "Email", value: shop.email, href: `mailto:${shop.email}` },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="We'd love to hear from you"
        lead="Come by the shop, call us, or send your list — we usually reply within the hour during opening times."
      />

      <section className="section">
        <div className="container contact">
          <ul className="info">
            {info.map((i) => (
              <li key={i.label} className="info__card">
                <span className="info__icon">
                  <Icon name={i.icon} />
                </span>
                <div>
                  <p className="info__label">{i.label}</p>
                  {i.href ? <a href={i.href}>{i.value}</a> : <p>{i.value}</p>}
                </div>
              </li>
            ))}
          </ul>

          <form className="form" onSubmit={onSubmit}>
            <h2>Send a message</h2>
            <p className="muted">Your message opens in WhatsApp, ready to send.</p>
            <div className="form__row">
              <label>
                Your name
                <input name="name" required value={form.name} onChange={update} autoComplete="name" />
              </label>
              <label>
                Phone
                <input name="phone" type="tel" required value={form.phone} onChange={update} autoComplete="tel" placeholder="03xx xxxxxxx" />
              </label>
            </div>
            <label>
              Message
              <textarea name="message" rows="5" required value={form.message} onChange={update} placeholder="What can we help you with?" />
            </label>
            <button className="btn btn--lg" type="submit">
              <Icon name="chat" />
              Send on WhatsApp
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
