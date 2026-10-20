import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { shop } from "./data/shop.js";

export const SITE_NAME = "Rizwan Stationer";
const DEFAULT_IMAGE = "/logo.jpeg";

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (content == null) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

function setJsonLd(data) {
  const id = "page-jsonld";
  document.getElementById(id)?.remove();
  if (!data) return;
  const el = document.createElement("script");
  el.type = "application/ld+json";
  el.id = id;
  el.textContent = JSON.stringify(data);
  document.head.appendChild(el);
}

export const absUrl = (path) => new URL(path, window.location.origin).href;

// Per-page title, description, canonical, social cards and structured data.
//   title       page title without the site name (omit on the home page)
//   description 140–160 characters, written for people
//   path        canonical path (defaults to the current path, without query)
//   image       social preview image path
//   type        og:type ("website", "article", "product")
//   noindex     keep private pages (cart, checkout…) out of search
//   jsonLd      structured data object or array
export function useSeo({ title, description, path, image, type = "website", noindex = false, jsonLd }) {
  const { pathname } = useLocation();
  const canonical = absUrl(path || pathname);
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Stationery & Fine Writing in Lahore`;
  const ld = JSON.stringify(jsonLd ?? null);

  useEffect(() => {
    document.title = fullTitle;
    setMeta("name", "description", description);
    setMeta("name", "robots", noindex ? "noindex, follow" : "index, follow, max-image-preview:large");
    setCanonical(canonical);

    const img = absUrl(image || DEFAULT_IMAGE);
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", type);
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:image", img);
    setMeta("property", "og:locale", "en_PK");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", img);

    setJsonLd(JSON.parse(ld));
  }, [fullTitle, description, canonical, image, type, noindex, ld]);
}

// structured-data helpers
export function breadcrumbLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: absUrl(path),
    })),
  };
}

export function storeLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: SITE_NAME,
    url: absUrl("/"),
    logo: absUrl("/logo.jpeg"),
    image: absUrl("/logo.jpeg"),
    telephone: shop.phone,
    email: shop.email,
    foundingDate: "1995",
    priceRange: "Rs",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Main Urdu Bazar",
      addressLocality: "Lahore",
      addressRegion: "Punjab",
      addressCountry: "PK",
    },
  };
}
