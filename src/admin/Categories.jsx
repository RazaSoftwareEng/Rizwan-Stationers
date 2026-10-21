import { Link } from "react-router-dom";
import { useCatalog } from "../catalog.jsx";
import { formatRs } from "../cart.jsx";
import CategoryIcon from "../components/CategoryIcon.jsx";
import { PageHead, Empty, CatalogNotice } from "./ui.jsx";

export default function Categories() {
  const { products, categories } = useCatalog();

  const rows = categories.map((c) => {
    const items = products.filter((p) => p.category === c.id);
    const inStock = items.filter((p) => p.inStock).length;
    const avg = items.length ? Math.round(items.reduce((n, p) => n + p.price, 0) / items.length) : 0;
    return { ...c, inStock, out: items.length - inStock, avg };
  });

  return (
    <>
      <PageHead title="Categories" sub="Built from the category on each product in the API." />
      <CatalogNotice />
      <div className="adm-note">
        <span>Categories come from the products: set a product&apos;s category when you add or edit it, and a new category appears here automatically.</span>
      </div>

      {rows.length ? (
        <div className="adm-catgrid">
          {rows.map((c) => (
            <article key={c.id} className="adm-cat">
              <div className="adm-cat__top">
                <span className={`adm-cat__icon art--${c.id}`}>
                  <CategoryIcon category={c.id} />
                </span>
                <div>
                  <h2>{c.name}</h2>
                  <p className="adm-muted">/shop?cat={c.id}</p>
                </div>
              </div>
              <dl className="adm-cat__stats">
                <div>
                  <dt>Products</dt>
                  <dd>{c.count}</dd>
                </div>
                <div>
                  <dt>In stock</dt>
                  <dd>{c.inStock}</dd>
                </div>
                <div>
                  <dt>Out</dt>
                  <dd className={c.out ? "adm-bad" : ""}>{c.out}</dd>
                </div>
                <div>
                  <dt>Avg price</dt>
                  <dd>{formatRs(c.avg)}</dd>
                </div>
              </dl>
              <div className="adm-cat__links">
                <Link to={`/admin/products?cat=${c.id}`} className="adm-link">
                  View products
                </Link>
                <a href={`/shop?cat=${c.id}`} className="adm-link" target="_blank" rel="noreferrer">
                  Open in store
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="adm-card">
          <Empty>No categories yet — they appear as soon as products have one.</Empty>
        </div>
      )}
    </>
  );
}
