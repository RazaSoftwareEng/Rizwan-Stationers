import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCatalog } from "../catalog.jsx";
import { formatRs } from "../cart.jsx";
import CategoryIcon from "../components/CategoryIcon.jsx";
import { PageHead, AdminIcon, Empty, CatalogNotice, formatDate } from "./ui.jsx";
import ProductForm from "./ProductForm.jsx";
import { AuthError, productsApi } from "./auth.js";

const sorts = {
  newest: { label: "Newest first", fn: (a, b) => String(b.createdAt).localeCompare(String(a.createdAt)) },
  name: { label: "Name A–Z", fn: (a, b) => a.name.localeCompare(b.name) },
  priceLow: { label: "Price: low to high", fn: (a, b) => a.price - b.price },
  priceHigh: { label: "Price: high to low", fn: (a, b) => b.price - a.price },
};

function toCsv(rows) {
  const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const head = ["ID", "Name", "Category", "Price", "In stock", "Description", "Created", "Updated"];
  const lines = rows.map((p) =>
    [p.apiId, p.name, p.categoryName, p.price, p.inStock ? "yes" : "no", p.description, p.createdAt, p.updatedAt].map(cell).join(","),
  );
  return [head.map(cell).join(","), ...lines].join("\n");
}

export default function Products() {
  const { products, categories, reload } = useCatalog();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  // editing: null = closed, "new" = add form, product = edit form
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [flash, setFlash] = useState(null);

  const notify = (text, kind = "ok") => {
    setFlash({ text, kind });
    setTimeout(() => setFlash(null), 4000);
  };
  const signedOut = () => navigate("/admin-login?next=/admin/products", { replace: true });

  async function onSaved(msg, kind = "ok") {
    setEditing(null);
    await reload();
    notify(msg, kind);
  }
  async function onDelete() {
    setDeleting(true);
    try {
      await productsApi.remove(confirm.apiId);
      const name = confirm.name;
      setConfirm(null);
      await reload();
      notify(`“${name}” deleted.`);
    } catch (err) {
      if (err instanceof AuthError) return signedOut();
      notify(err.message || "Couldn't delete the product.", "bad");
      setConfirm(null);
    } finally {
      setDeleting(false);
    }
  }
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const cat = params.get("cat") || "all";
  const stock = params.get("stock") || "all";

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === "all") next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter(
        (p) =>
          (cat === "all" || p.category === cat) &&
          (stock === "all" || (stock === "in" ? p.inStock : !p.inStock)) &&
          (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)),
      )
      .sort(sorts[sort].fn);
  }, [products, cat, stock, query, sort]);

  function exportCsv() {
    const blob = new Blob([toCsv(list)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <>
      <PageHead title="Products" sub={`${products.length} products from the API`}>
        <button type="button" className="adm-btn adm-btn--ghost" onClick={exportCsv} disabled={!list.length}>
          <AdminIcon name="download" />
          Export CSV
        </button>
        <button type="button" className="adm-btn adm-btn--primary" onClick={() => setEditing("new")}>
          <AdminIcon name="plus" />
          Add product
        </button>
      </PageHead>
      <CatalogNotice />
      {flash && (
        <div className={"adm-note " + (flash.kind === "bad" ? "adm-note--bad" : "adm-note--ok")} role="status">
          <AdminIcon name={flash.kind === "bad" ? "alert" : "check"} />
          <span>{flash.text}</span>
        </div>
      )}

      <div className="adm-card">
        <div className="adm-filters">
          <label className="adm-search">
            <AdminIcon name="search" />
            <input type="search" placeholder="Search name or description" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search products" />
          </label>
          <select className="adm-select" value={cat} onChange={(e) => setFilter("cat", e.target.value)} aria-label="Category">
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.count})
              </option>
            ))}
          </select>
          <select className="adm-select" value={stock} onChange={(e) => setFilter("stock", e.target.value)} aria-label="Stock">
            <option value="all">Any stock</option>
            <option value="in">In stock</option>
            <option value="out">Out of stock</option>
          </select>
          <select className="adm-select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
            {Object.entries(sorts).map(([k, s]) => (
              <option key={k} value={k}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {list.length ? (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th className="num">Price</th>
                  <th>Stock</th>
                  <th>Updated</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="adm-prod">
                        <span className={`adm-prod__img art--${p.category}`}>
                          {p.images[0] ? <img src={p.images[0]} alt="" loading="lazy" /> : <CategoryIcon category={p.category} />}
                        </span>
                        <span>
                          <span className="adm-strong">{p.name}</span>
                          {p.images.length > 1 && <span className="adm-prod__count">{p.images.length} images</span>}
                          {p.description && <span className="adm-prod__desc">{p.description}</span>}
                        </span>
                      </div>
                    </td>
                    <td>{p.categoryName}</td>
                    <td className="num adm-strong">{formatRs(p.price)}</td>
                    <td>
                      <span className={"adm-status " + (p.inStock ? "adm-status--delivered" : "adm-status--out")}>
                        {p.inStock ? "In stock" : "Out of stock"}
                      </span>
                    </td>
                    <td className="adm-muted">{formatDate(p.updatedAt)}</td>
                    <td>
                      <div className="adm-actions">
                        <button type="button" className="adm-iconbtn" onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`} title="Edit">
                          <AdminIcon name="edit" />
                        </button>
                        <a className="adm-iconbtn" href={`/product/${p.id}`} target="_blank" rel="noreferrer" aria-label={`View ${p.name} in the store`} title="View in store">
                          <AdminIcon name="external" />
                        </a>
                        <button type="button" className="adm-iconbtn adm-iconbtn--bad" onClick={() => setConfirm(p)} aria-label={`Delete ${p.name}`} title="Delete">
                          <AdminIcon name="trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>{products.length ? "No products match these filters." : "No products yet."}</Empty>
        )}
      </div>

      {editing && (
        <ProductForm
          product={editing === "new" ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={onSaved}
          onSignedOut={signedOut}
        />
      )}

      {confirm && (
        <div className="adm-panel-wrap" role="alertdialog" aria-modal="true" aria-label="Delete product">
          <button type="button" className="adm-scrim" aria-label="Cancel" onClick={() => !deleting && setConfirm(null)} />
          <div className="adm-confirm">
            <span className="adm-confirm__icon">
              <AdminIcon name="trash" />
            </span>
            <h2>Delete this product?</h2>
            <p>
              <strong>{confirm.name}</strong> will be removed from the shop right away. This can&apos;t be undone.
            </p>
            <div className="adm-form__actions">
              <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setConfirm(null)} disabled={deleting} autoFocus>
                Cancel
              </button>
              <button type="button" className="adm-btn adm-btn--danger" onClick={onDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
