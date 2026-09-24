import { Link, useParams } from "react-router-dom";
import PostCover from "../components/PostCover.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Icon from "../components/Icon.jsx";
import NotFound from "./NotFound.jsx";
import { Meta } from "./Blog.jsx";
import { posts } from "../data/posts.js";
import { categories, products } from "../data/products.js";

export default function BlogPost() {
  const { slug } = useParams();
  const post = posts.find((p) => p.slug === slug);
  if (!post) return <NotFound />;

  const category = categories.find((c) => c.id === post.category);
  const related = products.filter((p) => p.category === post.category).slice(0, 4);
  const more = posts.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <>
      <article className="article">
        <header className="article__head">
          <div className="container article__narrow">
            <Link to="/blog" className="article__back">
              <Icon name="arrow" /> All articles
            </Link>
            <Meta post={post} />
            <h1>{post.title}</h1>
            <p className="article__lead">{post.excerpt}</p>
          </div>
        </header>

        <div className="container article__narrow">
          <PostCover post={post} className="article__cover" />
          <div className="article__body">
            {post.body.map((b, i) =>
              b.h ? (
                <h2 key={i}>{b.h}</h2>
              ) : b.list ? (
                <ul key={i}>
                  {b.list.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              ) : (
                <p key={i}>{b.p}</p>
              ),
            )}
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="section section--paper">
          <div className="container">
            <div className="section__head section__head--row">
              <div>
                <p className="eyebrow">Shop the article</p>
                <h2>{category.name}</h2>
              </div>
              <Link to={`/shop?cat=${category.id}`} className="link-arrow">
                View all <Icon name="arrow" />
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
          <div className="section__head">
            <p className="eyebrow">Keep reading</p>
            <h2>More from the journal</h2>
          </div>
          <div className="post-grid post-grid--two">
            {more.map((p) => (
              <Link key={p.slug} to={`/blog/${p.slug}`} className="post-card">
                <PostCover post={p} />
                <div className="post-card__body">
                  <Meta post={p} />
                  <h3>{p.title}</h3>
                  <p>{p.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
