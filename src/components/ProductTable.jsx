import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCart, formatRs, MAX_QTY } from "../cart.jsx";
import { stockStatus } from "../catalog.jsx";
import { flyToCart } from "../flyToCart.js";
import ProductThumb from "./ProductThumb.jsx";
import Icon from "./Icon.jsx";
import { parseDescription, descriptionText } from "./RichDescription.jsx";

// first paragraph (short) + up to 3 bullet points of a product's description
function shortDetail(text) {
  const blocks = parseDescription(text);
  const lead = blocks.find((b) => b.type === "p")?.text || "";
  const points = blocks.filter((b) => b.type === "ul" || b.type === "ol").flatMap((b) => b.items).slice(0, 3);
  const clean = (s) => descriptionText(s);
  const intro = clean(lead);
  return { intro: intro.length > 150 ? intro.slice(0, intro.lastIndexOf(" ", 148)) + "…" : intro, points: points.map(clean) };
}

function AddButton({ product, rowRef, compact = false }) {
  const { add, qtyOf } = useCart();
  const status = stockStatus(product);
  const max = product.stock == null ? MAX_QTY : Math.min(MAX_QTY, product.stock);
  const inCart = qtyOf(product.id);
  const disabled = status.kind === "out" || inCart >= max;
  return (
    <button
      type="button"
      className={"btn " + (compact ? "btn--outline ptable__add" : "btn--gold ptable__pop-add")}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        flyToCart(rowRef.current?.querySelector(".ptable__thumb img"));
        add(product.id, 1, { silent: true });
      }}
    >
      <Icon name="bag" />
      {status.kind === "out" ? "Out of stock" : inCart ? `Add another (${inCart})` : "Add to cart"}
    </button>
  );
}

function Row({ product, showCategory }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const status = stockStatus(product);
  const detail = shortDetail(product.description);
  const url = `/product/${product.id}`;

  return (
    <li
      ref={ref}
      className={"ptable__row" + (open ? " is-open" : "")}
      // hover opens the quick look for a real mouse only; touch uses the + button
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
      // keyboard focus opens it too (a tap also focuses, so only :focus-visible counts)
      onFocus={(e) => e.target.matches(":focus-visible") && setOpen(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}
    >
      <Link to={url} className="ptable__thumb" tabIndex={-1} aria-hidden="true">
        <ProductThumb product={product} />
      </Link>
      <div className="ptable__main">
        <Link to={url} className="ptable__name">
          {product.name}
        </Link>
        {showCategory && <span className="ptable__cat">{product.categoryName}</span>}
      </div>
      <span className={`stock-badge stock-badge--${status.kind} ptable__stock`}>{status.label}</span>
      <strong className="ptable__price">{formatRs(product.price)}</strong>
      <AddButton product={product} rowRef={ref} compact />
      <button type="button" className="ptable__more" aria-expanded={open} aria-label={`Quick look: ${product.name}`} onClick={() => setOpen((o) => !o)}>
        <Icon name={open ? "minus" : "plus"} />
      </button>

      {/* quick look: shown on hover (desktop) or with the + button (touch) */}
      <div className="ptable__pop" role="region" aria-label={`${product.name} — quick look`}>
        <ProductThumb product={product} className="ptable__pop-img" />
        <div className="ptable__pop-body">
          <p className="ptable__pop-name">{product.name}</p>
          <p className="ptable__pop-price">
            {formatRs(product.price)}
            <span className={`stock-badge stock-badge--${status.kind}`}>{status.label}</span>
          </p>
          {detail.intro && <p className="ptable__pop-intro">{detail.intro}</p>}
          {detail.points.length > 0 && (
            <ul className="ptable__pop-points">
              {detail.points.map((p) => (
                <li key={p}>
                  <Icon name="check" strokeWidth={2} />
                  {p}
                </li>
              ))}
            </ul>
          )}
          <div className="ptable__pop-actions">
            <AddButton product={product} rowRef={ref} />
            <Link to={url} className="btn btn--ghost">
              View details
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
}

// Products as a compact table: one row each, with a quick-look card on hover.
export default function ProductTable({ products, showCategory = true }) {
  return (
    <div className="ptable" role="region" aria-label="Products">
      <div className="ptable__head" aria-hidden="true">
        <span />
        <span>Product</span>
        <span>Stock</span>
        <span>Price</span>
        <span />
        <span />
      </div>
      <ul className="ptable__list">
        {products.map((p) => (
          <Row key={p.id} product={p} showCategory={showCategory} />
        ))}
      </ul>
    </div>
  );
}
