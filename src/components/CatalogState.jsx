import { useCatalog } from "../catalog.jsx";

// Placeholder shown while products load, or when the product service can't be reached.
// Renders nothing once products are ready.
export default function CatalogState({ empty = "No products yet — new stock is on the way." }) {
  const { status, error, products, reload } = useCatalog();
  if (status === "loading") {
    return (
      <div className="catalog-state" role="status">
        <span className="catalog-state__spinner" aria-hidden="true" />
        Loading products…
      </div>
    );
  }
  if (status === "error" && !products.length) {
    return (
      <div className="catalog-state catalog-state--error" role="alert">
        <p>We couldn't load the products right now.</p>
        <small>{error}</small>
        <button type="button" className="btn btn--ghost" onClick={reload}>
          Try again
        </button>
      </div>
    );
  }
  if (!products.length) return <div className="catalog-state">{empty}</div>;
  return null;
}
