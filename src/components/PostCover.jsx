import CategoryIcon from "./CategoryIcon.jsx";

// Uses the post's photo when it has one; otherwise a branded navy cover.
export default function PostCover({ post, className = "" }) {
  if (post.cover) {
    return (
      <div className={"post-cover " + className}>
        <img src={post.cover} alt="" loading="lazy" />
      </div>
    );
  }
  return (
    <div className={`post-cover post-cover--art art--${post.category} ` + className}>
      <span className="art__ring">
        <CategoryIcon category={post.category} />
      </span>
    </div>
  );
}
