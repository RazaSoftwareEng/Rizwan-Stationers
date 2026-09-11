# Install the Cinematic Hero on your Shopify store

This bundle is ready to upload — the file names are already the flat names
Shopify's `assets/` folder requires. Nothing else to rename.

```
shopify/
├─ assets/
│  ├─ rizwan-hero.css               → Theme "Assets" folder
│  ├─ rizwan-products.js            → Theme "Assets" folder
│  ├─ rizwan-hero.js                → Theme "Assets" folder
│  ├─ rizwan-gsap.min.js            → Theme "Assets" folder
│  └─ rizwan-scrolltrigger.min.js   → Theme "Assets" folder
└─ sections/
   └─ cinematic-hero.liquid         → Theme "Sections" folder
```

## Before you start (recommended)
Shopify → **Online Store → Themes → ⋯ → Duplicate** your live theme, and do
this on the copy first. You'll publish it once it looks right. This keeps your
live store untouched while you set it up.

## Step 1 — Upload the 5 asset files
1. Shopify admin → **Online Store → Themes**.
2. On your theme (the duplicate), click **⋯ → Edit code**.
3. In the left sidebar find the **Assets** folder → **Add a new asset →
   Upload file**.
4. Upload all five files from `shopify/assets/`:
   `rizwan-hero.css`, `rizwan-products.js`, `rizwan-hero.js`,
   `rizwan-gsap.min.js`, `rizwan-scrolltrigger.min.js`.
   *(Upload the assets **before** the section, or the section will 404 on them.)*

## Step 2 — Add the section
1. Still in **Edit code**, find the **Sections** folder → **Add a new section**.
2. Name it `cinematic-hero` (Shopify creates `cinematic-hero.liquid`).
3. Delete the auto-generated starter content and paste the **entire** contents
   of `shopify/sections/cinematic-hero.liquid`.
4. **Save**.

## Step 3 — Put it on your homepage
1. Shopify admin → **Online Store → Themes → Customize** (on the same theme).
2. Make sure you're editing the **Home page** (top dropdown).
3. In the left panel click **Add section** → choose **Cinematic Hero**.
4. Drag it to the **very top** of the page (above your existing hero/slideshow).
   You'll usually want to **hide or remove your old hero banner** so this is the
   first thing visitors see.

## Step 4 — Pick your real products
In the section's settings (left panel), open each **Product** block and choose a
product. The order matters — it's the composition + the order pieces land on the
desk:

| Block | Suggested product | Role |
|------:|-------------------|------|
| 1 | a notebook / log book / register | anchor (lands first, centre) |
| 2 | a pen (Uni-ball, ballpoint) | the pen |
| 3 | a calculator | background depth |
| 4 | a ruler / steel scale | ruler |
| 5 | sticky notes / Post-it | notes |
| 6 | a binder clip | small accent |
| 7 | a highlighter / marker | colour accent |

Use **5–7 blocks** (5 is plenty on mobile — only the first 5 show on phones).
Each block also has an optional **Short blurb** shown on hover.

You can also edit the headline, sub-copy, and every CTA link right there in the
theme editor.

## Step 5 — Preview & publish
- Scroll the preview: products should float, then settle onto the desk as you
  scroll, ending on **"Everything you need…"** + **Shop the desk**.
- Check it on the mobile preview toggle too.
- Happy? **Online Store → Themes → Publish** the duplicated theme.

---

## Optional — the Book Unboxing section

A second, fully isolated section (`.rz-book-unbox`) that plays a scroll-driven
3D unboxing for a single book/notebook.

1. Upload `shopify/assets/rzbu-book-unbox.css` and `rzbu-book-unbox.js` to
   **Assets** (it reuses the same `rizwan-gsap*.js` you already uploaded).
2. Add `shopify/sections/book-unbox.liquid` to **Sections**.
3. In **Customize**, add the **Book Unboxing** section wherever you want it,
   then pick a book/notebook product. Its title, price, image and link fill the
   scene automatically. Optionally set an eyebrow label, a short description and
   the button text.

It's self-contained — it doesn't affect the hero or any other section.

---

### Notes & troubleshooting
- **Product images are your own** — they come straight from each product's
  featured image, so hover links go to the real product pages and prices show in
  PKR automatically.
- **Nothing animates / it looks like a plain grid.** That's the built-in safe
  fallback — it appears when GSAP didn't load or the visitor has
  "reduce motion" enabled. Re-check that all five asset files uploaded and that
  the section's `<script>` names match them exactly.
- **The hero is very tall / scroll feels long.** That's the pinned scene doing
  its job — it holds while the desk assembles, then releases. To shorten it,
  in `rizwan-hero.js` find `end: () => "+=" + (isMobile() ? 420 : 560) + "%"`
  and lower `560` / `420`.
- **Fonts:** the section uses Manrope + Inter from Google Fonts. If your theme
  blocks external fonts, it falls back to a clean system sans automatically.
- **Updating GSAP later:** just replace the two `rizwan-gsap*.js` assets.
