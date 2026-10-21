import { Link } from "react-router-dom";
import { useCart, formatRs, MAX_QTY } from "../cart.jsx";
import { useCatalog, stockStatus } from "../catalog.jsx";
import CategoryIcon from "./CategoryIcon.jsx";
import Icon from "./Icon.jsx";
import { flyToCart } from "../flyToCart.js";
import { useCutout } from "../useCutout.js";

export default function ProductCard({ product }) {
  const { add, qtyOf, setQty, remove } = useCart();
  const { categories } = useCatalog();
  const category = categories.find((c) => c.id === product.category);
  const url = `/product/${product.id}`;
  // white-background shots are cut out in the browser so they can lift out of the card
  const autoCut = useCutout(product.cutout ? null : product.images?.[0]);
  const photo = product.cutout || autoCut || product.images?.[0];
  const cut = !!(product.cutout || autoCut);
  const inCart = qtyOf(product.id);
  const status = stockStatus(product);
  const maxQty = product.stock == null ? MAX_QTY : Math.min(MAX_QTY, product.stock);

  return (
    <article className="card">
      <Link to={url} className={`card__art art art--${product.category}${cut ? " card__art--cutout" : photo ? " card__art--photo" : ""}`} tabIndex={-1} aria-hidden="true">
        {photo ? (
          <img src={photo} alt="" loading="lazy" />
        ) : (
          <span className="art__ring">
            <CategoryIcon category={product.category} />
          </span>
        )}
        <span className="card__floor" aria-hidden="true" />
        {product.tag && <span className="card__tag">{product.tag}</span>}
        <span className="card__peek">
          View details <Icon name="arrow" />
        </span>
      </Link>
      <div className="card__body">
        <p className="card__cat">{category?.name}</p>
        <h3 className="card__name">
          <Link to={url}>{product.name}</Link>
        </h3>
        <p className="card__price">
          {formatRs(product.price)}
          {status.kind !== "in" && <span className={`stock-badge stock-badge--${status.kind}`}>{status.label}</span>}
        </p>
        {inCart ? (
          <div className="card__stepper" role="group" aria-label={`${product.name} quantity in cart`}>
            <button
              type="button"
              aria-label={inCart === 1 ? "Remove from cart" : "Decrease quantity"}
              onClick={() => (inCart === 1 ? remove(product.id) : setQty(product.id, inCart - 1))}
            >
              <Icon name={inCart === 1 ? "trash" : "minus"} />
            </button>
            <span aria-live="polite">
              {inCart} in cart
            </span>
            <button type="button" aria-label="Increase quantity" onClick={(e) => {
                flyToCart(e.currentTarget.closest(".card").querySelector(".card__art img"));
                add(product.id, 1, { silent: true });
              }}
              disabled={inCart >= maxQty}
            >
              <Icon name="plus" />
            </button>
          </div>
        ) : (
          <button className="btn btn--outline btn--block card__add" type="button" onClick={(e) => {
              flyToCart(e.currentTarget.closest(".card").querySelector(".card__art img"));
              add(product.id, 1, { silent: true });
            }}
            disabled={status.kind === "out"}
          >
            <Icon name="bag" />
            {status.kind === "out" ? "Out of stock" : "Add to cart"}
          </button>
        )}
      </div>
    </article>
  );
}
