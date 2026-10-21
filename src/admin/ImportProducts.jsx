import { useEffect, useState } from "react";
import { AuthError, productsApi } from "./auth.js";
import { AdminIcon } from "./ui.jsx";
import { formatRs } from "../cart.jsx";

// Bulk add / update products from a CSV file (no images — add those per product afterwards).
// Columns (header names are matched loosely, any order): Name, Description, Price, Category, In stock, ID.
// A row whose ID matches an existing product updates it; every other row creates a new product.

const TEMPLATE = [
  ["Name", "Category", "Price", "In stock", "Description"],
  ["Classic Ballpoint Pen — Blue", "Fine Writing", "40", "yes", "Smooth everyday ballpoint.\n\n- 1.0 mm tip\n- Clear barrel"],
  ["Single Line Register — 200 pages", "Notebooks & Paper", "320", "yes", "Strongly bound register for school and office."],
  ["Geometry Box — 9 pieces", "School & Art", "550", "no", ""],
];

// RFC-4180 style: quoted fields may contain commas, quotes ("") and line breaks
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') (cell += '"'), i++;
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") row.push(cell), (cell = "");
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell || row.length) row.push(cell), rows.push(row);
  return rows.filter((r) => r.some((c) => c.trim()));
}

const COLUMNS = {
  name: ["name", "product", "product name", "title"],
  description: ["description", "desc", "details"],
  price: ["price", "price (rs)", "rs", "amount"],
  category: ["category", "categories", "type"],
  in_stock: ["in stock", "in_stock", "stock", "available"],
  id: ["id", "product id"],
};
const norm = (s) => s.trim().toLowerCase().replace(/\s+/g, " ");

function toRows(table) {
  const [head = [], ...body] = table;
  const index = {};
  head.forEach((h, i) => {
    const key = Object.keys(COLUMNS).find((k) => COLUMNS[k].includes(norm(h)));
    if (key && index[key] === undefined) index[key] = i;
  });
  if (index.name === undefined) return { error: 'The file needs a "Name" column in the first row.' };
  return {
    rows: body.map((r, n) => {
      const get = (k) => (index[k] === undefined ? "" : (r[index[k]] || "").trim());
      const priceText = get("price").replace(/[^\d.]/g, "");
      const stockText = norm(get("in_stock"));
      const row = {
        line: n + 2,
        id: get("id") ? Number(get("id")) : null,
        name: get("name"),
        description: get("description"),
        price: priceText === "" ? NaN : Number(priceText),
        category: get("category"),
        in_stock: !["no", "false", "0", "out", "out of stock", "n"].includes(stockText),
      };
      const problems = [];
      if (!row.name) problems.push("name is empty");
      if (Number.isNaN(row.price) || row.price < 0) problems.push("price missing or not a number");
      if (!row.category) problems.push("category is empty");
      return { ...row, problems };
    }),
  };
}

function downloadTemplate() {
  const cell = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = "﻿" + TEMPLATE.map((r) => r.map(cell).join(",")).join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = "products-template.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function ImportProducts({ products, onClose, onDone, onSignedOut }) {
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null); // [{ line, name, ok, action, message }]

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !running && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, onClose]);

  const existing = new Set(products.map((p) => p.apiId));
  const valid = rows?.filter((r) => !r.problems.length) || [];
  const updates = valid.filter((r) => r.id && existing.has(r.id)).length;

  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    setResults(null);
    setError("");
    if (!file) return;
    if (!/\.csv$/i.test(file.name) && file.type !== "text/csv") {
      setRows(null);
      setError("Choose a .csv file. In Excel: File → Save As → CSV UTF-8.");
      return;
    }
    setFileName(file.name);
    const parsed = toRows(parseCsv(await file.text()));
    if (parsed.error) {
      setRows(null);
      setError(parsed.error);
    } else if (!parsed.rows.length) {
      setRows(null);
      setError("The file has no product rows under the header.");
    } else setRows(parsed.rows);
  }

  async function run() {
    setRunning(true);
    setProgress(0);
    const out = [];
    for (const [i, r] of valid.entries()) {
      const data = {
        name: r.name,
        description: r.description,
        price: r.price.toFixed(2),
        category: r.category,
        in_stock: r.in_stock,
      };
      const update = r.id && existing.has(r.id);
      try {
        if (update) await productsApi.update(r.id, data);
        else await productsApi.create(data);
        out.push({ line: r.line, name: r.name, ok: true, action: update ? "updated" : "added" });
      } catch (err) {
        if (err instanceof AuthError) return onSignedOut();
        out.push({ line: r.line, name: r.name, ok: false, message: err.message || "Failed" });
      }
      setProgress(i + 1);
    }
    setResults(out);
    setRunning(false);
    onDone();
  }

  const added = results?.filter((r) => r.ok && r.action === "added").length || 0;
  const updated = results?.filter((r) => r.ok && r.action === "updated").length || 0;
  const failed = results?.filter((r) => !r.ok) || [];

  return (
    <div className="adm-panel-wrap" role="dialog" aria-modal="true" aria-label="Import products">
      <button type="button" className="adm-scrim" aria-label="Close" onClick={() => !running && onClose()} />
      <div className="adm-panel adm-import">
        <div className="adm-panel__head">
          <div>
            <h2>Import products</h2>
            <p className="adm-muted">Add or update many products at once from a CSV file</p>
          </div>
          <button type="button" className="adm-iconbtn" onClick={onClose} aria-label="Close" disabled={running}>
            <AdminIcon name="close" />
          </button>
        </div>

        <ol className="adm-import__steps">
          <li>
            <strong>Download the template</strong> and fill it in Excel or Google Sheets.{" "}
            <button type="button" className="adm-link adm-import__tpl" onClick={downloadTemplate}>
              <AdminIcon name="download" /> products-template.csv
            </button>
          </li>
          <li>
            Save it as <strong>CSV</strong> (Excel: File → Save As → CSV UTF-8) and upload it here.
          </li>
          <li>Check the preview, then import. Add photos to each product from its Edit form afterwards.</li>
        </ol>
        <p className="adm-muted adm-import__note">
          Columns: <code>Name</code> <code>Category</code> <code>Price</code> <code>In stock</code> (yes / no){" "}
          <code>Description</code>. Tip: an exported file keeps its <code>ID</code> column — importing it again updates those
          products instead of adding copies.
        </p>

        {!results && (
          <label className={"adm-import__drop" + (running ? " is-disabled" : "")}>
            <input type="file" accept=".csv,text/csv" onChange={onFile} disabled={running} />
            <AdminIcon name="plus" />
            <span>{fileName ? `Choose another file (${fileName})` : "Choose a CSV file"}</span>
          </label>
        )}

        {error && (
          <div className="adm-note adm-note--bad" role="alert">
            <AdminIcon name="alert" />
            <span>{error}</span>
          </div>
        )}

        {rows && !results && (
          <>
            <div className="adm-import__summary">
              <span>
                <strong>{valid.length}</strong> ready ({valid.length - updates} new, {updates} update)
              </span>
              {rows.length - valid.length > 0 && <span className="adm-bad">{rows.length - valid.length} with problems (skipped)</span>}
            </div>
            <div className="adm-table-wrap adm-import__table">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th className="num">Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.line} className={r.problems.length ? "is-bad" : ""}>
                      <td className="adm-muted">{r.line}</td>
                      <td className="adm-strong">{r.name || "—"}</td>
                      <td>{r.category || "—"}</td>
                      <td className="num">{Number.isNaN(r.price) ? "—" : formatRs(r.price)}</td>
                      <td>{r.in_stock ? "In stock" : "Out"}</td>
                      <td>
                        {r.problems.length ? (
                          <span className="adm-bad">{r.problems.join(", ")}</span>
                        ) : r.id && existing.has(r.id) ? (
                          <span className="adm-status adm-status--confirmed">Update #{r.id}</span>
                        ) : (
                          <span className="adm-status adm-status--delivered">New</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {running && (
          <div className="adm-import__progress" role="status">
            <span>
              Importing {progress} of {valid.length}…
            </span>
            <span className="adm-import__bar">
              <span style={{ width: `${(progress / Math.max(1, valid.length)) * 100}%` }} />
            </span>
          </div>
        )}

        {results && (
          <div className={"adm-note " + (failed.length ? "adm-note--bad" : "adm-note--ok")} role="status">
            <AdminIcon name={failed.length ? "alert" : "check"} />
            <span>
              {added} added, {updated} updated{failed.length ? `, ${failed.length} failed` : ""}.
              {failed.length > 0 && (
                <ul className="adm-import__fails">
                  {failed.map((f) => (
                    <li key={f.line}>
                      Row {f.line} ({f.name}): {f.message}
                    </li>
                  ))}
                </ul>
              )}
            </span>
          </div>
        )}

        <div className="adm-form__actions">
          <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose} disabled={running}>
            {results ? "Close" : "Cancel"}
          </button>
          {!results && (
            <button type="button" className="adm-btn adm-btn--primary" onClick={run} disabled={running || !valid.length}>
              {running ? "Importing…" : `Import ${valid.length || ""} product${valid.length === 1 ? "" : "s"}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
