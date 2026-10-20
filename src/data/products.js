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
      { id: "desk-accessories", name: "Staplers & Clips" },
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
//   specs       { label: value } rows shown in the "Specifications" table
//   stock       units available (dummy for now — will come from Supabase)
// Products without images show a category icon.
export const products = [
  {
    id: "office-scissors",
    name: "Stainless Steel Office Scissors — 8 inch",
    category: "school",
    sub: "scissors",
    price: 650, // placeholder price — update with the real one
    tag: "New",
    stock: 20,
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
    specs: { Length: "8 inch (20 cm)", Blades: "Stainless steel", Handle: "Soft-grip" },
  },
  {
    id: "fountain-pen",
    name: "Classic Fountain Pen — Navy & Gold",
    category: "fine-writing",
    sub: "fountain-pens",
    price: 3450,
    tag: "Signature",
    stock: 6,
    cutout: "/Products/pens/fountain-pen.webp",
    images: ["/Products/pens/fountain-pen.webp", "/Products/pens/fountain-pen-2.webp"],
    description:
      "A weighted brass-bodied fountain pen with a polished gold-tone nib that glides across the page. Takes standard international cartridges or a converter for bottled ink — a pen for signatures, letters and gifting.",
    features: ["Medium steel nib, gold-tone finish", "Cartridge & converter filling", "Brass body with screw cap", "Comes in a gift box"],
    specs: { Nib: "Medium (0.6 mm)", Filling: "Cartridge / converter", Body: "Lacquered brass", Length: "13.8 cm capped" },
  },
  {
    id: "student-fountain",
    name: "Student Fountain Pen",
    category: "fine-writing",
    sub: "fountain-pens",
    price: 1250,
    stock: 24,
    cutout: "/Products/pens/student-fountain.webp",
    images: ["/Products/pens/student-fountain.webp"],
    description:
      "A light, comfortable fountain pen made for everyday handwriting practice. The smooth fine nib helps build neat, joined-up writing, and a moulded grip keeps fingers in the right place.",
    features: ["Fine nib for neat handwriting", "Ergonomic moulded grip", "Uses standard ink cartridges", "Includes 2 blue cartridges"],
    specs: { Nib: "Fine (0.5 mm)", Filling: "Cartridge", Body: "Resin", Weight: "14 g" },
  },
  {
    id: "rollerball",
    name: "Metal Rollerball Pen",
    category: "fine-writing",
    sub: "ballpoint-rollerball",
    price: 1650,
    stock: 15,
    cutout: "/Products/pens/rollerball.webp",
    images: ["/Products/pens/rollerball.webp"],
    description:
      "A matte black all-metal rollerball with chrome accents, a smooth liquid-ink feel and a satisfying weight in the hand. Refillable, with a pocket clip — a smart everyday pen for the office.",
    features: ["Smooth liquid-ink refill", "All-metal body with clip", "Refillable", "Black ink"],
    specs: { Tip: "0.7 mm", Ink: "Black", Body: "Matte black metal, chrome trim", Refill: "Standard rollerball" },
  },
  {
    id: "gold-ballpoint",
    name: "Gold Executive Ballpoint Pen",
    category: "fine-writing",
    sub: "ballpoint-rollerball",
    price: 2150,
    stock: 9,
    cutout: "/Products/pens/gold-ballpoint.webp",
    images: ["/Products/pens/gold-ballpoint.webp"],
    description:
      "A slim, polished gold-tone ballpoint with a smooth twist action and a long-lasting refill. Understated and elegant — made for the boardroom, the signing table and the gift box.",
    features: ["Polished gold-tone metal body", "Smooth twist mechanism", "Long-life black refill", "Presented in a gift box"],
    specs: { Tip: "1.0 mm", Ink: "Black", Body: "Brass, gold-tone plating", Mechanism: "Twist" },
  },
  {
    id: "ballpoint-blue",
    name: "Classic Ballpoint Pen — Blue",
    category: "fine-writing",
    sub: "ballpoint-rollerball",
    price: 40,
    stock: 300,
    cutout: "/Products/pens/ballpoint-blue.webp",
    images: ["/Products/pens/ballpoint-blue.webp"],
    description:
      "The everyday stick ballpoint: a clear hexagonal barrel so you can see the ink, a vented blue cap and a smooth 1.0 mm tip. Light, reliable and made for pages of notes.",
    features: ["Clear barrel shows ink level", "Smooth 1.0 mm tip", "Hexagonal, roll-resistant body", "Vented safety cap"],
    specs: { Tip: "1.0 mm", Ink: "Blue", Body: "Clear polystyrene" },
  },
  {
    id: "calligraphy-pen",
    name: "Calligraphy Pen — Burgundy",
    category: "fine-writing",
    sub: "fountain-pens",
    price: 1450,
    tag: "New",
    stock: 11,
    cutout: "/Products/pens/calligraphy-pen.webp",
    images: ["/Products/pens/calligraphy-pen.webp"],
    description:
      "A burgundy fountain pen fitted with a broad italic steel nib for calligraphy, headings and elegant cards. Thick and thin strokes come naturally as you change direction.",
    features: ["Wide italic steel nib", "Burgundy lacquer with silver trim", "Takes standard ink cartridges", "Great for Urdu & English calligraphy"],
    specs: { Nib: "Italic 1.9 mm", Filling: "Cartridge", Body: "Lacquered resin" },
  },
  {
    id: "ink-bottle",
    name: "Bottled Fountain Pen Ink — 50ml",
    category: "fine-writing",
    sub: "inks-refills",
    price: 950,
    stock: 3,
    images: ["/Products/ink-bottle/1.jpg", "/Products/ink-bottle/2.jpg"],
    description:
      "Rich, quick-drying fountain pen ink in a sturdy glass bottle. Flows smoothly through any nib and is easy to wash out of pens — ideal with a converter.",
    features: ["Smooth, even flow", "Quick-drying, low feathering", "Safe for all fountain pens", "Glass bottle with wide neck"],
    specs: { Volume: "50 ml", Colour: "Royal blue", Type: "Water-based dye", Bottle: "Glass" },
  },
  {
    id: "leather-journal",
    name: "Leather-bound Journal A5",
    category: "fine-writing",
    sub: "journals-diaries",
    price: 2200,
    tag: "New",
    stock: 10,
    images: ["/Products/leather-journal/1.jpg", "/Products/leather-journal/2.jpg"],
    description:
      "A soft leather-bound A5 journal with thick, ivory pages that take fountain pen ink without bleeding. Perfect for a diary, sketches or a thoughtful gift.",
    features: ["Genuine leather cover", "Thick 100 gsm ivory paper", "Fountain-pen friendly", "Ribbon bookmark"],
    specs: { Size: "A5 (148 × 210 mm)", Pages: "192", Paper: "100 gsm ivory", Ruling: "Plain" },
  },
  {
    id: "deskzen",
    name: "DeskZen Desk Organiser",
    category: "organisers",
    sub: "desk-organisers",
    price: 2499,
    tag: "Bestseller",
    stock: 8,
    images: ["/Products/desk/deskzen.jpg"],
    description:
      "One organiser for everything on your desk — pens, sticky notes, clips, phone and papers each get their own compartment. A tidy desk in one step.",
    features: ["Multiple compartments", "Phone and card slot", "Non-slip base", "Easy to wipe clean"],
    specs: { Size: "28 × 14 × 11 cm", Material: "ABS plastic", Compartments: "7", Colour: "White" },
  },
  {
    id: "mesh-cup",
    name: "Mesh Pen Holder",
    category: "organisers",
    sub: "pen-holders",
    price: 450,
    stock: 40,
    images: ["/Products/mesh-cup/1.jpg", "/Products/mesh-cup/2.jpg"],
    description:
      "A sturdy metal-mesh cup that keeps pens, pencils, scissors and rulers upright and within reach. Simple, strong and at home on any desk.",
    features: ["Powder-coated steel mesh", "Holds 20+ pens", "Weighted, non-tip base", "Rust-resistant"],
    specs: { Size: "8 × 10 cm", Material: "Steel mesh", Colour: "Black" },
  },
  {
    id: "file-tray",
    name: "3-Tier File Tray",
    category: "organisers",
    sub: "file-trays",
    price: 1850,
    stock: 7,
    images: ["/Products/file-tray/1.jpg", "/Products/file-tray/2.jpg"],
    description:
      "Three stackable A4 trays to sort incoming, pending and done paperwork. Open fronts make it easy to grab a sheet without lifting the stack.",
    features: ["Holds A4 & letter size", "3 stackable tiers", "Open front access", "Anti-slip feet"],
    specs: { Size: "35 × 27 × 26 cm", Capacity: "A4 / Letter", Tiers: "3", Material: "Steel mesh" },
  },
  {
    id: "storage-box",
    name: "Document Storage Box",
    category: "organisers",
    sub: "storage-boxes",
    price: 990,
    stock: 0,
    images: ["/Products/storage-box/1.jpg", "/Products/storage-box/2.jpg"],
    description:
      "A heavy-duty corrugated box with a lid for archiving files, receipts and old registers. Writable label area on the front so you can find things later.",
    features: ["Double-wall corrugated board", "Fits A4 files & registers", "Lift-off lid", "Front label panel"],
    specs: { Size: "40 × 32 × 26 cm", Material: "Corrugated card", Pack: "1 box" },
  },
  {
    id: "box-file",
    name: "Lever Arch Box File — Blue",
    category: "organisers",
    sub: "file-trays",
    price: 690,
    stock: 30,
    images: ["/Products/desk/box-file.jpg"],
    description:
      "A strong lever-arch box file that holds up to 500 A4 sheets. The spring clip keeps papers flat and the spine label makes it easy to find on the shelf.",
    features: ["Holds ~500 A4 sheets", "Spring clip mechanism", "Spine label holder", "Board with PVC finish"],
    specs: { Size: "A4 / Foolscap", Capacity: "500 sheets", Colour: "Blue" },
  },
  {
    id: "stapler",
    name: "Heavy-duty Office Stapler",
    category: "organisers",
    sub: "desk-accessories",
    price: 1150,
    stock: 12,
    images: ["/Products/desk/stapler.jpg"],
    description:
      "An all-metal stapler that cleanly binds up to 25 sheets in one press. Top-loading for quick refills, with a rubber base that keeps it steady.",
    features: ["Staples up to 25 sheets", "Full-strip top loading", "All-metal mechanism", "Non-slip rubber base"],
    specs: { Capacity: "25 sheets", Staples: "24/6, 26/6", Body: "Metal" },
  },
  {
    id: "paper-clips",
    name: "Paper Clips in Clear Dispenser — 100",
    category: "organisers",
    sub: "desk-accessories",
    price: 250,
    stock: 60,
    images: ["/Products/desk/paper-clips.jpg"],
    description:
      "100 smooth, rust-resistant paper clips in a magnetic clear dispenser — pick one up with a single finger and the rest stay put.",
    features: ["100 clips per pack", "Magnetic dispenser top", "Rust-resistant finish", "28 mm standard size"],
    specs: { Size: "28 mm", Count: "100", Finish: "Nickel-plated" },
  },
  {
    id: "spiral-a5",
    name: "Spiral Notebook A5",
    category: "paper",
    sub: "notebooks",
    price: 350,
    stock: 50,
    images: ["/Products/desk/spiral-a5.jpg"],
    description:
      "A handy A5 spiral notebook that lies flat when open. Clean ruled pages and a stiff cover make it great for lectures, meetings and to-do lists.",
    features: ["Lies flat when open", "Stiff protective cover", "Perforated pages", "Ruled lines"],
    specs: { Size: "A5", Pages: "120", Paper: "70 gsm", Ruling: "Single line" },
  },
  {
    id: "register-200",
    name: "Single Line Register — 200 pages",
    category: "paper",
    sub: "registers",
    price: 320,
    stock: 80,
    images: ["/Products/register-200/1.jpg", "/Products/register-200/2.jpg", "/Products/register-200/3.jpg"],
    description:
      "A strongly bound single-line register for school work, accounts and record keeping. Smooth white paper with a margin on every page.",
    features: ["200 single-line pages", "Margin on every page", "Hard board binding", "Smooth white paper"],
    specs: { Size: "Foolscap", Pages: "200", Paper: "60 gsm", Ruling: "Single line with margin" },
  },
  {
    id: "sticky-cube",
    name: "Sticky Notes Cube",
    category: "paper",
    sub: "sticky-notes",
    price: 420,
    stock: 35,
    images: ["/Products/desk/sticky-cube.jpg"],
    description:
      "A colourful cube of re-stickable notes for reminders, bookmarks and planning. Sticks firmly, peels off cleanly.",
    features: ["400 sheets, 4 colours", "Re-stickable adhesive", "Peels off without marks", "76 × 76 mm"],
    specs: { Size: "76 × 76 mm", Sheets: "400", Colours: "4 neon" },
  },
  {
    id: "a4-ream",
    name: "A4 Paper Ream — 500 sheets",
    category: "paper",
    sub: "printing-paper",
    price: 1650,
    tag: "Popular",
    stock: 4,
    images: ["/Products/a4-ream/1.jpg", "/Products/a4-ream/2.jpg"],
    description:
      "Bright white 80 gsm A4 paper for crisp printing and copying. Jam-free on laser and inkjet printers — the everyday ream for home and office.",
    features: ["500 sheets per ream", "80 gsm bright white", "Laser & inkjet compatible", "Jam-free performance"],
    specs: { Size: "A4 (210 × 297 mm)", Weight: "80 gsm", Sheets: "500", Brightness: "CIE 150" },
  },
  {
    id: "gel-pack",
    name: "Gel Pens — Pack of 10",
    category: "school",
    sub: "pens-pencils",
    price: 650,
    stock: 45,
    cutout: "/Products/pens/gel-pack.webp",
    images: ["/Products/pens/gel-pack.webp", "/Products/gel-pack/1.jpg", "/Products/gel-pack/2.jpg"],
    description:
      "Ten vivid gel pens that write smoothly and dry fast. Great for notes, journalling, colour-coding and art.",
    features: ["10 bright colours", "0.7 mm smooth gel ink", "Quick-drying, smudge-resistant", "Comfort rubber grip"],
    specs: { Tip: "0.7 mm", Colours: "10", Ink: "Gel" },
  },
  {
    id: "hb-pencils",
    name: "HB Pencils — Box of 12",
    category: "school",
    sub: "pens-pencils",
    price: 280,
    stock: 100,
    cutout: "/Products/pens/hb-pencils.webp",
    images: ["/Products/pens/hb-pencils.webp", "/Products/hb-pencils/1.jpg"],
    description:
      "Classic HB graphite pencils with break-resistant leads that sharpen to a clean point. A school-bag essential.",
    features: ["12 pencils per box", "Break-resistant HB lead", "Easy to sharpen", "Smooth, dark line"],
    specs: { Grade: "HB", Count: "12", Wood: "Cedar" },
  },
  {
    id: "mechanical-pencil",
    name: "Mechanical Pencil — 0.5 mm",
    category: "school",
    sub: "pens-pencils",
    price: 450,
    stock: 40,
    cutout: "/Products/pens/mechanical-pencil.webp",
    images: ["/Products/pens/mechanical-pencil.webp"],
    description:
      "A precise 0.5 mm mechanical pencil with a knurled metal grip and a smoke-grey body. Never needs sharpening — ideal for maths, technical drawing and neat notes.",
    features: ["0.5 mm lead, always sharp", "Knurled metal grip", "Retractable chrome tip", "Eraser under the cap"],
    specs: { Lead: "0.5 mm HB", Grip: "Knurled metal", Body: "Smoke-grey resin" },
  },
  {
    id: "correction-pen",
    name: "Correction Pen",
    category: "school",
    sub: "pens-pencils",
    price: 180,
    stock: 70,
    cutout: "/Products/pens/correction-pen.webp",
    images: ["/Products/pens/correction-pen.webp"],
    description:
      "A quick-drying correction pen with a fine metal tip for neat, precise fixes on registers, forms and letters. The soft grip squeezes out just the right amount.",
    features: ["Fine metal tip for precise lines", "Quick-drying formula", "Soft squeeze grip", "Writes over in seconds"],
    specs: { Volume: "7 ml", Tip: "Metal, fine", "Dry time": "≈ 30 seconds" },
  },
  {
    id: "markers-24",
    name: "Colour Markers — Set of 24",
    category: "school",
    sub: "colours-markers",
    price: 1200,
    tag: "Popular",
    stock: 18,
    cutout: "/Products/pens/markers-24.webp",
    images: ["/Products/pens/markers-24.webp", "/Products/markers-24/1.jpg", "/Products/markers-24/2.jpg"],
    description:
      "24 bright felt-tip markers with washable ink — perfect for colouring, charts, posters and school projects.",
    features: ["24 vibrant colours", "Washable, non-toxic ink", "Fibre tip for fine & bold lines", "Vented safety caps"],
    specs: { Colours: "24", Tip: "Fibre, 2 mm", Ink: "Washable, water-based" },
  },
  {
    id: "colour-pencils",
    name: "Colour Pencils — Set of 24",
    category: "school",
    sub: "colours-markers",
    price: 850,
    stock: 32,
    cutout: "/Products/pens/colour-pencils.webp",
    images: ["/Products/pens/colour-pencils.webp", "/Products/colour-pencils/1.jpg", "/Products/colour-pencils/2.jpg", "/Products/colour-pencils/3.jpg"],
    description:
      "24 richly pigmented colour pencils with soft, break-resistant leads that blend and layer beautifully. Pre-sharpened and ready for colouring books, school projects and sketching.",
    features: ["24 bright, blendable colours", "Soft, break-resistant leads", "Pre-sharpened", "Non-toxic, child-safe"],
    specs: { Colours: "24", Lead: "3.3 mm soft core", Wood: "Natural cedar" },
  },
  {
    id: "highlighters",
    name: "Neon Highlighters — Set of 4",
    category: "school",
    sub: "colours-markers",
    price: 480,
    stock: 28,
    cutout: "/Products/pens/highlighters.webp",
    images: ["/Products/pens/highlighters.webp", "/Products/desk/highlighters.jpg"],
    description:
      "Four neon highlighters with chisel tips for broad highlighting or fine underlining. Bright on the page, no bleed-through.",
    features: ["4 neon colours", "Chisel tip: 1–5 mm", "No bleed-through", "Anti-dry cap"],
    specs: { Colours: "Yellow, green, pink, orange", Tip: "Chisel 1–5 mm" },
  },
  {
    id: "permanent-marker",
    name: "Permanent Marker — Black",
    category: "school",
    sub: "colours-markers",
    price: 160,
    stock: 55,
    cutout: "/Products/pens/permanent-marker.webp",
    images: ["/Products/pens/permanent-marker.webp"],
    description:
      "A bold black permanent marker with a bullet tip that writes on cardboard, plastic, glass and metal. Water-resistant and quick-drying — the one you reach for when labelling.",
    features: ["Bullet tip, 2 mm line", "Writes on most surfaces", "Water-resistant, quick-drying", "Aluminium barrel"],
    specs: { Tip: "Bullet, 2 mm", Ink: "Black, permanent", Body: "Aluminium" },
  },
  {
    id: "whiteboard-marker",
    name: "Whiteboard Marker — Blue",
    category: "school",
    sub: "colours-markers",
    price: 150,
    stock: 60,
    cutout: "/Products/pens/whiteboard-marker.webp",
    images: ["/Products/pens/whiteboard-marker.webp"],
    description:
      "A bright blue whiteboard marker that wipes clean without ghosting. Low-odour ink and a round tip make it right for classrooms, offices and home planners.",
    features: ["Dry-wipe, no ghosting", "Low-odour ink", "Round 2–3 mm tip", "Bright, easy-to-read blue"],
    specs: { Tip: "Round, 2–3 mm", Ink: "Blue, dry-erase", Use: "Whiteboards & glass" },
  },
  {
    id: "brush-pen",
    name: "Brush Pen — Black Tip",
    category: "school",
    sub: "art-supplies",
    price: 380,
    stock: 25,
    cutout: "/Products/pens/brush-pen.webp",
    images: ["/Products/pens/brush-pen.webp"],
    description:
      "A flexible brush-tip pen for lettering, sketching and calligraphy. Press lightly for hairline strokes and harder for bold lines — rich black ink in a red barrel.",
    features: ["Flexible brush tip", "Fine to bold strokes", "Rich black ink", "Great for hand lettering"],
    specs: { Tip: "Flexible brush", Ink: "Black, water-based", Body: "Red" },
  },
  {
    id: "geometry-box",
    name: "Geometry Box — 9 pieces",
    category: "school",
    sub: "geometry",
    price: 550,
    stock: 22,
    images: ["/Products/geometry-box/1.jpg", "/Products/geometry-box/2.jpg", "/Products/geometry-box/3.jpg"],
    description:
      "A complete maths set in a sturdy tin — everything students need for geometry, from compass to protractor.",
    features: ["Compass & divider", "Protractor & 2 set squares", "15 cm ruler", "Pencil, eraser & sharpener"],
    specs: { Pieces: "9", Case: "Metal tin", Ruler: "15 cm" },
  },
  {
    id: "watercolour",
    name: "Watercolour Set — 18 colours",
    category: "school",
    sub: "art-supplies",
    price: 990,
    stock: 14,
    images: ["/Products/watercolour/1.jpg", "/Products/watercolour/2.jpg", "/Products/watercolour/3.jpg"],
    description:
      "18 rich watercolour cakes in a palette tin with a built-in mixing tray and brush. Colours blend beautifully for beginners and young artists.",
    features: ["18 bright watercolour cakes", "Mixing tray in lid", "Brush included", "Non-toxic"],
    specs: { Colours: "18", Format: "Pan cakes", Includes: "Brush" },
  },
  {
    id: "paint-brush",
    name: "Round Watercolour Brush — No. 8",
    category: "school",
    sub: "art-supplies",
    price: 320,
    stock: 30,
    cutout: "/Products/pens/paint-brush.webp",
    images: ["/Products/pens/paint-brush.webp"],
    description:
      "A round watercolour brush with soft synthetic bristles that hold plenty of paint and come to a fine point. A natural wooden handle and seamless ferrule for years of use.",
    features: ["Soft synthetic bristles", "Holds a fine point", "Natural wooden handle", "Rust-proof ferrule"],
    specs: { Size: "No. 8 round", Bristles: "Synthetic", Handle: "Varnished wood" },
  },
];

// Stock helpers. `stock` is dummy data for now — it will come from Supabase later.
export const LOW_STOCK = 5;
export function stockStatus(product) {
  const n = product.stock;
  if (n == null) return { kind: "in", label: "In stock" };
  if (n <= 0) return { kind: "out", label: "Out of stock" };
  if (n <= LOW_STOCK) return { kind: "low", label: `Only ${n} left` };
  return { kind: "in", label: "In stock" };
}

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
