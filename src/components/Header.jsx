import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCart, formatRs, FREE_DELIVERY_FROM } from "../cart.jsx";
import { categories, products } from "../data/products.js";
import { shop } from "../data/shop.js";
import Icon from "./Icon.jsx";
import CategoryIcon from "./CategoryIcon.jsx";

const pages = [
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
];

const countIn = (cat, sub) =>
  products.filter((p) => p.category === cat && (!sub || p.sub === sub)).length;

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Rizwan Stationer — home">
      <img className="logo__seal" src="/seal.png" alt="" width="52" height="52" />
      <span className="logo__words">
        <span className="logo__name">
          <em>R</em>izwan <em>S</em>tationer
        </span>
        <span className="logo__tag">Stationery &amp; Fine Writing</span>
      </span>
    </Link>
  );
}

function HeaderSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  function onSubmit(e) {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
    setQ("");
  }
  return (
    <form className="hsearch" role="search" onSubmit={onSubmit}>
      <Icon name="search" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search pens, notebooks &amp; more"
        aria-label="Search products"
      />
      <button type="submit" className="hsearch__btn">Search</button>
    </form>
  );
}

function useActiveCat() {
  const { pathname, search } = useLocation();
  if (pathname !== "/shop") return null;
  return new URLSearchParams(search).get("cat") || "all";
}

/* ---------- desktop category bar ---------- */
function CategoryNav() {
  const activeCat = useActiveCat();
  const [closed, setClosed] = useState(null);

  return (
    <nav className="catnav" aria-label="Main">
      <div className="container">
        <ul className="catnav__list">
          <li>
            <NavLink to="/" end className="catnav__link">Home</NavLink>
          </li>
          {categories.map((c) => (
            <li
              key={c.id}
              className={"has-drop" + (closed === c.id ? " is-closed" : "")}
              onMouseLeave={() => setClosed(null)}
            >
              <Link
                to={`/shop?cat=${c.id}`}
                className={"catnav__link" + (activeCat === c.id ? " active" : "")}
                aria-haspopup="true"
                onClick={() => setClosed(c.id)}
              >
                {c.name}
                <svg className="chev" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </Link>
              <div className="drop">
                <div className="drop__inner">
                  <div className="drop__intro">
                    <span className={`art__ring art--${c.id}`}>
                      <CategoryIcon category={c.id} />
                    </span>
                    <p className="drop__title">{c.name}</p>
                    <p className="drop__blurb">{c.blurb}</p>
                  </div>
                  <ul className="drop__subs">
                    {c.subs.map((s) => (
                      <li key={s.id}>
                        <Link to={`/shop?cat=${c.id}&sub=${s.id}`} onClick={() => setClosed(c.id)}>
                          <span>{s.name}</span>
                          <span className="drop__count">{countIn(c.id, s.id)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link to={`/shop?cat=${c.id}`} className="drop__all" onClick={() => setClosed(c.id)}>
                    View all {c.name} <Icon name="arrow" />
                  </Link>
                </div>
              </div>
            </li>
          ))}
          <li>
            <Link to="/shop" className={"catnav__link" + (activeCat === "all" ? " active" : "")}>
              Shop All
            </Link>
          </li>
          <li className="catnav__sep" aria-hidden="true" />
          {pages.map((p) => (
            <li key={p.to}>
              <NavLink to={p.to} className="catnav__link">{p.label}</NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

/* ---------- mobile slide-in menu ---------- */
function MobileMenu({ open, onClose }) {
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div className={"mmenu" + (open ? " is-open" : "")}>
      <div className="mmenu__scrim" onClick={onClose} />
      <aside className="mmenu__panel" aria-label="Menu" inert={!open}>
        <div className="mmenu__head">
          <Logo />
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close menu">
            <Icon name="close" />
          </button>
        </div>

        <nav className="mmenu__body" aria-label="Mobile">
          <Link to="/" className="mmenu__link">Home</Link>
          <p className="mmenu__label">Shop by category</p>
          {categories.map((c) => {
            const isOpen = expanded === c.id;
            return (
              <div key={c.id} className={"acc" + (isOpen ? " is-open" : "")}>
                <button
                  type="button"
                  className="acc__btn"
                  aria-expanded={isOpen}
                  onClick={() => setExpanded(isOpen ? null : c.id)}
                >
                  <span className={`acc__icon art--${c.id}`}>
                    <CategoryIcon category={c.id} />
                  </span>
                  {c.name}
                  <svg className="chev" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <div className="acc__panel">
                  <div>
                    {c.subs.map((s) => (
                      <Link key={s.id} to={`/shop?cat=${c.id}&sub=${s.id}`} className="acc__sub">
                        {s.name}
                      </Link>
                    ))}
                    <Link to={`/shop?cat=${c.id}`} className="acc__sub acc__sub--all">
                      View all {c.name}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
          <Link to="/shop" className="mmenu__link">Shop All</Link>
          <Link to="/orders" className="mmenu__link">My Orders</Link>
          {pages.map((p) => (
            <Link key={p.to} to={p.to} className="mmenu__link">{p.label}</Link>
          ))}
        </nav>

        <div className="mmenu__foot">
          <a href={`tel:${shop.phone.replace(/\s/g, "")}`}>
            <Icon name="phone" /> {shop.phone}
          </a>
          <a href={`https://wa.me/${shop.whatsapp}`} target="_blank" rel="noopener noreferrer">
            <Icon name="chat" /> Order on WhatsApp
          </a>
        </div>
      </aside>
    </div>
  );
}

export default function Header() {
  const { count, openDrawer } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname, search } = useLocation();

  useEffect(() => {
    setOpen(false);
    // drop keyboard focus so an open dropdown closes after navigating
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  }, [pathname, search]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="announce">
        <div className="container announce__inner">
          <span>Free delivery in Lahore on orders over {formatRs(FREE_DELIVERY_FROM)}</span>
          <span className="announce__sep" aria-hidden="true">·</span>
          <span className="announce__extra">Main Urdu Bazar, Lahore — since 1995</span>
        </div>
      </div>

      <header className={"header" + (scrolled ? " is-scrolled" : "")}>
        <div className="container header__inner">
          <button
            className="icon-btn menu-btn"
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Icon name="menu" />
          </button>

          <Logo />

          <HeaderSearch />

          <div className="header__actions">
            <a className="header__phone" href={`tel:${shop.phone.replace(/\s/g, "")}`}>
              <Icon name="phone" />
              <span>
                <small>Call or WhatsApp</small>
                {shop.phone}
              </span>
            </a>
            <Link to="/orders" className="icon-btn header__orders" aria-label="My orders" title="My orders">
              <Icon name="box" />
            </Link>
            <button type="button" className="icon-btn" onClick={openDrawer} aria-label={`Open cart, ${count} items`}>
              <Icon name="bag" />
              {count > 0 && <span className="badge">{count}</span>}
            </button>
          </div>
        </div>
        <CategoryNav />
      </header>

      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
