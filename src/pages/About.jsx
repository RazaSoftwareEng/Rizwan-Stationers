import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import Icon from "../components/Icon.jsx";
import CategoryIcon from "../components/CategoryIcon.jsx";
import { categories } from "../data/products.js";
import { shop } from "../data/shop.js";

const values = [
  { icon: "shield", title: "Quality we'd use ourselves", text: "If a pen skips or a notebook tears, it doesn't stay on our shelves." },
  { icon: "box", title: "Fair, honest prices", text: "Market rates on everyday items and better rates on bulk orders." },
  { icon: "chat", title: "Help at the counter", text: "Bring your school or office list — we'll put it together for you." },
];

const facts = [
  { value: "1995", label: "Year we opened" },
  { value: "30+", label: "Years in Urdu Bazar" },
  { value: String(categories.length), label: "Collections" },
  { value: String(categories.reduce((n, c) => n + c.subs.length, 0)), label: "Product ranges" },
];

export default function About() {
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    "Rizwan Stationers, " + shop.address,
  )}`;

  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="A Lahore stationer since 1995"
        lead="Stationery & fine writing from the heart of Urdu Bazar — chosen with care for three decades."
      />

      {/* ---- story ---- */}
      <section className="section">
        <div className="container story">
          <div className="story__seal">
            <img src="/seal.png" alt="Rizwan Stationer seal — Est. 1995" width="280" height="280" />
          </div>
          <div className="story__text">
            <p className="eyebrow">Our story</p>
            <h2>Written into the neighbourhood</h2>
            <p>
              Rizwan Stationer opened its doors in Lahore's Urdu Bazar in 1995 with a
              simple idea: good stationery should be easy to find and fairly priced.
              Since then we've filled countless school lists, stocked offices across
              the city, and helped many a writer find their first fountain pen.
            </p>
            <p>
              Today our shelves carry everything from everyday registers to fine
              writing instruments — but we still believe the best part of the shop is
              the counter, where you can ask, try and choose.
            </p>
          </div>
        </div>
      </section>

      {/* ---- facts ---- */}
      <section className="facts" aria-label="Rizwan Stationer in numbers">
        <div className="container facts__grid">
          {facts.map((f) => (
            <div key={f.label} className="fact">
              <strong>{f.value}</strong>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---- values ---- */}
      <section className="section section--paper">
        <div className="container">
          <div className="section__head section__head--center">
            <p className="eyebrow">What we stand for</p>
            <h2>Our promise</h2>
          </div>
          <div className="values">
            {values.map((v) => (
              <div key={v.title} className="value">
                <Icon name={v.icon} className="value__icon" />
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- what we stock ---- */}
      <section className="section">
        <div className="container">
          <div className="section__head section__head--center">
            <p className="eyebrow">What we stock</p>
            <h2>Four collections, one counter</h2>
          </div>
          <div className="stock">
            {categories.map((c) => (
              <div key={c.id} className="stock__col">
                <Link to={`/shop?cat=${c.id}`} className="stock__head">
                  <span className={`art__ring art--${c.id}`}>
                    <CategoryIcon category={c.id} />
                  </span>
                  {c.name}
                </Link>
                <ul>
                  {c.subs.map((s) => (
                    <li key={s.id}>
                      <Link to={`/shop?cat=${c.id}&sub=${s.id}`}>{s.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- visit ---- */}
      <section className="section section--tight-top">
        <div className="container">
          <div className="cta-band">
            <div>
              <h2>Visit us in Urdu Bazar</h2>
              <p>{shop.address} · {shop.hours}</p>
            </div>
            <div className="cta-band__actions">
              <a href={mapLink} target="_blank" rel="noopener noreferrer" className="btn btn--gold btn--lg">
                <Icon name="pin" />
                Get directions
              </a>
              <Link to="/contact" className="btn btn--light btn--lg">
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
