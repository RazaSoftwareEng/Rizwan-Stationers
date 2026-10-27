import { useEffect, useState } from "react";
import { useSeo, breadcrumbLd } from "../seo.js";
import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import ProductTable from "../components/ProductTable.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Icon from "../components/Icon.jsx";
import { useCatalog } from "../catalog.jsx";
import CatalogState from "../components/CatalogState.jsx";

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
  // grid of cards or a compact table — remembered on this device
  const [view, setView] = useState(() => {
    try {
      return localStorage.getItem("rs-shop-view") === "list" ? "list" : "grid";
    } catch {
      return "grid";
    }
  });
  const pickView = (v) => {
    setView(v);
    try {
      localStorage.setItem("rs-shop-view", v);
    } catch {
      /* ignore */
    }
  };

  // a search from the header arrives as ?q=
  useEffect(() => {
    setQuery(qParam);
  }, [qParam]);

  const { products, categories, status } = useCatalog();
  const current = categories.find((c) => c.id === cat);
  const currentSub = current?.subs.find((s) => s.id === sub);

  const seoName = currentSub?.name || current?.name;
  const seoPath = current ? `/shop?cat=${current.id}${currentSub ? `&sub=${currentSub.id}` : ""}` : "/shop";
  useSeo({
    title: seoName ? `${seoName} — Buy Online in Lahore` : "Shop All Stationery",
    description: currentSub
      ? `Shop ${currentSub.name.toLowerCase()} from our ${current.name} range at Rizwan Stationer, Lahore. Clear prices, live stock and delivery or pickup from Main Urdu Bazar.`
      : current
      ? `Shop ${current.name.toLowerCase()} at Rizwan Stationer, Lahore — ${current.blurb}. Clear prices, live stock and delivery or pickup from Main Urdu Bazar.`
      : "Browse our full range at Rizwan Stationer, Lahore — clear prices, live stock and delivery across Lahore or pickup from Main Urdu Bazar.",
    path: seoPath,
    // search-result pages are thin duplicates of the catalogue
    noindex: !!qParam,
    jsonLd: breadcrumbLd([
      ["Home", "/"],
      ["Shop", "/shop"],
      ...(current ? [[current.name, `/shop?cat=${current.id}`]] : []),
      ...(currentSub ? [[currentSub.name, seoPath]] : []),
    ]),
  });

  const q = query.trim().toLowerCase();
  const list = products
    .filter(
      (p) =>
        (cat === "all" || p.category === cat) &&
        (sub === "all" || p.sub === sub) &&
        (p.name.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q)),
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
              <div className="viewtoggle" role="group" aria-label="View">
                <button type="button" className={view === "grid" ? "is-active" : ""} aria-pressed={view === "grid"} onClick={() => pickView("grid")} title="Grid view">
                  <Icon name="grid" />
                </button>
                <button type="button" className={view === "list" ? "is-active" : ""} aria-pressed={view === "list"} onClick={() => pickView("list")} title="List view">
                  <Icon name="list" />
                </button>
              </div>
            </div>
          </div>

          {current?.subs.length > 0 && (
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

          {status === "loading" || (status === "error" && !products.length) ? (
            <CatalogState />
          ) : (
          <>
          <p className="result-count">
            {list.length} {list.length === 1 ? "product" : "products"}
          </p>

          {list.length ? (
            view === "list" ? (
              <ProductTable products={list} showCategory={cat === "all"} />
            ) : (
              <div className="grid">
                {list.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )
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
          </>
          )}
        </div>
      </section>
    </>
  );
}
