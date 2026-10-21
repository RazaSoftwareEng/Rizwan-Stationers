import { useState } from "react";
import { NavLink, Navigate, Route, Routes, Link, useLocation, useNavigate } from "react-router-dom";
import { getSession, logout } from "./auth.js";
import { useCatalog, API_BASE } from "../catalog.jsx";
import { useSeo } from "../seo.js";
import Dashboard from "./Dashboard.jsx";
import Products from "./Products.jsx";
import Categories from "./Categories.jsx";
import Orders from "./Orders.jsx";
import { AdminIcon } from "./ui.jsx";
import "./admin.css";

const tabs = [
  { to: "/admin", label: "Dashboard", icon: "grid", end: true },
  { to: "/admin/products", label: "Products", icon: "box" },
  { to: "/admin/categories", label: "Categories", icon: "tag" },
  { to: "/admin/orders", label: "Orders", icon: "receipt" },
];

function SyncStatus() {
  const { status, loadedAt, reload, error } = useCatalog();
  const busy = status === "loading" || status === "refreshing";
  const label =
    status === "error" ? "API offline" : busy ? "Syncing…" : loadedAt ? `Synced ${loadedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}` : "";
  return (
    <div className="adm-sync">
      <span className={"adm-pill " + (status === "error" ? "adm-pill--bad" : "adm-pill--ok")} title={error || `${API_BASE || ""}/api/public/products/`}>
        <span className="adm-pill__dot" />
        {status === "error" ? "Offline" : "Live"}
      </span>
      <span className="adm-sync__time">{label}</span>
      <button type="button" className="adm-btn adm-btn--ghost" onClick={reload} disabled={busy}>
        <AdminIcon name="refresh" className={busy ? "is-spinning" : ""} />
        Refresh
      </button>
    </div>
  );
}

// only signed-in admins get the dashboard; everyone else goes to /admin-login
export default function AdminApp() {
  const { pathname, search } = useLocation();
  if (!getSession()) return <Navigate to={`/admin-login?next=${encodeURIComponent(pathname + search)}`} replace />;
  return <DashboardShell />;
}

function DashboardShell() {
  useSeo({ title: "Admin", description: "Rizwan Stationer admin dashboard.", noindex: true });
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const session = getSession();
  function signOut() {
    logout();
    navigate("/admin-login", { replace: true });
  }

  return (
    <div className={"adm" + (menuOpen ? " is-menu-open" : "")}>
      <aside className="adm-side">
        <Link to="/admin" className="adm-brand">
          <img src="/seal.png" alt="" width="36" height="36" />
          <span>
            Rizwan Stationer
            <small>Admin</small>
          </span>
        </Link>
        <nav className="adm-nav" aria-label="Admin">
          {tabs.map((t) => (
            <NavLink key={t.to} to={t.to} end={t.end} className="adm-nav__link" onClick={() => setMenuOpen(false)}>
              <AdminIcon name={t.icon} />
              {t.label}
            </NavLink>
          ))}
        </nav>
        <a href="/" className="adm-nav__link adm-nav__store">
          <AdminIcon name="external" />
          View store
        </a>
      </aside>

      <div className="adm-main">
        <header className="adm-top">
          <button type="button" className="adm-burger" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu" aria-expanded={menuOpen}>
            <AdminIcon name="menu" />
          </button>
          <SyncStatus />
          <div className="adm-user">
            <span className="adm-user__email">{session?.email}</span>
            <button type="button" className="adm-btn adm-btn--ghost" onClick={signOut}>
              Log out
            </button>
          </div>
        </header>

        <main className="adm-content">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="orders" element={<Orders />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
      {menuOpen && <button type="button" className="adm-scrim" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}
    </div>
  );
}
