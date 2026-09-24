import CategoryIcon from "./CategoryIcon.jsx";

// The product's first photo, or its category icon when it has no photos yet.
export default function ProductThumb({ product, className = "" }) {
  const src = product.images?.[0];
  return (
    <div className={`thumb art--${product.category} ${src ? "thumb--photo" : ""} ${className}`}>
      {src ? <img src={src} alt="" loading="lazy" /> : <CategoryIcon category={product.category} />}
    </div>
  );
}
