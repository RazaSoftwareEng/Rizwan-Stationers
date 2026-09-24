import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useCart, formatRs, FREE_DELIVERY_FROM, MAX_QTY } from "../cart.jsx";
import { shop } from "../data/shop.js";
import Icon from "./Icon.jsx";
import ProductThumb from "./ProductThumb.jsx";

export function orderLink(lines, total) {
  const text =
    "Assalam-o-Alaikum, I'd like to order:\n" +
    lines.map((l) => `• ${l.product.name} × ${l.qty}`).join("\n") +
    `\nTotal: ${formatRs(total)}`;
  return `https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function DeliveryProgress({ total }) {
  const left = FREE_DELIVERY_FROM - total;
  const pct = Math.min(100, (total / FREE_DELIVERY_FROM) * 100);
  return (
    <div className="progress">
      <p>
        {left > 0 ? (
          <>Add <strong>{formatRs(left)}</strong> more for free delivery in Lahore</>
        ) : (
          <>You've unlocked <strong>free delivery</strong> in Lahore</>
        )}
      </p>
      <div className="progress__bar">
        <span style={{ width: pct + "%" }} />
      </div>
    </div>
  );
}

export function QtyControl({ id, qty, withRemove = false }) {
  const { setQty, remove } = useCart();
  return (
    <div className="qty-row">
      <div className="qty">
        <button
          type="button"
          aria-label={qty === 1 ? "Remove from cart" : "Decrease quantity"}
          onClick={() => (qty === 1 ? remove(id) : setQty(id, qty - 1))}
        >
          <Icon name={qty === 1 ? "trash" : "minus"} />
        </button>
        <span aria-live="polite">{qty}</span>
        <button type="button" aria-label="Increase quantity" onClick={() => setQty(id, qty + 1)} disabled={qty >= MAX_QTY}>
          <Icon name="plus" />
        </button>
      </div>
      {withRemove && (
        <button type="button" className="text-btn qty-row__remove" onClick={() => remove(id)}>
          Remove
        </button>
      )}
    </div>
  );
}

export default function CartDrawer() {
  const { drawerOpen, closeDrawer, lines, total, count } = useCart();
  const panel = useRef(null);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => e.key === "Escape" && closeDrawer();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // closeDrawer only flips state, so re-running on its identity isn't needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerOpen]);

  return (
    <div className={"drawer" + (drawerOpen ? " is-open" : "")}>
      <div className="drawer__scrim" onClick={closeDrawer} />
      <aside
        className="drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        tabIndex={-1}
        ref={panel}
        inert={!drawerOpen}
      >
        <div className="drawer__head">
          <h2>Your cart <span className="muted">({count})</span></h2>
          <button type="button" className="icon-btn" onClick={closeDrawer} aria-label="Close cart">
            <Icon name="close" />
          </button>
        </div>

        {lines.length ? (
          <>
            <DeliveryProgress total={total} />
            <ul className="drawer__lines">
              {lines.map(({ product, qty }) => (
                <li key={product.id} className="mini-line">
                  <Link to={`/product/${product.id}`} onClick={closeDrawer}>
                    <ProductThumb product={product} className="mini-line__art" />
                  </Link>
                  <div className="mini-line__info">
                    <p className="mini-line__name">{product.name}</p>
                    <p className="muted">{formatRs(product.price)}</p>
                    <QtyControl id={product.id} qty={qty} withRemove />
                  </div>
                  <p className="mini-line__sum">{formatRs(product.price * qty)}</p>
                </li>
              ))}
            </ul>
            <div className="drawer__foot">
              <div className="drawer__total">
                <span>Subtotal</span>
                <strong>{formatRs(total)}</strong>
              </div>
              <Link to="/checkout" className="btn btn--gold btn--block" onClick={closeDrawer}>
                Checkout — {formatRs(total)}
              </Link>
              <div className="drawer__alt">
                <Link to="/cart" onClick={closeDrawer}>View full cart</Link>
                <span aria-hidden="true">·</span>
                <a href={orderLink(lines, total)} target="_blank" rel="noopener noreferrer">Order on WhatsApp</a>
              </div>
            </div>
          </>
        ) : (
          <div className="drawer__empty">
            <img src="/seal.png" alt="" width="84" height="84" />
            <p>Your cart is empty.</p>
            <Link to="/shop" className="btn" onClick={closeDrawer}>
              Browse the shop
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
