import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCatalog } from "../catalog.jsx";
import { makeCutout } from "../useCutout.js";
import { formatRs, FREE_DELIVERY_FROM } from "../cart.jsx";
import { shop } from "../data/shop.js";
import Icon from "./Icon.jsx";
import "./HeroSlider.css";

const AUTOPLAY_MS = 6500;
const SWIPE_PX = 50;
const reduceMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const newest = (list) => [...list].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

// floating product photos for a slide: the first three candidates whose photo can be cut out
// (photos not shot on white are skipped, so no white box floats over the slide)
function Floating({ products }) {
  const key = products.map((p) => p.id).join("|");
  const [picked, setPicked] = useState([]);
  useEffect(() => {
    let live = true;
    Promise.all(products.map((p) => makeCutout(p.images[0]).then((src) => (src ? { product: p, src } : null)))).then(
      (res) => live && setPicked(res.filter(Boolean).slice(0, 3)),
    );
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  if (!picked.length) return <img className="hs__seal" src="/seal.png" alt="" />;
  const [main, left, right] = picked;
  return (
    <div className="hs__float">
      <span className="hs__halo" aria-hidden="true" />
      {left && <img src={left.src} alt="" className="hs__item hs__item--left is-cut" draggable="false" />}
      <img src={main.src} alt="" className="hs__item hs__item--main is-cut" draggable="false" />
      {right && <img src={right.src} alt="" className="hs__item hs__item--right is-cut" draggable="false" />}
      <Link to={`/product/${main.product.id}`} className="hs__tag">
        <span>{main.product.name}</span>
        <strong>{formatRs(main.product.price)}</strong>
      </Link>
    </div>
  );
}

export default function HeroSlider() {
  const { products, categories } = useCatalog();
  const withPhoto = useMemo(() => newest(products.filter((p) => p.images?.[0])), [products]);
  const listLink = `https://wa.me/${shop.whatsapp}?text=${encodeURIComponent("Assalam-o-Alaikum, here is my stationery list:")}`;
  const bulkLink = `https://wa.me/${shop.whatsapp}?text=${encodeURIComponent("Assalam-o-Alaikum, I'd like a quote for bulk office stationery:")}`;

  const slides = useMemo(() => {
    const topCats = categories.slice(0, 2);
    const inCat = (c) => withPhoto.filter((p) => p.category === c.id);
    const cheapest = (list) => list.reduce((m, p) => (p.price < m ? p.price : m), Infinity);
    const out = [
      {
        key: "welcome",
        eyebrow: "Est. 1995 · Main Urdu Bazar, Lahore",
        title: (
          <>
            Fine stationery for work, school &amp; <em>the written word</em>
          </>
        ),
        lead: "From smooth everyday ball pens to fountain pens worth gifting — everything your desk needs, chosen with care.",
        cta: { to: "/shop", label: "Shop the collection" },
        cta2: { href: listLink, label: "Send your list" },
        products: withPhoto.slice(0, 6),
        points: ["30+ years serving Lahore", `Free delivery over ${formatRs(FREE_DELIVERY_FROM)}`],
      },
      ...topCats.map((c) => {
        const items = inCat(c);
        const from = cheapest(items);
        return {
          key: `cat-${c.id}`,
          eyebrow: "Shop by collection",
          title: (
            <>
              {c.name}, <em>made to write</em>
            </>
          ),
          lead: `${c.count} ${c.count === 1 ? "product" : "products"} in stock and ready to ship${Number.isFinite(from) ? ` — from ${formatRs(from)}` : ""}.`,
          cta: { to: `/shop?cat=${c.id}`, label: `Shop ${c.name}` },
          products: items.slice(0, 6),
        };
      }),
      {
        key: "bulk",
        eyebrow: "Offices · Schools · Businesses",
        title: (
          <>
            Bulk stationery supply at <em>special prices</em>
          </>
        ),
        lead: "Send us your list on WhatsApp — we'll quote the best rate, pack everything and deliver across Lahore.",
        cta: { href: bulkLink, label: "Get a bulk quote", icon: "chat" },
        cta2: { to: "/contact", label: "Contact us" },
        products: [],
        points: ["Exclusive bulk discounts", "Original, trusted brands", "Fast & reliable delivery"],
      },
    ];
    // the bulk slide shows products the other slides don't, so every slide looks different
    const used = new Set(out.flatMap((sl) => sl.products.slice(0, 3).map((p) => p.id)));
    const fresh = withPhoto.filter((p) => !used.has(p.id));
    out[out.length - 1].products = (fresh.length >= 3 ? fresh : withPhoto).slice(0, 6);
    return out;
  }, [categories, withPhoto, listLink, bulkLink]);

  const n = slides.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0); // restarts the progress bar
  const touch = useRef(null);

  const go = useCallback(
    (i) => {
      setIndex(((i % n) + n) % n);
      setCycle((c) => c + 1);
    },
    [n],
  );

  // autoplay; paused on hover/focus, when the tab is hidden, and for reduced motion
  useEffect(() => {
    if (paused || n < 2 || reduceMotion()) return;
    const t = setTimeout(() => !document.hidden && go(index + 1), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [index, paused, n, go, cycle]);

  if (!n) return null;

  return (
    <section
      className="hs"
      aria-roledescription="carousel"
      aria-label="Highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setPaused(false)}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - (touch.current ?? e.changedTouches[0].clientX);
        if (Math.abs(dx) > SWIPE_PX) go(index + (dx < 0 ? 1 : -1));
        touch.current = null;
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div className="hs__bg" aria-hidden="true" />
      {slides.map((s, i) => {
        const active = i === index;
        return (
          <div
            key={s.key}
            className={"hs__slide" + (active ? " is-active" : "")}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${n}`}
            aria-hidden={!active}
          >
            <div className="container hs__grid">
              <div className="hs__copy">
                <p className="hs__eyebrow">{s.eyebrow}</p>
                {i === 0 ? <h1 className="hs__title">{s.title}</h1> : <h2 className="hs__title">{s.title}</h2>}
                <p className="hs__lead">{s.lead}</p>
                <div className="hs__actions">
                  {s.cta.to ? (
                    <Link to={s.cta.to} className="btn btn--gold btn--lg" tabIndex={active ? 0 : -1}>
                      {s.cta.label} <Icon name="arrow" />
                    </Link>
                  ) : (
                    <a href={s.cta.href} target="_blank" rel="noopener noreferrer" className="btn btn--gold btn--lg" tabIndex={active ? 0 : -1}>
                      {s.cta.icon && <Icon name={s.cta.icon} />} {s.cta.label}
                    </a>
                  )}
                  {s.cta2 &&
                    (s.cta2.to ? (
                      <Link to={s.cta2.to} className="btn btn--lg hs__ghost" tabIndex={active ? 0 : -1}>
                        {s.cta2.label}
                      </Link>
                    ) : (
                      <a href={s.cta2.href} target="_blank" rel="noopener noreferrer" className="btn btn--lg hs__ghost" tabIndex={active ? 0 : -1}>
                        {s.cta2.label}
                      </a>
                    ))}
                </div>
                {s.points && (
                  <ul className="hs__points">
                    {s.points.map((p) => (
                      <li key={p}>
                        <Icon name="check" strokeWidth={2} /> {p}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="hs__media">
                <Floating products={s.products} />
              </div>
            </div>
          </div>
        );
      })}

      {n > 1 && (
        <div className="hs__nav container">
          <div className="hs__dots" role="tablist" aria-label="Choose a slide">
            {slides.map((s, i) => (
              <button
                key={s.key}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}`}
                className={"hs__dot" + (i === index ? " is-active" : "")}
                onClick={() => go(i)}
              >
                {i === index && !paused && !reduceMotion() && <span key={cycle} className="hs__progress" style={{ animationDuration: `${AUTOPLAY_MS}ms` }} />}
              </button>
            ))}
          </div>
          <span className="hs__count" aria-hidden="true">
            {String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
          <div className="hs__arrows">
            <button type="button" className="hs__arrow hs__arrow--prev" onClick={() => go(index - 1)} aria-label="Previous slide">
              <Icon name="arrow" />
            </button>
            <button type="button" className="hs__arrow" onClick={() => go(index + 1)} aria-label="Next slide">
              <Icon name="arrow" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
