/* ==========================================================================
   Rizwan Stationers — Cinematic Hero
   Real catalogue data (Shopify — store: rizwanstationers.com, currency: PKR)

   Every product below is a REAL item from the live Rizwan Stationers catalogue.
   Names, prices, product handles and image URLs are pulled straight from the
   store, so the hero always links to a genuine product page and shows the
   genuine product photo — nothing is invented or redesigned.

   Layout note:
   Each product is anchored at the centre of the stage. `hero` describes where
   it floats in the opening (studio) frame; `desk` describes where it settles
   on the finished desk. x / y are offsets from centre in vw / vh units so the
   composition scales with the viewport. rot is degrees, scale is a multiplier,
   z drives depth (stacking + parallax strength), w is the base width in px.
   ========================================================================== */

const STORE = "https://rizwanstationers.com";

/* Shopify CDN images. We request a sensible width so the browser never pulls
   a multi-megabyte original, and the CDN auto-negotiates WebP where supported. */
function cdn(file, w = 720) {
  return `https://cdn.shopify.com/s/files/1/1013/5194/8581/files/${file}&width=${w}`;
}

const PRODUCTS = [
  {
    id: "notebook",
    name: "Log Book — Large",
    blurb: "Bound records that last the year",
    price: 450,
    handle: "log-book-large",
    img: cdn("Open_log_book_on_desk_202609071505.jpg?v=1788775555"),
    w: 300,
    // The anchor of the composition — enters first, sits centre-desk.
    hero:  { x: 13, y: -4,  rot: -6, scale: 1.02, z: 3, order: 0 },
    desk:  { x: -1, y: 20,  rot: -3, scale: 1.0,  z: 3 },
    mHero: { x: -15, y: 36, rot: -5, scale: 1.0 },
    mDesk: { x: 0,   y: 24, rot: -3, scale: 1.0 }
  },
  {
    id: "pen",
    name: "Ball Point — Uni-ball Signo",
    blurb: "Smooth everyday writing",
    price: 1080,
    handle: "ball-point-uniball-signo",
    img: cdn("Uni-ball_Signo_gel_pen_202609051206.jpg?v=1788592025"),
    w: 230,
    hero:  { x: 11, y: 26,  rot: 24,  scale: 0.9,  z: 5, order: 1 },
    desk:  { x: 15, y: 27,  rot: 62,  scale: 0.82, z: 5 },
    mHero: { x: 20, y: 39,  rot: 22,  scale: 0.86 },
    mDesk: { x: 20, y: 31,  rot: 58,  scale: 0.8 }
  },
  {
    id: "calculator",
    name: "Scientific Calculator — Casio FX-991ES",
    blurb: "991 functions, exam-ready",
    price: 1975,
    handle: "calculator-scientific-fx-991es-japan",
    img: cdn("Calculator_and_retail_packaging_box_202609051350.jpg?v=1788599405"),
    w: 250,
    hero:  { x: 33, y: 20,  rot: 8,   scale: 0.86, z: 2, order: 2 },
    desk:  { x: 26, y: 14,  rot: 6,   scale: 0.8,  z: 2 },
    mHero: { x: 3,  y: 29,  rot: 7,   scale: 0.82 },
    mDesk: { x: -22,y: 19,  rot: 6,   scale: 0.82 }
  },
  {
    id: "ruler",
    name: "Steel Scale — 12\"",
    blurb: "Stainless, precise edges",
    price: 75,
    handle: "scale-steel-12",
    img: cdn("Stainless_steel_ruler_resting_ho__202609071614.jpg?v=1788779723"),
    w: 300,
    hero:  { x: 30, y: -24, rot: 18,  scale: 0.82, z: 4, order: 3 },
    desk:  { x: -26,y: 30,  rot: 4,   scale: 0.82, z: 4 },
    mHero: { x: 20, y: 23,  rot: 16,  scale: 0.72 },
    mDesk: { x: -16,y: 35,  rot: 4,   scale: 0.78 }
  },
  {
    id: "sticky",
    name: "Post-it Pad — Multi Colour 3×5",
    blurb: "Ideas you can move around",
    price: 450,
    handle: "postid-pad-multi-color-3x5",
    img: cdn("Sticky_notes_on_wooden_desk_202609071610.jpg?v=1788779456"),
    w: 210,
    hero:  { x: 40, y: 3,   rot: -12, scale: 0.78, z: 3, order: 4 },
    desk:  { x: -22,y: 6,   rot: -8,  scale: 0.72, z: 3 },
    mHero: { x: -21,y: 25,  rot: -12, scale: 0.72 },
    mDesk: { x: 22, y: 13,  rot: -8,  scale: 0.7 }
  },
  {
    id: "clip",
    name: "Binder Clip — 41mm",
    blurb: "Holds the whole stack",
    price: 360,
    handle: "binder-clip-41mm",
    img: cdn("Black_binder_clip_on_surface_202609051210_d1b8be60-a759-4149-a16c-554c0df0a75a.jpg?v=1788592281"),
    w: 150,
    hero:  { x: 20, y: -20, rot: -20, scale: 0.66, z: 6, order: 5 },
    desk:  { x: 10, y: 6,   rot: -14, scale: 0.6,  z: 6 }
  },
  {
    id: "highlighter",
    name: "Highlighter — Dollar 1×12",
    blurb: "Chisel tip, five shades",
    price: 840,
    handle: "highlighter-dollar-1x12",
    img: cdn("Highlighters_displaying_chisel_tips_202609071445.jpg?v=1788774365"),
    w: 235,
    hero:  { x: 22, y: 31,  rot: 14,  scale: 0.78, z: 5, order: 6 },
    desk:  { x: 30, y: 30,  rot: 40,  scale: 0.7,  z: 5 }
  }
];

/* Position slots by index — used when products are supplied without their own
   hero/desk coordinates (e.g. generated from a Shopify section's product
   pickers). Slot 0 is the anchor. Keeps the composition intact for any set. */
const POSITION_SLOTS = PRODUCTS.map((p) => ({
  hero: p.hero, desk: p.desk, mHero: p.mHero, mDesk: p.mDesk, w: p.w
}));

/* The desk assembly plays in this order. Notebook is the anchor, so it lands
   first; smaller accents settle last. Mobile uses only the essentials. */
const DESK_ORDER   = ["notebook", "pen", "calculator", "ruler", "sticky", "clip", "highlighter"];
const MOBILE_SET   = ["notebook", "pen", "calculator", "sticky", "ruler"];

const COLLECTION_URL = `${STORE}/collections/office-supplies-example-products`;
const SHOP_ALL_URL   = `${STORE}/collections/all`;

if (typeof window !== "undefined") {
  // A Shopify section can pre-set window.RS_PRODUCTS with merchant-picked items
  // (name, blurb, price, handle, img). Positions are filled from POSITION_SLOTS.
  let list = PRODUCTS;
  if (Array.isArray(window.RS_PRODUCTS) && window.RS_PRODUCTS.length) {
    list = window.RS_PRODUCTS.slice(0, POSITION_SLOTS.length).map((p, i) => {
      const slot = POSITION_SLOTS[i];
      return Object.assign({ id: p.id || "p" + i, w: slot.w }, p, {
        hero: p.hero || slot.hero, desk: p.desk || slot.desk,
        mHero: p.mHero || slot.mHero, mDesk: p.mDesk || slot.mDesk
      });
    });
  }
  const order = list.map((p) => p.id);
  const mobile = order.slice(0, 5);
  window.RS = {
    PRODUCTS: list,
    DESK_ORDER: (list === PRODUCTS) ? DESK_ORDER : order,
    MOBILE_SET: (list === PRODUCTS) ? MOBILE_SET : mobile,
    STORE, COLLECTION_URL, SHOP_ALL_URL
  };
}
