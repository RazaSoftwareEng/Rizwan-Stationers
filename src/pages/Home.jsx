import { Link } from "react-router-dom";
import BeforeAfter from "../components/BeforeAfter.jsx";
import ShopTheDesk from "../components/ShopTheDesk.jsx";
import ProductCard from "../components/ProductCard.jsx";
import SubIcon from "../components/SubIcon.jsx";
import Icon from "../components/Icon.jsx";
import { products, homeTiles, categoryImages, findSubById } from "../data/products.js";
import { shop } from "../data/shop.js";
import { posts } from "../data/posts.js";
import PostCover from "../components/PostCover.jsx";
import { Meta } from "./Blog.jsx";
import { formatRs, FREE_DELIVERY_FROM } from "../cart.jsx";

const featured = products.filter((p) => p.tag).slice(0, 4);

const perks = [
  { icon: "truck", title: "Free Lahore delivery", text: `On orders over ${formatRs(FREE_DELIVERY_FROM)}` },
  { icon: "shield", title: "Genuine products", text: "Only brands we trust ourselves" },
  { icon: "box", title: "School & office bulk", text: "Special rates on large orders" },
  { icon: "chat", title: "Order on WhatsApp", text: "Send your list, we'll pack it" },
];

export default function Home() {
  const listLink = `https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(
    "Assalam-o-Alaikum, here is my stationery list:",
  )}`;

  return (
    <>
      {/* ---- hero ---- */}
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__copy">
            <p className="eyebrow">Est. 1995 · Lahore</p>
            <h1>
              Fine stationery for work, school &amp; <em>the written word</em>
            </h1>
            <p className="hero__lead">
              From fountain pens and leather journals to everyday notebooks and desk
              organisers — everything your desk needs, chosen with care.
            </p>
            <div className="hero__actions">
              <Link to="/shop" className="btn btn--lg">
                Shop the collection
                <Icon name="arrow" />
              </Link>
              <a href={listLink} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--lg">
                Send your list
              </a>
            </div>
            <ul className="hero__facts">
              <li><strong>30+ years</strong><span>serving Lahore</span></li>
              <li><strong>Free delivery</strong><span>in Lahore over {formatRs(FREE_DELIVERY_FROM)}</span></li>
            </ul>
          </div>

          <div className="hero__media">
            <div className="hero__frame">
              <img src="/after.png" alt="A neatly organised desk with pens, notebook and a desk organiser" width="1670" height="941" />
            </div>
            <img className="hero__seal" src="/seal.png" alt="" width="120" height="120" />
          </div>
        </div>
      </section>

      {/* ---- perks ---- */}
      <section className="perks" aria-label="Why shop with us">
        <div className="container perks__grid">
          {perks.map((p) => (
            <div key={p.title} className="perk">
              <Icon name={p.icon} className="perk__icon" />
              <div>
                <p className="perk__title">{p.title}</p>
                <p className="perk__text">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- categories ---- */}
      <section className="section">
        <div className="container">
          <div className="section__head section__head--row">
            <div>
              <p className="eyebrow">Collections</p>
              <h2>Shop by category</h2>
            </div>
            <Link to="/shop" className="link-arrow">
              Shop all <Icon name="arrow" />
            </Link>
          </div>
          <ul className="tiles">
            {homeTiles.map(findSubById).filter(Boolean).map((s) => (
              <li key={s.id}>
                <Link to={`/shop?cat=${s.cat}&sub=${s.id}`} className="tile">
                  <span className="tile__pic">
                    {categoryImages[s.id] ? (
                      <img src={categoryImages[s.id]} alt="" loading="lazy" />
                    ) : (
                      <SubIcon sub={s.id} />
                    )}
                  </span>
                  <span className="tile__name">{s.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- before / after ---- */}
      <section className="section section--navy">
        <div className="container">
          <div className="section__head section__head--center">
            <p className="eyebrow eyebrow--gold">The DeskZen Organiser</p>
            <h2>From cluttered to clear</h2>
            <p className="section__lead">
              Drag the slider to see what one organiser does for a busy desk.
            </p>
          </div>
          <BeforeAfter />
          <div className="center section__cta">
            <Link to="/shop?cat=organisers" className="btn btn--gold btn--lg">
              Shop organisers
              <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---- featured ---- */}
      <section className="section">
        <div className="container">
          <div className="section__head section__head--row">
            <div>
              <p className="eyebrow">Our picks</p>
              <h2>Customer favourites</h2>
            </div>
            <Link to="/shop" className="link-arrow">
              View all products <Icon name="arrow" />
            </Link>
          </div>
          <div className="grid">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ---- shop the desk ---- */}
      <ShopTheDesk />

      {/* ---- heritage ---- */}
      <section className="section section--paper">
        <div className="container heritage">
          <img className="heritage__seal" src="/seal.png" alt="Rizwan Stationer seal — Est. 1995" width="220" height="220" />
          <div>
            <p className="eyebrow">Our story</p>
            <h2>A Lahore stationer since 1995</h2>
            <p className="section__lead">
              For three decades, families, schools and offices have trusted us for the
              things they write with and write on. The shop has grown — the care hasn't.
            </p>
            <Link to="/about" className="link-arrow">
              Read our story <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---- journal ---- */}
      <section className="section">
        <div className="container">
          <div className="section__head section__head--row">
            <div>
              <p className="eyebrow">The journal</p>
              <h2>From the blog</h2>
            </div>
            <Link to="/blog" className="link-arrow">
              All articles <Icon name="arrow" />
            </Link>
          </div>
          <div className="post-grid">
            {posts.slice(0, 3).map((post) => (
              <Link key={post.slug} to={`/blog/${post.slug}`} className="post-card">
                <PostCover post={post} />
                <div className="post-card__body">
                  <Meta post={post} />
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---- list cta ---- */}
      <section className="section">
        <div className="container">
          <div className="cta-band">
            <div>
              <h2>Have a school or office list?</h2>
              <p>Send it on WhatsApp — we'll pack everything and tell you the total.</p>
            </div>
            <a href={listLink} target="_blank" rel="noopener noreferrer" className="btn btn--gold btn--lg">
              <Icon name="chat" />
              Send on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
