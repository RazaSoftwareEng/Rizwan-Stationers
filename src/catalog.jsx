import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// Products come from the shop's API (https://api.qomunix.com), always called as same-origin
// /api/… — Vite's dev server and Netlify (public/_redirects) forward it, so no CORS is needed.
// VITE_API_URL can point the site straight at an API that does allow this origin.
export const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const PRODUCTS_URL = `${API_BASE}/api/public/products/`;

export const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// media paths from the API may be relative ("/media/…")
function mediaUrl(src) {
  if (!src) return null;
  if (/^https?:\/\//.test(src)) return src;
  return `${API_BASE}${src.startsWith("/") ? "" : "/"}${src}`;
}

// API item → the shape the storefront uses
export function toProduct(item) {
  // `images` comes featured-first from the API; `image` is the featured one (older API shape)
  const imageRecords = (item.images || [])
    .map((im) => ({ id: im.id, url: mediaUrl(im.image), featured: !!im.is_featured }))
    .filter((im) => im.url);
  const fallback = mediaUrl(item.image);
  const images = imageRecords.length ? imageRecords.map((im) => im.url) : fallback ? [fallback] : [];
  const categoryName = (item.category || "").trim() || "Other";
  return {
    id: `${slugify(item.name) || "product"}-${item.id}`,
    apiId: item.id,
    name: item.name,
    description: item.description || "",
    price: Number(item.price) || 0,
    images,
    imageRecords,
    category: slugify(categoryName),
    categoryName,
    // the API only says whether it's in stock; null = in stock, count unknown
    stock: item.in_stock ? null : 0,
    inStock: !!item.in_stock,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

// categories are whatever the products use, biggest first
function buildCategories(products) {
  const map = new Map();
  for (const p of products) {
    const c = map.get(p.category) || { id: p.category, name: p.categoryName, count: 0, subs: [] };
    c.count += 1;
    map.set(p.category, c);
  }
  return [...map.values()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .map((c) => ({ ...c, blurb: `${c.count} ${c.count === 1 ? "product" : "products"}` }));
}

export const LOW_STOCK = 5;
export function stockStatus(product) {
  const n = product.stock;
  if (n == null) return { kind: "in", label: "In stock" };
  if (n <= 0) return { kind: "out", label: "Out of stock" };
  if (n <= LOW_STOCK) return { kind: "low", label: `Only ${n} left` };
  return { kind: "in", label: "In stock" };
}

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const [state, setState] = useState({ status: "loading", products: [], error: null, loadedAt: null });

  const load = useCallback(async (signal) => {
    setState((s) => ({ ...s, status: s.products.length ? "refreshing" : "loading", error: null }));
    try {
      const res = await fetch(PRODUCTS_URL, { headers: { Accept: "application/json" }, signal });
      if (!res.ok) throw new Error(`The product service answered ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results || [];
      setState({ status: "ready", products: list.map(toProduct), error: null, loadedAt: new Date() });
    } catch (err) {
      if (err.name === "AbortError") return;
      setState((s) => ({ ...s, status: "error", error: err.message || "Could not load products" }));
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    load(ctrl.signal);
    return () => ctrl.abort();
  }, [load]);

  const value = useMemo(() => {
    const byId = new Map(state.products.map((p) => [p.id, p]));
    const byName = new Map(state.products.map((p) => [slugify(p.name), p]));
    return {
      ...state,
      loading: state.status === "loading",
      categories: buildCategories(state.products),
      findProduct: (id) => byId.get(id),
      // match on the product's name, ignoring case and punctuation
      findByName: (name) => byName.get(slugify(name)),
      reload: () => load(),
    };
  }, [state, load]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside <CatalogProvider>");
  return ctx;
}
