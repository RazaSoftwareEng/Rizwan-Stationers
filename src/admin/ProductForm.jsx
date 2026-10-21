import { useEffect, useRef, useState } from "react";
import RichDescription from "../components/RichDescription.jsx";
import { compressImage, formatSize } from "./compressImage.js";
import { ApiError, AuthError, MAX_IMAGES, imagesApi, productsApi } from "./auth.js";
import { AdminIcon } from "./ui.jsx";

// originals can be large — they're shrunk and converted to WebP before upload
const MAX_MB = 25;
let tempId = 0;

// Add / edit a product. `product` is a storefront product (from the catalog) or null for a new one.
// Images: up to 5 per product, one of them featured (shown first in the shop).
export default function ProductForm({ product, categories, onClose, onSaved, onSignedOut }) {
  const editing = !!product;
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product ? String(product.price) : "",
    category: product?.categoryName || "",
    in_stock: product ? product.inStock : true,
  });
  // gallery: saved images ({ id, url }) and new files ({ key, file, url }); `featured` is "s<id>" or "n<key>"
  const [saved, setSaved] = useState(product?.imageRecords || []);
  const [removed, setRemoved] = useState([]);
  const [added, setAdded] = useState([]);
  const [featured, setFeatured] = useState(() => {
    const f = product?.imageRecords?.find((im) => im.featured) || product?.imageRecords?.[0];
    return f ? `s${f.id}` : null;
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("");
  const descRef = useRef(null);
  const [showPreview, setShowPreview] = useState(true);

  // toolbar: add a line prefix to every selected line (or the current one)
  function format(kind) {
    const el = descRef.current;
    if (!el) return;
    const text = form.description;
    let start = el.selectionStart;
    let end = el.selectionEnd;
    if (kind === "bold") {
      const picked = text.slice(start, end) || "bold text";
      const next = text.slice(0, start) + `**${picked}**` + text.slice(end);
      setForm((f) => ({ ...f, description: next }));
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start + 2, start + 2 + picked.length);
      });
      return;
    }
    if (kind === "para") {
      const insert = (start > 0 && text[start - 1] !== "\n" ? "\n\n" : start > 0 && text[start - 2] !== "\n" ? "\n" : "") + "";
      const next = text.slice(0, start) + insert + text.slice(end);
      setForm((f) => ({ ...f, description: next }));
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start + insert.length, start + insert.length);
      });
      return;
    }
    const lineStart = text.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = text.indexOf("\n", end) === -1 ? text.length : text.indexOf("\n", end);
    const lines = text.slice(lineStart, lineEnd).split("\n");
    const clean = (l) => l.replace(/^\s*([-•*]|\d+[.)]|#{2,3})\s+/, "");
    // empty lines stay empty (they separate paragraphs); numbering skips them
    let n = 0;
    const out = lines.map((l) =>
      !l.trim() ? l : kind === "bullet" ? `- ${clean(l)}` : kind === "number" ? `${++n}. ${clean(l)}` : `## ${clean(l)}`,
    );
    const block = out.join("\n");
    const next = text.slice(0, lineStart) + block + text.slice(lineEnd);
    setForm((f) => ({ ...f, description: next }));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(lineStart + block.length, lineStart + block.length);
    });
  }

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  // free preview URLs when the form closes
  useEffect(() => () => added.forEach((a) => URL.revokeObjectURL(a.url)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
    setErrors((errs) => (errs[k] ? { ...errs, [k]: undefined } : errs));
  };

  const gallery = [
    ...saved.map((im) => ({ key: `s${im.id}`, url: im.url, isNew: false })),
    ...added.map((a) => ({ key: `n${a.key}`, url: a.url, isNew: true, name: a.file.name, size: a.file.size, original: a.original })),
  ];
  const room = MAX_IMAGES - gallery.length;
  // if nothing is picked, the first image is the featured one
  const featuredKey = gallery.some((g) => g.key === featured) ? featured : gallery[0]?.key || null;

  const [optimizing, setOptimizing] = useState(0);

  async function addFiles(e) {
    const files = [...(e.target.files || [])];
    e.target.value = "";
    const tooBig = files.filter((f) => f.size > MAX_MB * 1024 * 1024);
    const ok = files.filter((f) => f.size <= MAX_MB * 1024 * 1024 && f.type.startsWith("image/")).slice(0, Math.max(0, room));
    const msgs = [];
    if (tooBig.length) msgs.push(`${tooBig.length} image${tooBig.length > 1 ? "s are" : " is"} over ${MAX_MB} MB.`);
    if (files.length - tooBig.length > ok.length) msgs.push(`A product can have at most ${MAX_IMAGES} images.`);
    setErrors((errs) => ({ ...errs, images: msgs.join(" ") || undefined }));
    if (!ok.length) return;
    // shrink + convert to WebP in the browser before anything is uploaded
    setOptimizing((n) => n + ok.length);
    for (const original of ok) {
      const file = await compressImage(original);
      setAdded((list) => [...list, { key: ++tempId, file, original: original.size, url: URL.createObjectURL(file) }]);
      setOptimizing((n) => n - 1);
    }
  }

  function removeImage(g) {
    if (g.isNew) {
      setAdded((list) => {
        const hit = list.find((a) => `n${a.key}` === g.key);
        if (hit) URL.revokeObjectURL(hit.url);
        return list.filter((a) => `n${a.key}` !== g.key);
      });
    } else {
      const id = Number(g.key.slice(1));
      setSaved((list) => list.filter((im) => im.id !== id));
      setRemoved((list) => [...list, id]);
    }
    setErrors((errs) => ({ ...errs, images: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Enter a product name.";
    const price = Number(form.price);
    if (form.price === "" || Number.isNaN(price) || price < 0) e.price = "Enter a price of 0 or more.";
    if (!form.category.trim()) e.category = "Enter a category.";
    return e;
  }

  async function syncImages(productId) {
    // 1. deletions first, so their slots are free for new uploads
    for (const id of removed) {
      setStep("Removing images…");
      await imagesApi.remove(id);
    }
    // 2. uploads — the featured flag goes with the chosen new image
    for (const [i, a] of added.entries()) {
      setStep(`Uploading image ${i + 1} of ${added.length}…`);
      await imagesApi.upload(productId, a.file, featuredKey === `n${a.key}`);
    }
    // 3. a saved image picked as featured
    const original = product?.imageRecords?.find((im) => im.featured);
    if (featuredKey?.startsWith("s") && Number(featuredKey.slice(1)) !== original?.id) {
      setStep("Setting the featured image…");
      await imagesApi.feature(Number(featuredKey.slice(1)));
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    setError("");
    if (Object.keys(found).length) return;
    setBusy(true);
    setStep(editing ? "Saving changes…" : "Creating the product…");
    const data = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price).toFixed(2),
      category: form.category.trim(),
      in_stock: form.in_stock,
    };
    let productId = product?.apiId;
    try {
      if (editing) await productsApi.update(productId, data);
      else productId = (await productsApi.create(data)).id;
    } catch (err) {
      return fail(err);
    }
    try {
      await syncImages(productId);
      onSaved(editing ? `“${data.name}” updated.` : `“${data.name}” added.`);
    } catch (err) {
      if (err instanceof AuthError) return onSignedOut(err.message);
      // the product itself is saved; only (some) images failed
      onSaved(`“${data.name}” was saved, but an image couldn't be: ${err.message}`, "bad");
    }
  }

  function fail(err) {
    setBusy(false);
    setStep("");
    if (err instanceof AuthError) return onSignedOut(err.message);
    if (err instanceof ApiError) {
      setErrors(err.fields);
      setError(err.message);
    } else setError("Can't reach the server. Check that the API is running.");
  }

  const field = (k, label, input) => (
    <label className={"adm-field" + (errors[k] ? " has-error" : "")}>
      <span>{label}</span>
      {input}
      {errors[k] && <small className="adm-field__error">{errors[k]}</small>}
    </label>
  );

  return (
    <div className="adm-panel-wrap" role="dialog" aria-modal="true" aria-label={editing ? "Edit product" : "Add product"}>
      <button type="button" className="adm-scrim" aria-label="Close" onClick={() => !busy && onClose()} />
      <form className="adm-panel adm-form" onSubmit={onSubmit} noValidate>
        <div className="adm-panel__head">
          <div>
            <h2>{editing ? "Edit product" : "Add product"}</h2>
            <p className="adm-muted">{editing ? `ID ${product.apiId}` : "Saved straight to the shop's API"}</p>
          </div>
          <button type="button" className="adm-iconbtn" onClick={onClose} aria-label="Close" disabled={busy}>
            <AdminIcon name="close" />
          </button>
        </div>

        {error && (
          <div className="adm-note adm-note--bad" role="alert">
            <AdminIcon name="alert" />
            <span>{error}</span>
          </div>
        )}

        {field("name", "Name", <input className="adm-input" value={form.name} onChange={set("name")} autoFocus maxLength={200} />)}
        <div className="adm-field">
          <span className="adm-gallery__head">
            Description
            <button type="button" className="adm-link adm-desc__toggle" onClick={() => setShowPreview((v) => !v)}>
              {showPreview ? "Hide preview" : "Show preview"}
            </button>
          </span>
          <div className="adm-desc">
            <div className="adm-desc__bar" role="toolbar" aria-label="Description formatting">
              <button type="button" onClick={() => format("para")} title="New paragraph (blank line)">¶ Paragraph</button>
              <button type="button" onClick={() => format("bullet")} title="Bullet points: lines starting with - ">• Bullets</button>
              <button type="button" onClick={() => format("number")} title="Numbered points: lines starting with 1. ">1. Numbered</button>
              <button type="button" onClick={() => format("heading")} title="Small heading: line starting with ## ">H Heading</button>
              <button type="button" onClick={() => format("bold")} title="Bold: **text**"><strong>B</strong></button>
            </div>
            <textarea
              ref={descRef}
              className="adm-input adm-desc__input"
              rows={8}
              value={form.description}
              onChange={set("description")}
              placeholder={"Smooth writing for signatures and gifting.\n\nA weighted brass pen with a polished gold nib.\n\n## Features\n- Medium steel nib\n- Comes in a gift box\n\nNib: Medium\nBody: Brass"}
            />
          </div>
          <small className="adm-muted adm-desc__help">
            Blank line = new paragraph · <code>- </code> bullet · <code>1. </code> numbered · <code>## </code> heading ·{" "}
            <code>Label: value</code> lines = specs table · <code>**bold**</code>
          </small>
          {showPreview && form.description.trim() && (
            <div className="adm-desc__preview">
              <span className="adm-desc__label">Preview — how it looks in the shop</span>
              <RichDescription text={form.description} />
            </div>
          )}
        </div>
        <div className="adm-form__row">
          {field(
            "price",
            "Price (Rs)",
            <input className="adm-input" type="number" inputMode="decimal" min="0" step="0.01" value={form.price} onChange={set("price")} />,
          )}
          {field(
            "category",
            "Category",
            <>
              <input className="adm-input" list="adm-cats" value={form.category} onChange={set("category")} placeholder="e.g. Fountain Pens" maxLength={100} />
              <datalist id="adm-cats">
                {categories.map((c) => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
            </>,
          )}
        </div>

        <label className="adm-remember">
          <input type="checkbox" checked={form.in_stock} onChange={set("in_stock")} />
          <span>
            In stock
            <small>Untick to show “Out of stock” and stop orders</small>
          </span>
        </label>

        <div className={"adm-field" + (errors.images ? " has-error" : "")}>
          <span className="adm-gallery__head">
            Images
            <small className="adm-muted">
              {gallery.length}/{MAX_IMAGES} · ★ = featured, shown first in the shop
            </small>
          </span>
          <ul className="adm-gallery">
            {gallery.map((g) => {
              const isFeatured = g.key === featuredKey;
              return (
                <li key={g.key} className={"adm-gallery__item" + (isFeatured ? " is-featured" : "")}>
                  <img src={g.url} alt={g.name || ""} />
                  {isFeatured && <span className="adm-gallery__badge">Featured</span>}
                  {g.isNew && <span className="adm-gallery__new">New</span>}
                  {g.isNew && (
                    <span className="adm-gallery__size" title={g.size < g.original ? `Converted to WebP: ${formatSize(g.original)} → ${formatSize(g.size)}` : "Kept as is"}>
                      {g.size < g.original ? `${formatSize(g.original)} → ${formatSize(g.size)}` : formatSize(g.size)}
                    </span>
                  )}
                  <span className="adm-gallery__tools">
                    <button
                      type="button"
                      onClick={() => setFeatured(g.key)}
                      aria-pressed={isFeatured}
                      aria-label={isFeatured ? "Featured image" : "Make this the featured image"}
                      title={isFeatured ? "Featured image" : "Make featured"}
                      disabled={busy}
                    >
                      <AdminIcon name="star" />
                    </button>
                    <button type="button" onClick={() => removeImage(g)} aria-label="Remove image" title="Remove" disabled={busy}>
                      <AdminIcon name="close" />
                    </button>
                  </span>
                </li>
              );
            })}
            {room > 0 && (
              <li>
                <label className="adm-gallery__add">
                  <input type="file" accept="image/*" multiple onChange={addFiles} disabled={busy} />
                  <AdminIcon name="plus" />
                  <span>Add images</span>
                  <small>
                    up to {room} more · auto WebP
                  </small>
                </label>
              </li>
            )}
            {optimizing > 0 && (
              <li className="adm-gallery__busy" role="status">
                <span className="catalog-state__spinner" aria-hidden="true" />
                <small>Optimizing…</small>
              </li>
            )}
          </ul>
          {errors.images && <small className="adm-field__error">{errors.images}</small>}
        </div>

        <div className="adm-form__actions">
          {busy && step && <span className="adm-muted adm-form__step">{step}</span>}
          <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="adm-btn adm-btn--primary" disabled={busy || optimizing > 0}>
            {busy ? "Saving…" : editing ? "Save changes" : "Add product"}
          </button>
        </div>
      </form>
    </div>
  );
}
