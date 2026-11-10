import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCatalog } from "../catalog.jsx";
import { formatRs, FREE_DELIVERY_FROM } from "../cart.jsx";
import { shop } from "../data/shop.js";
import Icon from "./Icon.jsx";
import "./Marquee.css";

// Two ribbons of moving text: the shop's story slides left, deals slide right.
// The ribbons slow down under the mouse and can be dragged
// (with a little momentum). Each track holds its list twice so the loop is seamless.
const about = [
  <>Est. <em>1995</em></>,
  <>Main Urdu Bazar, <em>Lahore</em></>,
  <><em>30+ years</em> of trusted service</>,
  <>A family-run stationer</>,
  <>Only <em>original</em> brands</>,
  <>Schools · Offices · Homes</>,
];
const SPEEDS = [-55, 65]; // px per second; story goes left, deals go right
const reduceMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const Star = () => (
  <svg className="mq__star" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" />
  </svg>
);

function Track({ children, label, trackRef }) {
  return (
    <div className="mq__track" ref={trackRef}>
      <ul className="mq__list" aria-label={label}>
        {children}
      </ul>
      <ul className="mq__list" aria-hidden="true" inert>
        {children}
      </ul>
    </div>
  );
}

export default function Marquee() {
  const { products, categories } = useCatalog();
  const wa = (text) => `https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(text)}`;
  const root = useRef(null);
  const story = useRef(null);
  const deals = useRef(null);
  const st = useRef({ hover: false, down: false, dragging: false, lastX: 0, lastT: 0, moved: 0, push: 0, vx: 0, suppress: false });
  const [grab, setGrab] = useState(false);

  // animation loop: auto-scroll + drag + momentum
  useEffect(() => {
    const els = [story.current, deals.current];
    const pos = [0, 0];
    const s = st.current;
    const still = reduceMotion();
    let last = performance.now();
    let raf;
    const tick = (t) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const momentum = s.dragging ? 0 : s.vx * dt;
      if (!s.dragging) s.vx *= Math.pow(0.04, dt); // ease the fling out
      els.forEach((el, i) => {
        if (!el) return;
        const w = el.firstElementChild.offsetWidth;
        if (!w) return;
        const auto = still || s.dragging ? 0 : SPEEDS[i] * (s.hover ? 0.25 : 1) * dt;
        pos[i] += auto + s.push + momentum;
        pos[i] = (((pos[i] % w) - w) % w); // keep within (-w, 0]
        el.style.transform = `translate3d(${pos[i]}px,0,0)`;
      });
      s.push = 0;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const move = (e) => {
      if (!s.down) return;
      const dx = e.clientX - s.lastX;
      const now = performance.now();
      s.moved += Math.abs(dx);
      if (s.moved > 5 && !s.dragging) {
        s.dragging = true;
        setGrab(true);
      }
      if (s.dragging) {
        s.push += dx;
        s.vx = (dx / Math.max(1, now - s.lastT)) * 1000;
      }
      s.lastX = e.clientX;
      s.lastT = now;
    };
    const up = () => {
      if (!s.down) return;
      s.down = false;
      s.suppress = s.moved > 5; // a drag shouldn't also open a link
      s.dragging = false;
      setGrab(false);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  const dealList = useMemo(() => {
    const fromPrice = categories.slice(0, 3).flatMap((c) => {
      const prices = products.filter((p) => p.category === c.id && p.price > 0).map((p) => p.price);
      return prices.length ? [{ icon: "check", text: `${c.name} from ${formatRs(Math.min(...prices))}`, to: `/shop?cat=${c.id}` }] : [];
    });
    return [
      { icon: "truck", text: `Free delivery over ${formatRs(FREE_DELIVERY_FROM)}`, to: "/shop" },
      ...fromPrice.slice(0, 1),
      { icon: "box", text: "Bulk discounts for schools & offices", href: wa("Assalam-o-Alaikum, I'd like a quote for bulk stationery:") },
      ...fromPrice.slice(1),
      { icon: "chat", text: `Order on WhatsApp · ${shop.phone}`, href: wa("Assalam-o-Alaikum, here is my stationery list:") },
      { icon: "shield", text: "Genuine products, honest prices", to: "/about" },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, categories]);

  const aboutItems = [...about, ...about].map((a, i) => (
    <li key={i} className="mq__item">
      <span>{a}</span>
      <Star />
    </li>
  ));
  const dealItems = [...dealList, ...dealList].map((d, i) => {
    const body = (
      <>
        <span className="mq__icon">
          <Icon name={d.icon} />
        </span>
        {d.text}
      </>
    );
    return (
      <li key={i} className="mq__item">
        {d.to ? (
          <Link to={d.to} className="mq__deal" draggable={false}>
            {body}
          </Link>
        ) : (
          <a href={d.href} target="_blank" rel="noopener noreferrer" className="mq__deal" draggable={false}>
            {body}
          </a>
        )}
        <span className="mq__dot" aria-hidden="true" />
      </li>
    );
  });

  return (
    <section
      ref={root}
      className={"mq" + (grab ? " is-dragging" : "")}
      aria-label="About us and current offers"
      onPointerEnter={() => (st.current.hover = true)}
      onPointerLeave={() => (st.current.hover = false)}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        const s = st.current;
        s.down = true;
        s.moved = 0;
        s.vx = 0;
        s.lastX = e.clientX;
        s.lastT = performance.now();
      }}
      onClickCapture={(e) => {
        if (st.current.suppress) {
          e.preventDefault();
          e.stopPropagation();
          st.current.suppress = false;
        }
      }}
    >
      <div className="mq__band mq__band--story">
        <Track label="About Rizwan Stationer" trackRef={story}>
          {aboutItems}
        </Track>
      </div>
      <div className="mq__band mq__band--deals">
        <Track label="Offers" trackRef={deals}>
          {dealItems}
        </Track>
      </div>
    </section>
  );
}
