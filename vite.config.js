import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { posts } from "./src/data/posts.js";

// The shop's product API. The site always calls it as same-origin /api/… —
// the Vite dev server (below) and Netlify (public/_redirects) forward those paths here,
// so the browser never makes a cross-origin call and the API needs no CORS setup.
const API_ORIGIN = "https://api.qomunix.com";

const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Product and category pages for the sitemap, read from the product API at build time.
// If the API can't be reached the build still succeeds, just without those pages.
async function catalogPages(apiBase, warn) {
  if (!apiBase) {
    warn("No API address — product pages left out of sitemap.xml");
    return [];
  }
  try {
    const res = await fetch(`${apiBase}/api/public/products/`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.results || [];
    const cats = [...new Set(list.map((p) => slugify(p.category || "Other")))];
    return [
      ...cats.map((c) => ({ path: `/shop?cat=${c}`, priority: "0.8", changefreq: "weekly" })),
      ...list.map((p) => ({
        path: `/product/${slugify(p.name) || "product"}-${p.id}`,
        priority: "0.8",
        changefreq: "weekly",
        lastmod: (p.updated_at || "").slice(0, 10) || undefined,
      })),
    ];
  } catch (err) {
    warn(`Could not read products from ${apiBase} (${err.message}) — product pages left out of sitemap.xml`);
    return [];
  }
}

// Writes sitemap.xml and robots.txt into the build.
// The site address comes from SITE_URL, or Netlify's own URL variable during a Netlify build.
function seoFiles(apiBase) {
  return {
    name: "seo-files",
    apply: "build",
    async generateBundle() {
      const site = (process.env.SITE_URL || process.env.URL || "").replace(/\/$/, "");
      const today = new Date().toISOString().slice(0, 10);

      let robots = "User-agent: *\nAllow: /\nDisallow: /cart\nDisallow: /checkout\nDisallow: /orders\nDisallow: /order-confirmed\nDisallow: /admin\nDisallow: /admin-login\n";
      if (site) {
        const pages = [
          { path: "/", priority: "1.0", changefreq: "weekly" },
          { path: "/shop", priority: "0.9", changefreq: "daily" },
          ...(await catalogPages(apiBase, (m) => this.warn(m))),
          { path: "/blog", priority: "0.7", changefreq: "weekly" },
          ...posts.map((p) => ({ path: `/blog/${p.slug}`, priority: "0.7", changefreq: "monthly", lastmod: p.updated || p.date })),
          { path: "/about", priority: "0.5", changefreq: "monthly" },
          { path: "/contact", priority: "0.5", changefreq: "monthly" },
        ];
        const esc = (s) => s.replace(/&/g, "&amp;");
        const urls = pages
          .map(
            (p) =>
              `  <url>\n    <loc>${esc(site + p.path)}</loc>\n    <lastmod>${p.lastmod || today}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`,
          )
          .join("\n");
        this.emitFile({
          type: "asset",
          fileName: "sitemap.xml",
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
        });
        robots += `\nSitemap: ${site}/sitemap.xml\n`;
      } else {
        this.warn("SITE_URL not set — skipping sitemap.xml (Netlify builds set it automatically)");
      }
      this.emitFile({ type: "asset", fileName: "robots.txt", source: robots });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const api = (env.API_ORIGIN || API_ORIGIN).replace(/\/$/, "");
  return {
    plugins: [react(), seoFiles(api)],
    server: {
      proxy: {
        "/api": { target: api, changeOrigin: true, secure: true },
        "/media": { target: api, changeOrigin: true, secure: true },
      },
    },
    preview: {
      proxy: {
        "/api": { target: api, changeOrigin: true, secure: true },
        "/media": { target: api, changeOrigin: true, secure: true },
      },
    },
  };
});
