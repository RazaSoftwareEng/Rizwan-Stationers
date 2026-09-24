import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCart, formatRs } from "../cart.jsx";
import { products } from "../data/products.js";
import { DESK_IMAGE, deskSpots } from "../data/deskSpots.js";
import ProductThumb from "./ProductThumb.jsx";
import Icon from "./Icon.jsx";
import "./ShopTheDesk.css";

const pct = (v, total) => `${(v / total) * 100}%`;

// Resolve products once; drop any spot whose product id doesn't exist.
const spots = deskSpots
  .map((s) => ({ ...s, product: products.find((p) => p.id === s.id) }))
  .filter((s) => s.product);

// Big areas first so smaller items sitting on top of them stay hoverable.
const byAreaDesc = [...spots].sort(
  (a, b) => (b.box[2] - b.box[0]) * (b.box[3] - b.box[1]) - (a.box[2] - a.box[0]) * (a.box[3] - a.box[1]),
);

export default function ShopTheDesk() {
  const { add, qtyOf } = useCart();
  const [active, setActive] = useState(null);
  // where the price tag sits: follows the mouse, or pins to a dot for keyboard focus
  const [tag, setTag] = useState(null); // { x, y, flip }
  const [touch, setTouch] = useState(false);
  const stage = useRef(null);

  const W = DESK_IMAGE.width;
  const H = DESK_IMAGE.height;
  const current = spots.find((s) => s.id === active);

  function placeTag(clientX, clientY) {
    const r = stage.current.getBoundingClientRect();
    const x = clientX - r.left;
    const y = clientY - r.top;
    setTag({ x, y, flipX: x > r.width - 260, flipY: y > r.height - 110 });
  }
  function onMove(e) {
    if (e.pointerType === "touch") return;
    placeTag(e.clientX, e.clientY);
  }
  function onPointerDown(e) {
    setTouch(e.pointerType === "touch");
  }
  // mouse: click adds to cart · touch: tap shows the price card below the photo
  function onPick(id) {
    if (touch) setActive(active === id ? null : id);
    else add(id);
  }
  function onDotFocus(s) {
    setActive(s.id);
    const r = stage.current.getBoundingClientRect();
    setTag({ x: (s.dot[0] / W) * r.width, y: (s.dot[1] / H) * r.height, flipX: s.dot[0] / W > 0.75, flipY: s.dot[1] / H > 0.85 });
  }

  return (
    <section className="section desk" aria-labelledby="desk-title">
      <div className="container">
        <div className="section__head section__head--center">
          <p className="eyebrow">Shop the desk</p>
          <h2 id="desk-title">Everything on this desk, in one place</h2>
          <p className="section__lead">Point at any item to see its price — click to add it to your cart.</p>
        </div>

        <div className="desk__scroll">
        <div
          ref={stage}
          className={"desk__stage" + (current ? " has-active" : "")}
          onPointerMove={onMove}
          onPointerDown={onPointerDown}
          onMouseLeave={() => {
            if (!touch) {
              setActive(null);
              setTag(null);
            }
          }}
        >
          <div className="desk__photo" style={{ aspectRatio: `${W} / ${H}` }}>
            <img src={DESK_IMAGE.src} alt="A tidy office desk with an organiser, notebook, pen, stapler, paper clips, sticky notes and box files" width={W} height={H} loading="lazy" />
            {byAreaDesc.map((s) => (
              <span
                key={s.id}
                className={"desk__area" + (active === s.id ? " is-active" : "")}
                style={{
                  left: pct(s.box[0], W),
                  top: pct(s.box[1], H),
                  width: pct(s.box[2] - s.box[0], W),
                  height: pct(s.box[3] - s.box[1], H),
                }}
                onMouseEnter={() => !touch && setActive(s.id)}
                onClick={() => onPick(s.id)}
                aria-hidden="true"
              />
            ))}
          </div>

          {spots.map((s) => (
            <button
              key={s.id}
              type="button"
              className={"desk__dot" + (active === s.id ? " is-active" : "")}
              style={{ left: pct(s.dot[0], W), top: pct(s.dot[1], H) }}
              onMouseEnter={() => !touch && setActive(s.id)}
              onFocus={() => onDotFocus(s)}
              onBlur={() => {
                setActive(null);
                setTag(null);
              }}
              onClick={() => onPick(s.id)}
              aria-label={`${s.product.name}, ${formatRs(s.product.price)} — add to cart`}
            >
              <span />
            </button>
          ))}

          {/* price tag that follows the cursor */}
          {current && tag && !touch && (
            <div
              className={"desk__tag" + (tag.flipX ? " flip-x" : "") + (tag.flipY ? " flip-y" : "")}
              style={{ left: tag.x, top: tag.y }}
              aria-hidden="true"
            >
              <span className="desk__tag-name">{current.product.name}</span>
              <span className="desk__tag-price">{formatRs(current.product.price)}</span>
              <span className="desk__tag-hint">
                <Icon name="bag" />
                {qtyOf(current.id) ? `In cart (${qtyOf(current.id)}) · click to add more` : "Click to add to cart"}
              </span>
            </div>
          )}
        </div>
        </div>
        <p className="desk__swipe">Swipe to see the whole desk →</p>

        {/* touch devices: tapped item's card sits under the photo */}
        {touch && current && (
          <div className="desk__card" role="dialog" aria-label={current.product.name}>
            <ProductThumb product={current.product} className="desk__card-thumb" />
            <div className="desk__card-body">
              <p className="desk__card-name">{current.product.name}</p>
              <p className="desk__card-price">{formatRs(current.product.price)}</p>
              <div className="desk__card-actions">
                <button type="button" className="btn btn--gold desk__card-add" onClick={() => add(current.id)}>
                  <Icon name="bag" />
                  {qtyOf(current.id) ? `Add another (${qtyOf(current.id)})` : "Add to cart"}
                </button>
                <Link to={`/product/${current.id}`} className="desk__card-link">
                  Details <Icon name="arrow" />
                </Link>
              </div>
            </div>
            <button type="button" className="icon-btn desk__card-close" onClick={() => setActive(null)} aria-label="Close">
              <Icon name="close" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
