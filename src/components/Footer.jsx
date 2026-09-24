import { Link } from "react-router-dom";
import { shop } from "../data/shop.js";
import { categories } from "../data/products.js";
import Icon from "./Icon.jsx";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <img src="/seal.png" alt="" width="72" height="72" />
          <p className="footer__name">Rizwan Stationer</p>
          <p className="footer__tag">Stationery &amp; Fine Writing · Est. 1995</p>
          <p className="footer__about">
            School, office and fine writing supplies — chosen with care, served with a smile.
          </p>
        </div>
        <div>
          <p className="footer__title">Shop</p>
          <ul className="footer__list">
            {categories.map((c) => (
              <li key={c.id}>
                <Link to={`/shop?cat=${c.id}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="footer__title">Company</p>
          <ul className="footer__list">
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/orders">My Orders</Link></li>
          </ul>
        </div>
        <div>
          <p className="footer__title">Visit us</p>
          <ul className="footer__list footer__list--icons">
            <li><Icon name="pin" />{shop.address}</li>
            <li><Icon name="clock" />{shop.hours}</li>
            <li>
              <Icon name="phone" />
              <a href={`tel:${shop.phone.replace(/\s/g, "")}`}>{shop.phone}</a>
            </li>
            <li>
              <Icon name="mail" />
              <a href={`mailto:${shop.email}`}>{shop.email}</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} Rizwan Stationer. All rights reserved.</span>
        <span>Made in Lahore</span>
      </div>
    </footer>
  );
}
