import CategoryIcon from "./CategoryIcon.jsx";
import { useCutout } from "../useCutout.js";

// The product's cutout (shown whole) or first photo, or its category icon when it has no photos yet.
// White-background photos are cut out in the browser so no box shows behind the product.
export default function ProductThumb({ product, className = "" }) {
  const photo = product.cutout ? null : product.images?.[0];
  const autoCut = useCutout(photo);
  const src = product.cutout || autoCut || photo;
  const kind = product.cutout || autoCut ? "thumb--cutout" : src ? "thumb--photo" : "";
  return (
    <div className={`thumb art--${product.category} ${kind} ${className}`}>
      {src ? <img src={src} alt="" loading="lazy" /> : <CategoryIcon category={product.category} />}
    </div>
  );
}
