import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { products } from "./data/products.js";

const CartContext = createContext(null);
const STORAGE_KEY = "rs-cart";
export const MAX_QTY = 99;

function readJSON(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v ?? fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — data just won't persist */
  }
}

function loadCart() {
  const saved = readJSON(STORAGE_KEY, {});
  return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
}

const clamp = (n) => Math.max(0, Math.min(MAX_QTY, Math.floor(n) || 0));

export function CartProvider({ children }) {
  // { [productId]: quantity }
  const [items, setItems] = useState(loadCart);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // toast: { key, kind: "added" | "info", product?, title, text?, action?: { label, run } }
  const [toast, setToast] = useState(null);
  const toastTimer = useRef();

  useEffect(() => {
    writeJSON(STORAGE_KEY, items);
  }, [items]);

  const value = useMemo(() => {
    const showToast = (t, ms = 3500) => {
      clearTimeout(toastTimer.current);
      setToast({ ...t, key: Date.now() });
      toastTimer.current = setTimeout(() => setToast(null), ms);
    };
    const find = (id) => products.find((p) => p.id === id);

    const lines = Object.entries(items)
      .map(([id, qty]) => ({ product: find(id), qty }))
      .filter((l) => l.product);

    return {
      lines,
      items,
      count: lines.reduce((n, l) => n + l.qty, 0),
      total: lines.reduce((n, l) => n + l.qty * l.product.price, 0),
      qtyOf: (id) => items[id] || 0,

      // add(id, qty?, { silent }) — silent skips the toast (used by Buy now)
      add: (id, qty = 1, { silent = false } = {}) => {
        setItems((c) => ({ ...c, [id]: clamp((c[id] || 0) + qty) }));
        if (!silent) showToast({ kind: "added", product: find(id), title: "Added to cart" });
      },
      setQty: (id, qty) =>
        setItems((c) => {
          const next = { ...c };
          const q = clamp(qty);
          if (q <= 0) delete next[id];
          else next[id] = q;
          return next;
        }),
      remove: (id) => {
        const prev = items[id];
        if (!prev) return;
        setItems((c) => {
          const next = { ...c };
          delete next[id];
          return next;
        });
        showToast(
          {
            kind: "info",
            title: "Removed from cart",
            text: find(id)?.name,
            action: { label: "Undo", run: () => setItems((c) => ({ ...c, [id]: prev })) },
          },
          5000,
        );
      },
      clear: () => {
        const snapshot = items;
        setItems({});
        showToast(
          { kind: "info", title: "Cart cleared", action: { label: "Undo", run: () => setItems(snapshot) } },
          5000,
        );
      },
      // after an order is placed — no undo
      reset: () => setItems({}),
      // put a previous order's items back in the cart
      reorder: (orderItems) => {
        setItems((c) => {
          const next = { ...c };
          orderItems.forEach((i) => {
            if (find(i.id)) next[i.id] = clamp((next[i.id] || 0) + i.qty);
          });
          return next;
        });
      },

      drawerOpen,
      openDrawer: () => {
        setToast(null);
        setDrawerOpen(true);
      },
      closeDrawer: () => setDrawerOpen(false),
      toast,
      dismissToast: () => setToast(null),
    };
  }, [items, drawerOpen, toast]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}

export function formatRs(n) {
  return "Rs " + n.toLocaleString("en-PK");
}

export const FREE_DELIVERY_FROM = 2000;

/* ---------------------------------------------------------
   Frontend-only order + customer storage (this browser only).
   TODO(backend): replace these with API calls.
   --------------------------------------------------------- */
const ORDERS_KEY = "rs-orders";
const CUSTOMER_KEY = "rs-customer";

export const ORDER_STATUSES = ["Received", "Confirmed", "Dispatched", "Delivered"];

export function loadOrders() {
  const list = readJSON(ORDERS_KEY, []);
  return Array.isArray(list) ? list : [];
}
export function saveOrder(order) {
  writeJSON(ORDERS_KEY, [order, ...loadOrders()].slice(0, 50));
}
// a specific order by number, or the most recent one
export function loadOrder(number) {
  const list = loadOrders();
  return number ? list.find((o) => o.number === number) || null : list[0] || null;
}

export function loadCustomer() {
  return readJSON(CUSTOMER_KEY, null);
}
export function saveCustomer(c) {
  writeJSON(CUSTOMER_KEY, c);
}
export function forgetCustomer() {
  try {
    localStorage.removeItem(CUSTOMER_KEY);
  } catch {
    /* ignore */
  }
}
