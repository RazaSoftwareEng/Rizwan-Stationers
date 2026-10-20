import { useEffect, useState } from "react";
import { useSeo, absUrl, breadcrumbLd } from "../seo.js";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart, formatRs, FREE_DELIVERY_FROM } from "../cart.jsx";
import { categories, products, stockStatus } from "../data/products.js";
import { shop } from "../data/shop.js";
import { posts } from "../data/posts.js";
import ProductCard from "../components/ProductCard.jsx";
import CategoryIcon from "../components/CategoryIcon.jsx";
import Icon from "../components/Icon.jsx";
import { flyToCart } from "../flyToCart.js";
import NotFound from "./NotFound.jsx";

function Gallery({ product }) {
  const images = product.images || [];
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
  }, [product.id]);

  if (!images.length) {
    return (
      <div className={`gallery__main gallery__main--art art--${product.category}`}>
        <span className="art__ring">
          <CategoryIcon category={product.category} />
        </span>
      </div>
    );
  }

  const go = (d) => setActive((i) => (i + d + images.length) % images.length);

  return (
    <div className="gallery">
      <div className="gallery__main">
        <img key={images[active]} src={images[active]} alt={`${product.name} — photo ${active + 1} of ${images.length}`} />
        {images.length > 1 && (
          <>
            <button type="button" className="gallery__nav gallery__nav--prev" onClick={() => go(-1)} aria-label="Previous photo">
              <Icon name="arrow" />
            </button>
            <button type="button" className="gallery__nav gallery__nav--next" onClick={() => go(1)} aria-label="Next photo">
              <Icon name="arrow" />
            </button>
            <span className="gallery__count">
              {active + 1} / {images.length}
            </span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="gallery__thumbs" role="group" aria-label="Product photos">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              className={"gallery__thumb" + (i === active ? " is-active" : "")}
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-pressed={i === active}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const clip = (text, n) => (text.length <= n ? text : text.slice(0, text.lastIndexOf(" ", n - 1)) + "…");

function productSeo(product) {
  if (!product) return { title: "Page Not Found", description: "This product could not be found.", noindex: true };
  const category = categories.find((c) => c.id === product.category);
  const sub = category?.subs.find((s) => s.id === product.sub);
  const path = `/product/${product.id}`;
  const image = product.images?.[0] || product.cutout;
  const inStock = product.stock == null || product.stock > 0;
  return {
    title: product.name,
    description: clip(
      `${product.name} — ${formatRs(product.price)} at Rizwan Stationer, Lahore. ${product.description || ""}`.trim(),
      158,
    ),
    path,
    image,
    type: "product",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        sku: product.id,
        description: product.description,
        image: (product.images || [image]).filter(Boolean).map((src) => absUrl(src)),
        category: [category?.name, sub?.name].filter(Boolean).join(" > "),
        offers: {
          "@type": "Offer",
          url: absUrl(path),
          priceCurrency: "PKR",
          price: product.price,
          availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: { "@type": "Organization", name: "Rizwan Stationer" },
        },
      },
      breadcrumbLd([
        ["Home", "/"],
        [category.name, `/shop?cat=${category.id}`],
        ...(sub ? [[sub.name, `/shop?cat=${category.id}&sub=${sub.id}`]] : []),
        [product.name, path],
      ]),
    ],
  };
}

export default function Product() {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const { add, lines, openDrawer } = useCart();
  const navigate = useNavigate();
  const [qty, setLocalQty] = useState(1);

  useEffect(() => {
    setLocalQty(1);
  }, [id]);

  useSeo(productSeo(product));

  if (!product) return <NotFound />;

  const category = categories.find((c) => c.id === product.category);
  const sub = category?.subs.find((s) => s.id === product.sub);
  const related = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);
  const inCart = lines.find((l) => l.product.id === product.id)?.qty || 0;
  // an article that mentions this product, else one about its category
  const guide =
    posts.find((p) => JSON.stringify(p.body).includes(`(/product/${product.id})`)) ||
    posts.find((p) => p.category === product.category);
  const status = stockStatus(product);
  const soldOut = status.kind === "out";
  // how many more can go in the cart without exceeding stock
  const maxQty = product.stock == null ? 99 : Math.max(0, product.stock - inCart);
  const canBuy = !soldOut && maxQty > 0;

  function addToCart() {
    if (!canBuy) return;
    flyToCart(document.querySelector(".pdp .gallery__main img"));
    add(product.id, Math.min(qty, maxQty), { silent: true });
  }
  function buyNow() {
    if (!canBuy) return;
    add(product.id, Math.min(qty, maxQty), { silent: true });
    navigate("/checkout");
  }

  const description =
    product.description ||
    `${product.name} from our ${category.name} collection — chosen for everyday quality and fair value. Visit us at Main Urdu Bazar or order online for delivery in Lahore.`;

  const waText = `Assalam-o-Alaikum, I'd like to order:\n• ${product.name} × ${qty}\nTotal: ${formatRs(product.price * qty)}`;
  const waLink = `https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(waText)}`;

  return (
    <>
      <section className="section section--tight pdp-wrap">
        <div className="container">
          <nav className="crumbs crumbs--light" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to={`/shop?cat=${category.id}`}>{category.name}</Link>
            {sub && (
              <>
                <span aria-hidden="true">/</span>
                <Link to={`/shop?cat=${category.id}&sub=${sub.id}`}>{sub.name}</Link>
              </>
            )}
          </nav>

          <div className="pdp">
            <Gallery product={product} />

            <div className="pdp__info">
              {product.tag && <span className="pdp__tag">{product.tag}</span>}
              <h1 className="pdp__name">{product.name}</h1>
              <div className="pdp__meta">
                <p className="pdp__price">{formatRs(product.price)}</p>
                <span className={`stock-badge stock-badge--${status.kind}`}>
                  <span className="stock-badge__dot" aria-hidden="true" />
                  {status.label}
                </span>
              </div>

              <p className="pdp__desc">{description}</p>

              {product.features?.length > 0 && (
                <ul className="pdp__features">
                  {product.features.map((f) => (
                    <li key={f}>
                      <Icon name="check" strokeWidth={2} />
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              {product.specs && (
                <div className="pdp__specs">
                  <h2>Specifications</h2>
                  <dl>
                    {Object.entries(product.specs).map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              <div className="pdp__buy">
                <div className="qty qty--lg" role="group" aria-label="Quantity">
                  <button type="button" aria-label="Decrease quantity" onClick={() => setLocalQty((q) => Math.max(1, q - 1))}>
                    <Icon name="minus" />
                  </button>
                  <span aria-live="polite">{qty}</span>
                  <button type="button" aria-label="Increase quantity" onClick={() => setLocalQty((q) => Math.min(Math.max(1, maxQty), q + 1))} disabled={qty >= maxQty}>
                    <Icon name="plus" />
                  </button>
                </div>
                <button type="button" className="btn btn--outline btn--lg pdp__add" onClick={addToCart} disabled={!canBuy}>
                  <Icon name="bag" />
                  {soldOut ? "Out of stock" : canBuy ? "Add to cart" : "Max in cart"}
                </button>
              </div>
              <button type="button" className="btn btn--gold btn--lg btn--block" onClick={buyNow} disabled={!canBuy}>
                {soldOut ? "Currently unavailable" : `Buy now — ${formatRs(product.price * qty)}`}
              </button>
              <a className="pdp__wa" href={waLink} target="_blank" rel="noopener noreferrer">
                <Icon name="chat" />
                Prefer WhatsApp? Order this in one message
              </a>
              {inCart > 0 && (
                <button type="button" className="text-btn pdp__incart" onClick={openDrawer}>
                  {inCart} already in your cart — view cart
                </button>
              )}

              {guide && (
                <Link to={`/blog/${guide.slug}`} className="pdp__guide">
                  <span className="pdp__guide-label">From our journal</span>
                  <span className="pdp__guide-title">{guide.title}</span>
                  <Icon name="arrow" />
                </Link>
              )}

              <ul className="pdp__perks">
                <li>
                  <Icon name="truck" />
                  Free delivery in Lahore over {formatRs(FREE_DELIVERY_FROM)}
                </li>
                <li>
                  <Icon name="pin" />
                  Pick up from {shop.address}
                </li>
                <li>
                  <Icon name="phone" />
                  Questions? Call <a href={`tel:${shop.phone.replace(/\s/g, "")}`}>{shop.phone}</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="buybar" aria-label="Quick buy">
        <div className="buybar__info">
          <span className="buybar__name">{product.name}</span>
          <strong>{formatRs(product.price * qty)}</strong>
        </div>
        <button type="button" className="icon-btn buybar__add" onClick={addToCart} aria-label="Add to cart" disabled={!canBuy}>
          <Icon name="bag" />
        </button>
        <button type="button" className="btn btn--gold buybar__buy" onClick={buyNow} disabled={!canBuy}>
          {soldOut ? "Sold out" : "Buy now"}
        </button>
      </div>

      {related.length > 0 && (
        <section className="section section--paper">
          <div className="container">
            <div className="section__head section__head--row">
              <div>
                <p className="eyebrow">You may also like</p>
                <h2>More in {category.name}</h2>
              </div>
              <Link to={`/shop?cat=${category.id}`} className="link-arrow">
                View all <Icon name="arrow" />
              </Link>
            </div>
            <div className="grid">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
