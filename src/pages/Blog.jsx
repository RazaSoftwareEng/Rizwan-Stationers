import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import PostCover from "../components/PostCover.jsx";
import Icon from "../components/Icon.jsx";
import { posts, formatDate } from "../data/posts.js";

function Meta({ post }) {
  return (
    <p className="post-meta">
      <span className="post-meta__topic">{post.topic}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      <span aria-hidden="true">·</span>
      <span>{post.readTime} min read</span>
    </p>
  );
}

export default function Blog() {
  const topics = ["All", ...new Set(posts.map((p) => p.topic))];
  const [topic, setTopic] = useState("All");
  const list = posts.filter((p) => topic === "All" || p.topic === topic);
  const [lead, ...rest] = list;

  return (
    <>
      <PageHeader
        eyebrow="The journal"
        title="Notes from the counter"
        lead="Tips on writing, studying and staying organised — from the team at Rizwan Stationer."
      />

      <section className="section section--tight">
        <div className="container">
          <div className="chips blog-topics" role="group" aria-label="Filter by topic">
            {topics.map((t) => (
              <button
                key={t}
                type="button"
                className={"chip" + (topic === t ? " is-active" : "")}
                aria-pressed={topic === t}
                onClick={() => setTopic(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {lead && (
            <Link to={`/blog/${lead.slug}`} className="post-feature">
              <PostCover post={lead} />
              <div className="post-feature__body">
                <Meta post={lead} />
                <h2>{lead.title}</h2>
                <p>{lead.excerpt}</p>
                <span className="link-arrow">
                  Read article <Icon name="arrow" />
                </span>
              </div>
            </Link>
          )}

          {rest.length > 0 && (
            <div className="post-grid">
              {rest.map((post) => (
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
          )}
        </div>
      </section>
    </>
  );
}

export { Meta };
