// Sample catalogue — replace names, prices and categories with the real stock.
export const categories = [
  {
    id: "fine-writing",
    name: "Fine Writing",
    blurb: "Fountain pens, inks & journals",
    subs: [
      { id: "fountain-pens", name: "Fountain Pens" },
      { id: "ballpoint-rollerball", name: "Ballpoint & Rollerball" },
      { id: "inks-refills", name: "Inks & Refills" },
      { id: "journals-diaries", name: "Journals & Diaries" },
    ],
  },
  {
    id: "organisers",
    name: "Desk Organisers",
    blurb: "A place for everything",
    subs: [
      { id: "desk-organisers", name: "Desk Organisers" },
      { id: "pen-holders", name: "Pen Holders" },
      { id: "file-trays", name: "File Trays & Folders" },
      { id: "storage-boxes", name: "Storage Boxes" },
    ],
  },
  {
    id: "paper",
    name: "Notebooks & Paper",
    blurb: "Registers, diaries, A4 reams",
    subs: [
      { id: "notebooks", name: "Notebooks" },
      { id: "registers", name: "Registers" },
      { id: "sticky-notes", name: "Sticky Notes" },
      { id: "printing-paper", name: "Printing Paper" },
    ],
  },
  {
    id: "school",
    name: "School & Art",
    blurb: "Pens, pencils, colours & more",
    subs: [
      { id: "pens-pencils", name: "Pens & Pencils" },
      { id: "colours-markers", name: "Colours & Markers" },
      { id: "geometry", name: "Geometry & Maths" },
      { id: "art-supplies", name: "Art Supplies" },
      { id: "scissors", name: "Scissors & Cutters" },
    ],
  },
];

// Optional per-product fields:
//   cutout      transparent PNG shown on product cards (lifts out of the card on hover)
//   images      photo gallery for the detail page (first one is the card photo if no cutout)
//   description, features
// Products without images show a category icon.
export const products = [
  {
    id: "office-scissors",
    name: "Stainless Steel Office Scissors — 8 inch",
    category: "school",
    sub: "scissors",
    price: 650, // placeholder price — update with the real one
    tag: "New",
    // transparent-background photo used on product cards (pops out on hover)
    cutout: "/Products/pro1/1-cut.png",
    images: [
      "/Products/pro1/1.jpg",
      "/Products/pro1/2.jpg",
      "/Products/pro1/3.jpg",
      "/Products/pro1/4.jpg",
    ],
    description:
      "Sharp stainless steel blades and soft-grip handles make these everyday scissors comfortable for long cutting jobs — paper, card, fabric and packaging. A reliable pair for the office, classroom and craft table.",
    features: [
      "8-inch stainless steel blades",
      "Soft-grip, comfortable handles",
      "Cuts paper, card, fabric and tape",
      "For office, school and crafts",
    ],
  },
  { id: "fountain-pen", name: "Classic Fountain Pen — Navy & Gold", category: "fine-writing", sub: "fountain-pens", price: 3450, tag: "Signature" },
  { id: "student-fountain", name: "Student Fountain Pen", category: "fine-writing", sub: "fountain-pens", price: 1250 },
  { id: "rollerball", name: "Metal Rollerball Pen", category: "fine-writing", sub: "ballpoint-rollerball", price: 1650 },
  { id: "ink-bottle", name: "Bottled Fountain Pen Ink — 50ml", category: "fine-writing", sub: "inks-refills", price: 950 },
  { id: "leather-journal", name: "Leather-bound Journal A5", category: "fine-writing", sub: "journals-diaries", price: 2200, tag: "New" },
  { id: "deskzen", name: "DeskZen Desk Organiser", category: "organisers", sub: "desk-organisers", price: 2499, tag: "Bestseller" },
  { id: "mesh-cup", name: "Mesh Pen Holder", category: "organisers", sub: "pen-holders", price: 450 },
  { id: "file-tray", name: "3-Tier File Tray", category: "organisers", sub: "file-trays", price: 1850 },
  { id: "storage-box", name: "Document Storage Box", category: "organisers", sub: "storage-boxes", price: 990 },
  { id: "spiral-a5", name: "Spiral Notebook A5", category: "paper", sub: "notebooks", price: 350 },
  { id: "register-200", name: "Single Line Register — 200 pages", category: "paper", sub: "registers", price: 320 },
  { id: "sticky-cube", name: "Sticky Notes Cube", category: "paper", sub: "sticky-notes", price: 420 },
  { id: "a4-ream", name: "A4 Paper Ream — 500 sheets", category: "paper", sub: "printing-paper", price: 1650 },
  { id: "gel-pack", name: "Gel Pens — Pack of 10", category: "school", sub: "pens-pencils", price: 650 },
  { id: "hb-pencils", name: "HB Pencils — Box of 12", category: "school", sub: "pens-pencils", price: 280 },
  { id: "markers-24", name: "Colour Markers — Set of 24", category: "school", sub: "colours-markers", price: 1200, tag: "Popular" },
  { id: "geometry-box", name: "Geometry Box — 9 pieces", category: "school", sub: "geometry", price: 550 },
  { id: "watercolour", name: "Watercolour Set — 18 colours", category: "school", sub: "art-supplies", price: 990 },
];

// The tiles shown under "Shop by category" on the home page (order matters).
// To use a real photo for a tile, put it in /public/categories/ and add its path
// to `categoryImages`, e.g. "fountain-pens": "/categories/fountain-pens.jpg".
export const homeTiles = [
  "fountain-pens",
  "ballpoint-rollerball",
  "inks-refills",
  "journals-diaries",
  "desk-organisers",
  "file-trays",
  "notebooks",
  "sticky-notes",
  "printing-paper",
  "pens-pencils",
  "colours-markers",
  "geometry",
];

export const categoryImages = {};

export function findSubById(subId) {
  for (const c of categories) {
    const s = c.subs.find((x) => x.id === subId);
    if (s) return { ...s, cat: c.id };
  }
  return null;
}

export function findSub(catId, subId) {
  return categories.find((c) => c.id === catId)?.subs.find((s) => s.id === subId);
}
