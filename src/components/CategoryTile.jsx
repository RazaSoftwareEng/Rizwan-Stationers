import { Link } from "react-router-dom";
import { useCutout } from "../useCutout.js";
import { categoryImages } from "../data/categoryImages.js";
import CategoryIcon from "./CategoryIcon.jsx";

// A product photo with its white backdrop removed (plain photo until the cut-out is ready)
function CutImg({ src, className }) {
  const cut = useCutout(src);
  return <img src={cut || src} alt="" loading="lazy" className={className + (cut ? " is-cut" : "")} />;
}

// Home-page category tile: a fixed photo if one is set in data/categoryImages.js,
// otherwise a small fan of up to three of the category's own product photos.
export default function CategoryTile({ category, products }) {
  const fixed = categoryImages[category.id];
  const photos = fixed
    ? []
    : [...new Set(products.filter((p) => p.category === category.id && p.images[0]).map((p) => p.images[0]))].slice(0, 3);
  // middle photo in front, the others behind it to the left and right
  const order = photos.length === 3 ? [photos[1], photos[0], photos[2]] : photos;

  return (
    <Link to={`/shop?cat=${category.id}`} className="tile">
      <span className={`tile__pic art--${category.id}` + (fixed ? " tile__pic--photo" : photos.length ? ` tile__pic--fan tile__pic--n${photos.length}` : "")}>
        {fixed ? (
          <img src={fixed} alt="" loading="lazy" />
        ) : photos.length ? (
          order.map((src, i) => <CutImg key={src} src={src} className={`tile__item tile__item--${photos.length === 1 ? "solo" : ["left", "front", "right"][photos.length === 2 ? i * 2 : i]}`} />)
        ) : (
          <CategoryIcon category={category.id} />
        )}
      </span>
      <span className="tile__name">{category.name}</span>
      <span className="tile__count">{category.blurb}</span>
    </Link>
  );
}
