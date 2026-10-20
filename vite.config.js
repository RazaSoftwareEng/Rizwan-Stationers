import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { products, categories } from "./src/data/products.js";
import { posts } from "./src/data/posts.js";

// Writes sitemap.xml and robots.txt into the build.
// The site address comes from SITE_URL, or Netlify's own URL variable during a Netlify build.
function seoFiles() {
  return {
    name: "seo-files",
    apply: "build",
    generateBundle() {
      const site = (process.env.SITE_URL || process.env.URL || "").replace(/\/$/, "");
      const today = new Date().toISOString().slice(0, 10);
      const pages = [
        { path: "/", priority: "1.0", changefreq: "weekly" },
        { path: "/shop", priority: "0.9", changefreq: "daily" },
        ...categories.flatMap((c) => [
          { path: `/shop?cat=${c.id}`, priority: "0.8", changefreq: "weekly" },
          ...c.subs.map((s) => ({ path: `/shop?cat=${c.id}&sub=${s.id}`, priority: "0.6", changefreq: "weekly" })),
        ]),
        ...products.map((p) => ({ path: `/product/${p.id}`, priority: "0.8", changefreq: "weekly" })),
        { path: "/blog", priority: "0.7", changefreq: "weekly" },
        ...posts.map((p) => ({ path: `/blog/${p.slug}`, priority: "0.7", changefreq: "monthly", lastmod: p.updated || p.date })),
        { path: "/about", priority: "0.5", changefreq: "monthly" },
        { path: "/contact", priority: "0.5", changefreq: "monthly" },
      ];

      let robots = "User-agent: *\nAllow: /\nDisallow: /cart\nDisallow: /checkout\nDisallow: /orders\nDisallow: /order-confirmed\n";
      if (site) {
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

export default defineConfig({
  plugins: [react(), seoFiles()],
});
