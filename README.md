# Rizwan Stationers — Cinematic Hero Experience

A premium, cinematic, scroll-driven homepage opening for
**[rizwanstationers.com](https://rizwanstationers.com/)** — real stationery
products, suspended in a studio, that descend and assemble themselves onto a
finished desk as you scroll. Built as one continuous shot: floating hero →
camera descent → empty desk → product assembly → shop-the-desk CTA.

> The animation is meant to be *felt, not noticed.* Real products, realistic
> light, smooth scroll, minimal UI.

## Live preview

```bash
python3 -m http.server 4187
# open http://127.0.0.1:4187/index.html
```

No build step. `index.html` + `assets/` is the whole thing.

## What's here

| File | Role |
|------|------|
| `index.html` | Page shell — the pinned stage + the brand homepage below it |
| `assets/css/hero.css` | Full design system (ivory paper · charcoal ink · one brass accent) |
| `assets/js/products.js` | **Real** Rizwan Stationers catalogue data + composition layout |
| `assets/js/hero.js` | Scroll engine: GSAP timeline, floating physics, parallax, hover, mobile, fallback |
| `assets/vendor/` | GSAP 3.12.5 + ScrollTrigger, vendored (no runtime CDN dependency) |
| `sections/cinematic-hero.liquid` | Shopify theme section — the integration path (see below) |

## Real products (nothing invented)

Every object is a genuine catalogue item — name, price (PKR), product page and
photograph come straight from the live Shopify store, so each floating piece
links to a real product:

| Product | Price | Role in the scene |
|---------|------:|-------------------|
| Log Book — Large | Rs. 450 | Anchor — lands first, centre-desk |
| Ball Point — Uni-ball Signo | Rs. 1,080 | The pen |
| Scientific Calculator — Casio FX-991ES | Rs. 1,975 | Background depth |
| Steel Scale — 12″ | Rs. 75 | Ruler |
| Post-it Pad — Multi Colour 3×5 | Rs. 450 | Sticky notes |
| Binder Clip — 41mm | Rs. 360 | Small accent |
| Highlighter — Dollar 1×12 | Rs. 840 | Colour accent |

Product photos are served straight from the store's own Shopify CDN
(`cdn.shopify.com`) with a `width` parameter so the browser never pulls a
full-size original; the CDN auto-negotiates WebP. Category cards below the film
use the store's real collection imagery.

## How it maps to the brief

- **Section 01 — floating hero.** Editorial line-by-line headline reveal, brand
  label, sub-copy, primary + secondary CTAs, and 5–8 real products suspended
  with subtle idle drift + depth-aware mouse parallax (foreground reacts more
  than background). Scroll indicator at the base.
- **Hero → desk transition.** The stage is *pinned*; as you scroll the studio
  darkens into a room, a desk rises, and the whole product layer travels
  downward — one continuous camera move, no hard section break.
- **Section 02 — desk assembly.** "Your desk. Your ideas." → products settle one
  by one with weighted `power3.inOut` easing (no bounce, no spin, no pop),
  contact shadows deepening as each piece lands → "Everything you need. For the
  way you work." + **Shop the desk →**.
- **Hover.** Once the desk is complete, each product lifts slightly and reveals
  its name, blurb and price with a **View →** link to the product page.
- **Motion language.** One consistent, weighted, cinematic easing set. GPU-only
  `transform`/`opacity`; nothing animates layout properties.

## Responsive & accessible

- **Desktop** — full experience, 7 products, parallax + float.
- **Mobile** (`≤ 860px`) — a *purpose-built* simpler timeline: 5 essential
  products, smaller plates, a lower cluster that never crowds the headline,
  reduced travel and parallax.
- **`prefers-reduced-motion`** *(or if GSAP is unavailable)* — the whole thing
  degrades to a clean, static, fully-shoppable layout: hero copy, a tidy product
  grid with names/prices/links, and the brand page below. No pinning, no rAF.
  Verified: every product, CTA and link remains present and usable.

## Performance

- First viewport paints immediately — only the two foreground product images are
  `eager`; the rest are `loading="lazy"`, and everything below the film is lazy.
- GSAP is vendored locally (~115 KB total, gzipped far less) — no third-party
  runtime dependency, no render-blocking CDN.
- One shared `gsap.ticker` render loop writes all transforms; the pointer is
  eased, not read per-event.

## Shopify integration

`sections/cinematic-hero.liquid` is the drop-in for the live theme. The merchant
picks real products in the theme editor and the section feeds their
title / price / URL / image into the *same* `hero.js` engine (via
`window.RS_PRODUCTS`); `products.js` fills each picked product into the tuned
composition slots. Install notes are in the file header. The standalone
`index.html` is the reference/QA build and works on its own.

## Notes

- Built with GSAP + ScrollTrigger per the brief's technical direction — no heavy
  WebGL; the cinematic effect is pure optimised DOM/image transforms.
- Product cutouts: the brief allows *either* an isolated cutout *or* the actual
  product image. This build uses the **actual store photographs** presented as
  soft, shadow-lifted studio plates. If true transparent-background cutouts are
  wanted later, run the same images through background removal and swap the URLs
  in `products.js` — no other change needed.
