import { Link } from "react-router-dom";
import { useCart, formatRs, FREE_DELIVERY_FROM } from "../cart.jsx";
import ProductThumb from "../components/ProductThumb.jsx";
import Icon from "../components/Icon.jsx";
import { DeliveryProgress, QtyControl, orderLink } from "../components/CartDrawer.jsx";
import { Steps } from "./Checkout.jsx";

export default function Cart() {
  const { lines, total, count, clear } = useCart();

  if (!lines.length) {
    return (
      <section className="section section--tight">
        <div className="container">
          <Steps current={0} />
          <div className="empty">
            <img src="/seal.png" alt="" width="96" height="96" />
            <h1 className="checkout__empty-title">Your cart is empty</h1>
            <p>Add a few things from the shop and they'll show up here.</p>
            <div className="empty__actions">
              <Link to="/shop" className="btn btn--lg">Browse the shop</Link>
              <Link to="/orders" className="btn btn--ghost btn--lg">My orders</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const delivery = total >= FREE_DELIVERY_FROM ? "Free in Lahore" : "Confirmed on call";

  return (
    <section className="section section--tight">
      <div className="container">
        <Steps current={0} />
        <h1 className="checkout__title">
          Your cart <span className="muted">({count} {count === 1 ? "item" : "items"})</span>
        </h1>

        <div className="cart-layout">
          <div>
            <ul className="cart">
              {lines.map(({ product, qty }) => (
                <li key={product.id} className="mini-line mini-line--lg">
                  <Link to={`/product/${product.id}`}>
                    <ProductThumb product={product} className="mini-line__art" />
                  </Link>
                  <div className="mini-line__info">
                    <Link to={`/product/${product.id}`} className="mini-line__name">
                      {product.name}
                    </Link>
                    <p className="muted">{formatRs(product.price)} each</p>
                    <QtyControl id={product.id} qty={qty} withRemove />
                  </div>
                  <p className="mini-line__sum">{formatRs(product.price * qty)}</p>
                </li>
              ))}
            </ul>
            <div className="cart__foot">
              <Link to="/shop" className="link-arrow link-arrow--back">
                <Icon name="arrow" /> Continue shopping
              </Link>
              <button type="button" className="text-btn" onClick={clear}>
                Clear cart
              </button>
            </div>
          </div>

          <aside className="summary">
            <h2>Order summary</h2>
            <DeliveryProgress total={total} />
            <dl>
              <div><dt>Subtotal</dt><dd>{formatRs(total)}</dd></div>
              <div><dt>Delivery</dt><dd>{delivery}</dd></div>
              <div className="summary__total"><dt>Total</dt><dd>{formatRs(total)}</dd></div>
            </dl>
            <Link to="/checkout" className="btn btn--gold btn--lg btn--block">
              Proceed to checkout <Icon name="arrow" />
            </Link>
            <a className="btn btn--ghost btn--block" href={orderLink(lines, total)} target="_blank" rel="noopener noreferrer">
              <Icon name="chat" /> Order on WhatsApp instead
            </a>
            <ul className="summary__trust">
              <li><Icon name="box" /> Cash on delivery available</li>
              <li><Icon name="phone" /> We call to confirm every order</li>
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
