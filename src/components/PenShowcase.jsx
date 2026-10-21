import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCatalog, stockStatus } from "../catalog.jsx";
import { showcase } from "../data/showcase.js";
import { useCart, formatRs } from "../cart.jsx";
import { flyToCart } from "../flyToCart.js";
import Icon from "./Icon.jsx";
import "./PenShowcase.css";

// How much page scroll (in vh) moves the row by one pen.
const STEP_VH = 24;
// Smoothing: share of the remaining distance covered each frame.
const EASE = 0.12;
// Below this much free screen height (px, under the header) the section isn't pinned:
// it scrolls like a normal section and the row is turned with arrows or a swipe.
const MIN_PIN_HEIGHT = 500;
const SWIPE_PX = 40;


// signed distance from position `pos`, wrapped so the row loops (-n/2..n/2)
function wrap(d, n) {
  d %= n;
  if (d > n / 2) d -= n;
  if (d < -n / 2) d += n;
  return d;
}
const mod = (a, n) => ((a % n) + n) % n;
const clamp01 = (v) => Math.min(1, Math.max(0, v));

const reduceMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Shows the pens that exist in the shop (matched by name); hidden when none do.
export default function PenShowcase() {
  const { products, findByName } = useCatalog();
  const items = useMemo(
    () => showcase.map((s) => ({ ...s, product: findByName(s.name) })).filter((s) => s.product),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [products],
  );
  if (!items.length) return null;
  return <Showcase items={items} />;
}

// The section is pinned while the page scrolls past it; scroll progress turns the pen row.
function Showcase({ items }) {
  const { categories } = useCatalog();
  const n = items.length;
  const start = Math.floor(n / 2); // middle entry first
  const [active, setActive] = useState(start);
  const [progress, setProgress] = useState(0);
  const pinRef = useRef(null);
  const panelRef = useRef(null);
  const stageRef = useRef(null);
  const slideRefs = useRef([]);
  const pos = useRef(start);
  const target = useRef(start);
  const frame = useRef(0);
  const kick = useRef(() => {});
  const swipe = useRef(null);
  const [pinned, setPinned] = useState(true);
  const pinnedRef = useRef(true);
  const navigate = useNavigate();
  const { add, qtyOf } = useCart();

  const headerHeight = () => document.querySelector(".header")?.offsetHeight || 0;

  // place every slide for a (fractional) position
  const paint = useCallback(
    (p) => {
      slideRefs.current.forEach((el, i) => {
        if (!el) return;
        const d = wrap(i - p, n);
        const abs = Math.abs(d);
        // fade out away from the middle; slides wrap around while invisible
        const opacity = Math.max(0, 1 - abs * 0.24);
        el.style.setProperty("--d", d.toFixed(4));
        el.style.setProperty("--abs", abs.toFixed(4));
        el.style.opacity = opacity.toFixed(3);
        el.style.visibility = opacity > 0.01 ? "" : "hidden";
        el.style.zIndex = String(100 - Math.round(abs * 10));
      });
      const a = mod(Math.round(p), n);
      setActive((cur) => (cur === a ? cur : a));
    },
    [n]
  );

  // page scroll → target position
  const readScroll = useCallback(() => {
    const pin = pinRef.current;
    const panel = panelRef.current;
    if (!pin || !panel) return;
    const top = headerHeight();
    panel.style.setProperty("--pin-top", `${top}px`);
    const canPin = window.innerHeight - top >= MIN_PIN_HEIGHT;
    if (canPin !== pinnedRef.current) {
      pinnedRef.current = canPin;
      setPinned(canPin);
    }
    if (!canPin) return;
    const total = pin.offsetHeight - panel.offsetHeight;
    const p = total > 0 ? clamp01((top - pin.getBoundingClientRect().top) / total) : 0;
    setProgress(p);
    target.current = start + p * (n - 1);
  }, [n, start]);

  useEffect(() => {
    const tick = () => {
      const diff = target.current - pos.current;
      if (Math.abs(diff) < 0.0005 || reduceMotion()) pos.current = target.current;
      else pos.current += diff * EASE;
      paint(pos.current);
      frame.current = pos.current === target.current ? 0 : requestAnimationFrame(tick);
    };
    const onScroll = () => {
      readScroll();
      if (!frame.current) frame.current = requestAnimationFrame(tick);
    };
    kick.current = () => {
      if (!frame.current) frame.current = requestAnimationFrame(tick);
    };
    readScroll();
    pos.current = target.current;
    paint(pos.current);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [paint, readScroll]);

  // scroll the page so pen `i` sits in the middle
  const scrollToSlide = useCallback(
    (i) => {
      const pin = pinRef.current;
      const panel = panelRef.current;
      if (!pin || !panel) return;
      if (!pinnedRef.current) {
        // not pinned: turn the row the short way round
        target.current = pos.current + wrap(i - pos.current, n);
        kick.current();
        return;
      }
      const step = mod(i - start, n); // 0..n-1 along the scroll track
      const total = pin.offsetHeight - panel.offsetHeight;
      const pinTop = window.scrollY + pin.getBoundingClientRect().top - headerHeight();
      window.scrollTo({ top: pinTop + (step / (n - 1)) * total, behavior: reduceMotion() ? "auto" : "smooth" });
    },
    [n, start]
  );
  const next = () => scrollToSlide(active + 1);
  const prev = () => scrollToSlide(active - 1);

  if (!n) return null;

  const current = items[active];
  const product = current.product;
  const category = categories.find((c) => c.id === product.category);
  const status = stockStatus(product);
  const soldOut = status.kind === "out";
  const maxed = product.stock != null && qtyOf(product.id) >= product.stock;

  // gentle 3D tilt that follows the pointer
  function onPointerMove(e) {
    const el = stageRef.current;
    if (!el || reduceMotion()) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    el.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  }
  function onPointerLeave() {
    stageRef.current?.style.setProperty("--px", 0);
    stageRef.current?.style.setProperty("--py", 0);
  }
  // swipe left/right when the section isn't pinned (pinned: page scroll turns the row)
  function onPointerDown(e) {
    swipe.current = pinned ? null : { x: e.clientX, moved: false };
  }
  function onPointerUp(e) {
    const sw = swipe.current;
    if (!sw) return;
    const dx = e.clientX - sw.x;
    if (Math.abs(dx) >= SWIPE_PX) {
      sw.moved = true;
      if (dx < 0) next();
      else prev();
    }
  }
  function onSlideClick(i, e) {
    e.preventDefault();
    if (swipe.current?.moved) return;
    if (i === active) navigate(`/product/${items[i].product.id}`);
    else scrollToSlide(i);
  }
  function onKeyDown(e) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  }
  function addToCart() {
    if (soldOut || maxed) return;
    flyToCart(slideRefs.current[active]?.querySelector("img"));
    add(product.id, 1, { silent: true });
  }

  return (
    <section
      className={"pens-pin section--navy" + (pinned ? "" : " pens-pin--static")}
      ref={pinRef}
      aria-labelledby="pens-title"
      style={pinned ? { height: `calc(100svh + ${(n - 1) * STEP_VH}vh)` } : undefined}
    >
      <div className="pens" ref={panelRef} style={{ "--glow": current.glow }}>
        <div className="pens__glow" aria-hidden="true" />
        <div className="container pens__inner">
          <div className="section__head section__head--center pens__head">
            <p className="eyebrow eyebrow--gold">The Pen Studio</p>
            <h2 id="pens-title">Find the pen that writes like you</h2>
            <p className="section__lead">
              From everyday rollerballs to a fountain pen worth gifting — scroll to browse our writing counter.
            </p>
          </div>

          <div
            className="pens__stage"
            ref={stageRef}
            role="region"
            aria-roledescription="carousel"
            aria-label="Featured pens"
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          >
            <div className="pens__track">
              {items.map((it, i) => (
                <a
                  key={it.id}
                  ref={(el) => (slideRefs.current[i] = el)}
                  href={`/product/${it.product.id}`}
                  className={"pens__slide" + (i === active ? " is-active" : "")}
                  style={{ "--size": it.size || 1, "--i": i }}
                  onClick={(e) => onSlideClick(i, e)}
                  onDragStart={(e) => e.preventDefault()}
                  tabIndex={-1}
                  aria-hidden={i !== active}
                  aria-label={i === active ? `View ${it.product.name}` : undefined}
                >
                  <span className="pens__float">
                    <img src={it.img} alt="" draggable="false" />
                  </span>
                </a>
              ))}
            </div>
            <div className="pens__floor" aria-hidden="true" />

            <button type="button" className="pens__nav pens__nav--prev" onClick={prev} aria-label="Previous pen">
              <Icon name="arrow" />
            </button>
            <button type="button" className="pens__nav pens__nav--next" onClick={next} aria-label="Next pen">
              <Icon name="arrow" />
            </button>

            <p className={"pens__hint" + (!pinned || progress > 0.02 ? " is-hidden" : "")} aria-hidden="true">
              <span className="pens__mouse" />
              Scroll to explore
            </p>
          </div>

          <div className="pens__info" aria-live="polite">
            <div className="pens__text" key={product.id}>
              <p className="pens__cat">{category?.name}</p>
              <h3 className="pens__name">{product.name}</h3>
              <p className="pens__price">
                {formatRs(product.price)}
                <span className={`stock-badge stock-badge--${status.kind}`}>
                  <span className="stock-badge__dot" aria-hidden="true" />
                  {status.label}
                </span>
              </p>
            </div>
            <div className="pens__actions">
              <Link to={`/product/${product.id}`} className="btn btn--ghost pens__details">
                View details
              </Link>
              <button type="button" className="btn btn--gold" onClick={addToCart} disabled={soldOut || maxed}>
                <Icon name="bag" />
                {soldOut ? "Out of stock" : maxed ? "Max in cart" : "Add to cart"}
              </button>
            </div>

            <div className="pens__bar" aria-hidden="true">
              <span style={{ transform: `scaleX(${pinned ? progress : mod(active - start, n) / (n - 1)})` }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
