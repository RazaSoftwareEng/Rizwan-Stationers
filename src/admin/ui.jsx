import { Link } from "react-router-dom";
import { useCatalog } from "../catalog.jsx";

const icons = {
  grid: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />,
  box: (
    <>
      <path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z" />
      <path d="M3.5 7.5L12 12l8.5-4.5M12 12v9" />
    </>
  ),
  tag: (
    <>
      <path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7a1 1 0 0 1 .7.3l7.8 7.8a1 1 0 0 1 0 1.4l-7.7 7.7a1 1 0 0 1-1.4 0l-7.8-7.8a1 1 0 0 1-.3-.7z" />
      <circle cx="8" cy="8" r="1.4" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </>
  ),
  external: <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />,
  refresh: <path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.3-4.3" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  download: <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />,
  upload: <path d="M12 16V5M7 10l5-5 5 5M5 20h14" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  money: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  edit: <path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4" />,
  star: <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z" />,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />,
  alert: (
    <>
      <path d="M12 4l9 16H3z" />
      <path d="M12 10v4M12 17.5v.5" />
    </>
  ),
};

export function AdminIcon({ name, className = "" }) {
  return (
    <svg className={"adm-icon " + className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icons[name]}
    </svg>
  );
}

export function PageHead({ title, sub, children }) {
  return (
    <div className="adm-head">
      <div>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {children && <div className="adm-head__actions">{children}</div>}
    </div>
  );
}

// a stat card; with `to` it's a link to the page behind the number
export function Kpi({ icon, label, value, note, tone = "", to }) {
  const cls = "adm-kpi " + (tone ? `adm-kpi--${tone}` : "") + (to ? " adm-kpi--link" : "");
  const body = (
    <>
      <span className="adm-kpi__icon">
        <AdminIcon name={icon} />
      </span>
      <span className="adm-kpi__label">{label}</span>
      <strong className="adm-kpi__value">{value}</strong>
      {note && <span className="adm-kpi__note">{note}</span>}
      {to && <AdminIcon name="arrow" className="adm-kpi__go" />}
    </>
  );
  return to ? (
    <Link to={to} className={cls} aria-label={`${label}: ${value} — open`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function Empty({ children }) {
  return <div className="adm-empty">{children}</div>;
}

// shown while products load or when the API can't be reached
export function CatalogNotice() {
  const { status, error, reload, products } = useCatalog();
  if (status === "loading") return <div className="adm-note">Loading products from the API…</div>;
  if (status === "error")
    return (
      <div className="adm-note adm-note--bad">
        <AdminIcon name="alert" />
        <span>
          Can't reach the product API{products.length ? " — showing the last loaded data" : ""}. <small>{error}</small>
        </span>
        <button type="button" className="adm-btn adm-btn--ghost" onClick={reload}>
          Retry
        </button>
      </div>
    );
  return null;
}

export const formatDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";
export const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");
