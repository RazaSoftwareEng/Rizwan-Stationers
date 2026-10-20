import CategoryIcon from "./CategoryIcon.jsx";

// The product's cutout (shown whole) or first photo, or its category icon when it has no photos yet.
export default function ProductThumb({ product, className = "" }) {
  const src = product.cutout || product.images?.[0];
  const kind = product.cutout ? "thumb--cutout" : src ? "thumb--photo" : "";
  return (
    <div className={`thumb art--${product.category} ${kind} ${className}`}>
      {src ? <img src={src} alt="" loading="lazy" /> : <CategoryIcon category={product.category} />}
    </div>
  );
}
