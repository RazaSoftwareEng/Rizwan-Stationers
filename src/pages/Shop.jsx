import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Icon from "../components/Icon.jsx";
import { categories, products } from "../data/products.js";

const sorts = {
  featured: { label: "Featured", fn: (a, b) => Number(!!b.tag) - Number(!!a.tag) },
  low: { label: "Price: low to high", fn: (a, b) => a.price - b.price },
  high: { label: "Price: high to low", fn: (a, b) => b.price - a.price },
  name: { label: "Name: A–Z", fn: (a, b) => a.name.localeCompare(b.name) },
};

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const cat = params.get("cat") || "all";
  const sub = params.get("sub") || "all";
  const qParam = params.get("q") || "";
  const [query, setQuery] = useState(qParam);
  const [sort, setSort] = useState("featured");

  // a search from the header arrives as ?q=
  useEffect(() => {
    setQuery(qParam);
  }, [qParam]);

  const current = categories.find((c) => c.id === cat);
  const currentSub = current?.subs.find((s) => s.id === sub);

  const q = query.trim().toLowerCase();
  const list = products
    .filter(
      (p) =>
        (cat === "all" || p.category === cat) &&
        (sub === "all" || p.sub === sub) &&
        p.name.toLowerCase().includes(q),
    )
    .sort(sorts[sort].fn);

  return (
    <>
      <PageHeader
        eyebrow="The collection"
        title={
          currentSub ? currentSub.name : current ? current.name : qParam ? `Results for “${qParam}”` : "Shop all"
        }
        lead={current ? current.blurb : "Fine writing, paper, organisers and everyday school supplies."}
      >
        {current && (
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link to="/shop">Shop</Link>
            <span aria-hidden="true">/</span>
            {currentSub ? (
              <>
                <Link to={`/shop?cat=${current.id}`}>{current.name}</Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{currentSub.name}</span>
              </>
            ) : (
              <span aria-current="page">{current.name}</span>
            )}
          </nav>
        )}
      </PageHeader>

      <section className="section section--tight">
        <div className="container">
          <div className="toolbar">
            <div className="chips" role="group" aria-label="Filter by category">
              {[{ id: "all", name: "All" }, ...categories].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={"chip" + (cat === c.id ? " is-active" : "")}
                  aria-pressed={cat === c.id}
                  onClick={() => setParams(c.id === "all" ? {} : { cat: c.id })}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <div className="toolbar__right">
              <label className="search">
                <Icon name="search" />
                <input
                  type="search"
                  placeholder="Search products"
                  aria-label="Search products"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <select className="select" aria-label="Sort products" value={sort} onChange={(e) => setSort(e.target.value)}>
                {Object.entries(sorts).map(([k, s]) => (
                  <option key={k} value={k}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {current && (
            <div className="subchips" role="group" aria-label={`Filter ${current.name}`}>
              {[{ id: "all", name: `All ${current.name}` }, ...current.subs].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={"subchip" + (sub === s.id ? " is-active" : "")}
                  aria-pressed={sub === s.id}
                  onClick={() => setParams(s.id === "all" ? { cat } : { cat, sub: s.id })}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}

          <p className="result-count">
            {list.length} {list.length === 1 ? "product" : "products"}
          </p>

          {list.length ? (
            <div className="grid">
              {list.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <p>{q ? `No products match “${query}”.` : "No products here yet — new stock is on the way."}</p>
              {q && (
                <button type="button" className="btn btn--ghost" onClick={() => setQuery("")}>
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
