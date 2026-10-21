import { Fragment, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PostCover from "../components/PostCover.jsx";
import ProductCard from "../components/ProductCard.jsx";
import ProductThumb from "../components/ProductThumb.jsx";
import Icon from "../components/Icon.jsx";
import NotFound from "./NotFound.jsx";
import { Meta } from "./Blog.jsx";
import { posts, formatDate } from "../data/posts.js";
import { useCatalog, stockStatus } from "../catalog.jsx";
import { useCart, formatRs } from "../cart.jsx";
import { flyToCart } from "../flyToCart.js";
import { useSeo, absUrl, breadcrumbLd, SITE_NAME } from "../seo.js";

// "[text](/path)" → router link, "**text**" → bold; everything else stays plain text.
// Links to products or categories the shop doesn't have (yet) render as plain text.
function Rich({ text }) {
  const { findProduct, categories } = useCatalog();
  const exists = (to) => {
    const prod = to.match(/^\/product\/([^/?#]+)/);
    if (prod) return !!findProduct(prod[1]);
    const cat = to.match(/^\/shop\?cat=([^&#]+)/);
    if (cat) return categories.some((c) => c.id === cat[1]);
    return true;
  };
  const parts = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      m[3] ? (
        <strong key={m.index}>{m[3]}</strong>
      ) : !exists(m[2]) ? (
        <Fragment key={m.index}>{m[1]}</Fragment>
      ) : (
        <Link key={m.index} to={m[2]} className="article__link">
          {m[1]}
        </Link>
      ),
    );
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.map((p, i) => <Fragment key={i}>{p}</Fragment>);
}

const plain = (text) => text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "");
const slugify = (s) =>
  plain(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function postSeo(post) {
  if (!post) return { title: "Page Not Found", description: "This article could not be found.", noindex: true };
  const path = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: plain(post.excerpt),
    path,
    image: post.cover,
    type: "article",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: plain(post.excerpt),
        datePublished: post.date,
        dateModified: post.updated || post.date,
        mainEntityOfPage: absUrl(path),
        ...(post.cover && { image: absUrl(post.cover) }),
        author: { "@type": "Organization", name: SITE_NAME },
        publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: absUrl("/logo.jpeg") } },
      },
      breadcrumbLd([
        ["Home", "/"],
        ["Journal", "/blog"],
        [post.title, path],
      ]),
    ],
  };
}

// thin gold bar at the top of the screen that fills as you read
function useReadingProgress(ref) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      setProgress(Math.min(1, Math.max(0, (window.innerHeight * 0.4 - r.top) / Math.max(1, total))));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ref]);
  return progress;
}

// the section heading currently being read
function useActiveHeading(ids) {
  const [active, setActive] = useState(ids[0]);
  const key = ids.join("|");
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.3;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return active;
}

function Toc({ headings, active, onPick }) {
  return (
    <ol className="toc">
      {headings.map((h, i) => (
        <li key={h.id}>
          <a
            href={`#${h.id}`}
            className={"toc__link" + (h.id === active ? " is-active" : "")}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              history.replaceState(null, "", `#${h.id}`);
              onPick?.();
            }}
          >
            <span className="toc__num">{String(i + 1).padStart(2, "0")}</span>
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

function Share({ post, compact = false }) {
  const [copied, setCopied] = useState(false);
  const url = absUrl(`/blog/${post.slug}`);
  const wa = `https://wa.me/?text=${encodeURIComponent(`${post.title} — ${url}`)}`;
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — nothing to do */
    }
  }
  return (
    <div className={"share" + (compact ? " share--compact" : "")}>
      <a className="share__btn share__btn--wa" href={wa} target="_blank" rel="noopener noreferrer">
        <Icon name="chat" /> {compact ? "WhatsApp" : "Share on WhatsApp"}
      </a>
      <button type="button" className="share__btn" onClick={copy} aria-live="polite">
        <Icon name={copied ? "check" : "link"} /> {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}

// a product mentioned mid-article, with a quick add to cart
function ArticleProduct({ id, note }) {
  const { findProduct } = useCatalog();
  const product = findProduct(id);
  const { add, qtyOf } = useCart();
  const ref = useRef(null);
  if (!product) return null;
  const status = stockStatus(product);
  const out = status.kind === "out" || (product.stock != null && qtyOf(product.id) >= product.stock);
  return (
    <aside className="aprod" ref={ref}>
      <Link to={`/product/${product.id}`} className="aprod__img" tabIndex={-1} aria-hidden="true">
        <ProductThumb product={product} />
      </Link>
      <div className="aprod__body">
        <p className="aprod__label">From the shop</p>
        <Link to={`/product/${product.id}`} className="aprod__name">
          {product.name}
        </Link>
        {note && <p className="aprod__note">{note}</p>}
        <div className="aprod__row">
          <strong>{formatRs(product.price)}</strong>
          <button
            type="button"
            className="btn btn--outline aprod__add"
            disabled={out}
            onClick={() => {
              flyToCart(ref.current?.querySelector(".aprod__img img"));
              add(product.id, 1, { silent: true });
            }}
          >
            <Icon name="bag" />
            {status.kind === "out" ? "Out of stock" : "Add to cart"}
          </button>
        </div>
      </div>
    </aside>
  );
}

function Block({ b }) {
  if (b.h) return <h2 id={slugify(b.h)}>{b.h}</h2>;
  if (b.h3) return <h3>{b.h3}</h3>;
  if (b.list)
    return (
      <ul>
        {b.list.map((li) => (
          <li key={li}>
            <Rich text={li} />
          </li>
        ))}
      </ul>
    );
  if (b.steps)
    return (
      <ol className="asteps">
        {b.steps.map((s, i) => (
          <li key={s.title} className="asteps__item">
            <span className="asteps__num" aria-hidden="true">
              {i + 1}
            </span>
            <div>
              <h3 className="asteps__title">{s.title}</h3>
              <p>
                <Rich text={s.text} />
              </p>
            </div>
          </li>
        ))}
      </ol>
    );
  if (b.tip)
    return (
      <div className={`callout callout--${b.kind || "tip"}`} role="note">
        <p className="callout__title">{b.title || (b.kind === "warn" ? "Watch out" : b.kind === "note" ? "Note" : "Tip")}</p>
        <p>
          <Rich text={b.tip} />
        </p>
      </div>
    );
  if (b.quote)
    return (
      <figure className="pullquote">
        <blockquote>
          <Rich text={b.quote} />
        </blockquote>
        {b.cite && <figcaption>{b.cite}</figcaption>}
      </figure>
    );
  if (b.product) return <ArticleProduct id={b.product} note={b.note} />;
  if (b.table)
    return (
      <div className="atable" role="region" aria-label="Table" tabIndex={0}>
        <table>
          <thead>
            <tr>
              {b.table.head.map((h) => (
                <th key={h} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.table.rows.map((row, i) => (
              <tr key={i}>
                {row.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}><Rich text={c} /></td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  return (
    <p>
      <Rich text={b.p} />
    </p>
  );
}

export default function BlogPost() {
  const { slug } = useParams();
  const post = posts.find((p) => p.slug === slug);
  const bodyRef = useRef(null);
  const [tocOpen, setTocOpen] = useState(false);
  useSeo(postSeo(post));
  const headings = (post?.body || []).filter((b) => b.h).map((b) => ({ id: slugify(b.h), text: b.h }));
  const progress = useReadingProgress(bodyRef);
  const active = useActiveHeading(headings.map((h) => h.id));
  const { products, categories, findProduct } = useCatalog();
  if (!post) return <NotFound />;

  const category = categories.find((c) => c.id === post.category);
  // products the article mentions come first, then the rest of its category
  const json = JSON.stringify(post.body);
  const mentioned = [
    ...new Set([
      ...post.body.filter((b) => b.product).map((b) => b.product),
      ...[...json.matchAll(/\(\/product\/([\w-]+)\)/g)].map((m) => m[1]),
    ]),
  ];
  let related = [
    ...mentioned.map((id) => findProduct(id)).filter(Boolean),
    ...products.filter((p) => p.category === post.category && !mentioned.includes(p.id)),
  ].slice(0, 4);
  // nothing related yet: show the newest products instead
  const fromShop = !related.length;
  if (fromShop) related = [...products].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 4);
  // most relevant articles first: same category, then posts that link here, then the newest
  const score = (p) =>
    (p.category === post.category ? 2 : 0) + (JSON.stringify(p.body).includes(`/blog/${slug}`) ? 1 : 0);
  const more = posts
    .filter((p) => p.slug !== slug)
    .sort((a, b) => score(b) - score(a) || b.date.localeCompare(a.date))
    .slice(0, 2);
  const nextPost = (post.next && posts.find((p) => p.slug === post.next)) || more[0];
  const minutesLeft = Math.max(1, Math.ceil(post.readTime * (1 - progress)));

  return (
    <>
      <div className="readbar" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>

      <article className="article">
        <header className="article__head">
          <div className="container article__layout">
            <div className="article__main">
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true">/</span>
              <Link to="/blog">Journal</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{post.topic}</span>
            </nav>
            <Meta post={post} />
            <h1>{post.title}</h1>
            <p className="article__lead">{plain(post.excerpt)}</p>
            <div className="byline">
              <img src="/logo.jpeg" alt="" width="44" height="44" />
              <div>
                <strong>By the Rizwan Stationer team</strong>
                <span>
                  Main Urdu Bazar, Lahore · Updated <time dateTime={post.updated || post.date}>{formatDate(post.updated || post.date)}</time>
                </span>
              </div>
            </div>
            </div>
          </div>
        </header>

        <div className="container article__layout">
          <div className="article__main">
            <PostCover post={post} className="article__cover" />

            {headings.length > 2 && (
              <div className={"toc-mobile" + (tocOpen ? " is-open" : "")}>
                <button type="button" className="toc-mobile__toggle" onClick={() => setTocOpen((o) => !o)} aria-expanded={tocOpen}>
                  <span>
                    In this guide <small>· {headings.length} sections</small>
                  </span>
                  <Icon name={tocOpen ? "minus" : "plus"} />
                </button>
                {tocOpen && <Toc headings={headings} active={active} onPick={() => setTocOpen(false)} />}
              </div>
            )}

            {post.takeaways?.length > 0 && (
              <section className="takeaways" aria-label="Key takeaways">
                <p className="takeaways__title">Key takeaways</p>
                <ul>
                  {post.takeaways.map((t) => (
                    <li key={t}>
                      <Icon name="check" strokeWidth={2} />
                      <span>
                        <Rich text={t} />
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="article__body" ref={bodyRef}>
              {post.body.map((b, i) => (
                <Block key={i} b={b} />
              ))}
            </div>

            <div className="article__end">
              <p>Found this guide useful? Share it with someone setting up their desk, school bag or first pen.</p>
              <Share post={post} />
            </div>

            {nextPost && (
              <Link to={`/blog/${nextPost.slug}`} className="article__next">
                <span className="article__next-label">Read next · {nextPost.readTime} min</span>
                <span className="article__next-title">{nextPost.title}</span>
                <span className="article__next-excerpt">{plain(nextPost.excerpt)}</span>
                <Icon name="arrow" />
              </Link>
            )}
          </div>

          <aside className="article__aside" aria-label="Article navigation">
            <div className="article__sticky">
              <p className="aside__title">On this page</p>
              <Toc headings={headings} active={active} />
              <div className="aside__progress">
                <span className="aside__ring" style={{ "--p": progress }} aria-hidden="true" />
                <span>{progress >= 0.98 ? "Finished — thanks for reading" : `${minutesLeft} min left`}</span>
              </div>
              <Share post={post} compact />
            </div>
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section className="section section--paper">
          <div className="container">
            <div className="section__head section__head--row">
              <div>
                <p className="eyebrow">{fromShop ? "From the shop" : "Shop the article"}</p>
                <h2>{fromShop ? "New in the shop" : "Mentioned in this guide"}</h2>
              </div>
              <Link to={category ? `/shop?cat=${category.id}` : "/shop"} className="link-arrow">
                {category ? `All ${category.name}` : "Shop all"} <Icon name="arrow" />
              </Link>
            </div>
            <div className="grid">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="section__head section__head--row">
            <div>
              <p className="eyebrow">Keep reading</p>
              <h2>More from the journal</h2>
            </div>
            <Link to="/blog" className="link-arrow">
              All articles <Icon name="arrow" />
            </Link>
          </div>
          <div className="post-grid post-grid--two">
            {more.map((p) => (
              <Link key={p.slug} to={`/blog/${p.slug}`} className="post-card">
                <PostCover post={p} />
                <div className="post-card__body">
                  <Meta post={p} />
                  <h3>{p.title}</h3>
                  <p>{plain(p.excerpt)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
