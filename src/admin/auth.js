import { API_BASE } from "../catalog.jsx";

// Admin sign-in against the Django API (JWT).
//   POST /api/auth/login/    { username, password } -> { access, refresh }
//   POST /api/auth/refresh/  { refresh }            -> { access, refresh? }
// Tokens live in localStorage when "Remember me" is ticked, otherwise in sessionStorage
// (cleared when the browser closes). Passwords are never stored.

const TOKENS_KEY = "rs-admin-tokens";
const REMEMBER_USER_KEY = "rs-admin-email";

export class AuthError extends Error {}

// DRF error body -> readable text + per-field messages
export class ApiError extends Error {
  constructor(status, body) {
    const fields = body && typeof body === "object" && !body.detail ? body : {};
    const first = Object.entries(fields)[0];
    super(body?.detail || (first ? `${first[0]}: ${[].concat(first[1]).join(" ")}` : `Request failed (${status})`));
    this.status = status;
    this.fields = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, [].concat(v).join(" ")]));
  }
}

function readTokens() {
  for (const store of [sessionStorage, localStorage]) {
    try {
      const t = JSON.parse(store.getItem(TOKENS_KEY));
      if (t?.refresh) return { ...t, store };
    } catch {
      /* ignore */
    }
  }
  return null;
}

function writeTokens(tokens, remember) {
  clearTokens();
  try {
    (remember ? localStorage : sessionStorage).setItem(TOKENS_KEY, JSON.stringify(tokens));
  } catch {
    /* storage blocked */
  }
}

function clearTokens() {
  for (const store of [sessionStorage, localStorage]) {
    try {
      store.removeItem(TOKENS_KEY);
    } catch {
      /* ignore */
    }
  }
}

async function parse(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { detail: text.slice(0, 200) };
  }
}

export async function login(username, password, remember = false) {
  const res = await fetch(`${API_BASE}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ username: username.trim(), password }),
  });
  const body = await parse(res);
  if (!res.ok || !body?.access) throw new ApiError(res.status, body);
  writeTokens({ access: body.access, refresh: body.refresh, user: username.trim() }, remember);
  try {
    if (remember) localStorage.setItem(REMEMBER_USER_KEY, username.trim());
    else localStorage.removeItem(REMEMBER_USER_KEY);
  } catch {
    /* ignore */
  }
  return true;
}

export function getSession() {
  const t = readTokens();
  return t ? { email: t.user } : null;
}

export function rememberedEmail() {
  try {
    return localStorage.getItem(REMEMBER_USER_KEY) || "";
  } catch {
    return "";
  }
}

export function logout() {
  clearTokens();
}

async function refreshAccess() {
  const t = readTokens();
  if (!t) throw new AuthError("Signed out");
  const res = await fetch(`${API_BASE}/api/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refresh: t.refresh }),
  });
  const body = await parse(res);
  if (!res.ok || !body?.access) {
    clearTokens();
    throw new AuthError("Your session has expired — please sign in again.");
  }
  const next = { ...t, access: body.access, refresh: body.refresh || t.refresh };
  delete next.store;
  writeTokens(next, t.store === localStorage);
  return next.access;
}

// fetch with the admin's token; refreshes it once on 401
export async function authFetch(path, options = {}) {
  const t = readTokens();
  if (!t) throw new AuthError("Signed out");
  const go = (access) =>
    fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { Accept: "application/json", ...options.headers, Authorization: `Bearer ${access}` },
    });
  let res = await go(t.access);
  if (res.status === 401) res = await go(await refreshAccess());
  if (res.status === 401) {
    clearTokens();
    throw new AuthError("Your session has expired — please sign in again.");
  }
  const body = res.status === 204 ? null : await parse(res);
  if (!res.ok) throw new ApiError(res.status, body);
  return body;
}

/* ---------- products ---------- */
// data: { name, description, price, category, in_stock, image?: File }
function toForm(data) {
  const f = new FormData();
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null) continue;
    f.append(k, typeof v === "boolean" ? String(v) : v);
  }
  return f;
}

// a product's gallery (max 5); the featured one is shown first in the shop
export const MAX_IMAGES = 5;
export const imagesApi = {
  upload: (productId, file, featured = false) => authFetch("/api/product-images/", { method: "POST", body: toForm({ product: productId, image: file, is_featured: featured }) }),
  feature: (imageId) =>
    authFetch(`/api/product-images/${imageId}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_featured: true }),
    }),
  remove: (imageId) => authFetch(`/api/product-images/${imageId}/`, { method: "DELETE" }),
};

export const productsApi = {
  create: (data) => authFetch("/api/products/", { method: "POST", body: toForm(data) }),
  update: (id, data) => authFetch(`/api/products/${id}/`, { method: "PATCH", body: toForm(data) }),
  remove: (id) => authFetch(`/api/products/${id}/`, { method: "DELETE" }),
};
