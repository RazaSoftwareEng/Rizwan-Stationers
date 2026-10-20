// Blog posts.
//
// Body blocks:
//   { h: "Section heading" }                 — listed in the table of contents
//   { h3: "Sub-heading" }
//   { p: "Paragraph" }
//   { list: ["item", …] }
//   { steps: [{ title, text }, …] }          — numbered steps
//   { tip: "text", title?, kind? }           — callout; kind: "tip" (default) | "note" | "warn"
//   { quote: "text", cite? }                 — pull quote
//   { product: "product-id", note? }         — inline product card
//   { table: { head: [...], rows: [[...], …] } }
//
// Inside any text, "[link text](/path)" becomes an internal link and "**text**" is bold.
// Link to products (/product/id), categories (/shop?cat=…) and other articles (/blog/slug).
// `takeaways` shows as a summary box at the top; `next` is the article suggested at the end.
const raw = [
  {
    slug: "organise-your-desk-in-10-minutes",
    title: "How to organise your desk in 10 minutes",
    excerpt:
      "A cluttered desk slows you down. Here's a quick routine — and the one tool — that turns chaos into calm.",
    topic: "Desk & Study",
    category: "organisers",
    date: "2026-09-10",
    updated: "2026-10-20",
    cover: "/blog-desk.jpg",
    next: "back-to-school-stationery-checklist",
    takeaways: [
      "Start from an empty desk — it's faster than tidying around the mess.",
      "Sort everything into daily, weekly and doesn't-belong piles.",
      "Give every daily item one fixed home; a single organiser does most of the work.",
      "A two-minute Friday reset keeps the desk clear for good.",
    ],
    body: [
      { p: "Papers under papers, pens that have wandered off, sticky notes stuck to everything. A messy desk costs you a few minutes every time you sit down — hunting for a pen, moving a pile to make space, rewriting a note you've lost. Over a week, that adds up to hours." },
      { p: "The good news: you don't need a weekend or a new room. Over thirty years behind the counter in Urdu Bazar we've helped students, shopkeepers, accountants and lawyers set up their desks, and the same simple routine works for nearly everyone. Set a timer for ten minutes and follow along." },

      { h: "Why a tidy desk actually matters" },
      { p: "It isn't only about looks. A clear surface means **less decision-making** before you start work — you sit down, and everything you need is where you expect it. Students in particular find it easier to start homework when the desk isn't already full of yesterday's work." },
      { quote: "If you have to move something before you can start, your desk is working against you.", cite: "Our rule of thumb at the counter" },

      { h: "The 10-minute routine" },
      { steps: [
        { title: "Clear everything off (2 minutes)", text: "Take every single item off the desk and put it on a chair, the bed or the floor. Don't sort yet — just empty it. Starting from a bare surface is the fastest way to see what actually belongs there." },
        { title: "Wipe it down (1 minute)", text: "A quick wipe with a dry cloth. It sounds small, but a clean surface makes the reset feel finished and makes you less likely to pile things back on." },
        { title: "Sort into three piles (3 minutes)", text: "Pick up each item once and decide: do I use this daily, weekly, or does it not belong here at all? Be strict — most desks hold far more than they need." },
        { title: "Give daily items one home (3 minutes)", text: "Put back only the daily pile, and give each item a fixed spot. Pens in one place, notes in another, the notebook you're working in front and centre." },
        { title: "File or bin the rest (1 minute)", text: "Weekly items go into a drawer or tray. The third pile leaves the desk today — bin it, return it, or file it away." },
      ] },

      { h: "What goes in each pile" },
      { table: {
        head: ["Pile", "Typical items", "Where it goes"],
        rows: [
          ["Use daily", "2–3 pens, a pencil, current notebook, sticky notes, phone", "On the desk, in an organiser"],
          ["Use weekly", "Stapler, hole punch, files, calculator, reference books", "Drawer, shelf or file tray"],
          ["Doesn't belong", "Old receipts, wrappers, dried-out pens, cups, chargers you never use", "Bin, kitchen or storage box"],
        ],
      } },
      { tip: "Test every pen as you sort. Most desks hide three or four that don't write — they're the reason you can never find a working one.", title: "Quick win" },

      { h: "Give daily items one home" },
      { p: "This is the step that keeps a desk tidy after today. When every item has a fixed home, putting it back takes no thought at all. The easiest way to do that is a single organiser with a slot for each thing you reach for." },
      { product: "deskzen", note: "Pens, sticky notes, clips, scissors and your phone each get their own compartment — one base, no clutter." },
      { p: "Short on space? A simple [mesh pen holder](/product/mesh-cup) and a [sticky notes cube](/product/sticky-cube) cover the essentials in a few square inches. Keep a small dish or the clip tray of your organiser for [paper clips](/product/paper-clips) so they stop spreading across the desk." },

      { h: "Taming paper" },
      { p: "Paper is what makes most desks messy. The fix is to give it a direction: everything is either **to do**, **in progress** or **done**. A [3-tier file tray](/product/file-tray) makes that physical — one tier for each — so loose sheets never land flat on the desk again." },
      { p: "Papers you must keep but rarely open — bills, certificates, old registers — don't belong on the desk at all. A [lever arch box file](/product/box-file) on the shelf holds around 500 sheets, and a [document storage box](/product/storage-box) is ideal for archiving the year." },
      { tip: "Label the spine of every file the day you start it. Future you will thank you during tax season or exam time.", kind: "note", title: "Good habit" },

      { h: "Keep it tidy: the Friday reset" },
      { p: "A desk doesn't get messy in one day — it drifts. Every Friday, spend two minutes repeating steps 3 to 5: sort anything new, put daily items back in their homes, file or bin the rest. Because everything already has a place, it's quick." },
      { list: [
        "Empty the file tray's **done** tier into the box file",
        "Throw away sticky notes you've already acted on",
        "Return borrowed items — the stapler from the next desk, a book from the shelf",
        "Refill what's running low: notes, staples, a fresh pen",
      ] },

      { h: "Your next step" },
      { p: "Setting up a study corner for the new term? Our [back-to-school checklist](/blog/back-to-school-stationery-checklist) covers everything a student's desk needs, and what you can skip. Or browse all [desk organisers](/shop?cat=organisers) — and if you're nearby, bring a photo of your desk to the shop in Urdu Bazar and we'll suggest a setup." },
    ],
  },
  {
    slug: "choosing-your-first-fountain-pen",
    title: "Choosing your first fountain pen",
    excerpt:
      "Nib sizes, filling systems and inks explained simply — so your first fountain pen is one you'll love writing with.",
    topic: "Fine Writing",
    category: "fine-writing",
    date: "2026-08-22",
    updated: "2026-10-20",
    next: "journaling-for-beginners",
    takeaways: [
      "Start with a fine or medium nib — they suit most handwriting.",
      "A pen that takes both cartridges and a converter gives you the most freedom.",
      "Smooth, thicker paper matters as much as the pen itself.",
      "Rinse the pen with water every few weeks and it will last for years.",
    ],
    body: [
      { p: "A good fountain pen makes writing feel effortless. The ink flows with almost no pressure, your hand relaxes, and many people find their handwriting improves just from slowing down a little. It's also the most personal thing on a desk — the pen your father signed with, the one you were given when you passed your exams." },
      { p: "But walk up to a pen counter for the first time and the choices can feel overwhelming. Nib sizes, cartridges, converters, inks, prices from a few hundred rupees to many thousands. This guide walks you through the few decisions that actually matter." },

      { h: "Why choose a fountain pen at all?" },
      { list: [
        "**Less pressure, less strain.** The nib glides on a thin film of ink, so long writing sessions — exams, notes, letters — tire your hand much less.",
        "**Better handwriting.** A fountain pen rewards a relaxed, steady hand. Many students notice neater writing within a few weeks.",
        "**Less waste.** One good pen and a bottle of ink replace dozens of disposable ballpoints a year.",
        "**Character.** Signatures, cards and letters simply look better in fountain pen ink.",
      ] },

      { h: "Understand the parts" },
      { p: "You only need to know four parts to shop confidently:" },
      { list: [
        "**Nib** — the metal tip that touches the paper. Its size decides how thick your line is.",
        "**Feed** — the plastic piece under the nib that controls how ink flows from the pen to the nib.",
        "**Barrel** — the body you hold. It hides the ink cartridge or converter.",
        "**Cap** — protects the nib and stops ink drying out. Always cap your pen when you stop writing.",
      ] },

      { h: "Pick the right nib" },
      { p: "Nib size is the single most important choice. It changes how thick the line is, how fast the ink dries and how the pen feels on paper." },
      { table: {
        head: ["Nib", "Line", "Best for"],
        rows: [
          ["Extra fine (EF)", "Very thin", "Very small handwriting, maths, thin paper"],
          ["Fine (F)", "Thin", "Neat everyday notes, school registers"],
          ["Medium (M)", "Standard", "All-round writing, letters, journaling"],
          ["Broad (B)", "Bold", "Signatures, cards, larger handwriting"],
        ],
      } },
      { tip: "If you're unsure, choose **fine** for school and office use, **medium** for letters and journaling. Both are forgiving for beginners.", title: "Our advice" },
      { product: "student-fountain", note: "A light, affordable pen with a fine nib and a moulded grip that guides your fingers — the easiest way to learn." },

      { h: "Cartridge or bottle?" },
      { p: "Fountain pens are filled in one of two ways, and many pens accept both." },
      { h3: "Cartridges" },
      { p: "Small sealed tubes of ink that click into the pen. They're clean, quick and perfect for school bags and travel — you can carry a spare in your pencil case. The trade-off is a smaller choice of colours and a higher cost per page." },
      { h3: "Converter and bottled ink" },
      { p: "A converter is a refillable piston that fits where the cartridge goes. Dip the nib in a bottle, twist, and the pen fills. It costs less over time and opens up hundreds of ink colours. A good [bottled fountain pen ink](/product/ink-bottle) flows smoothly and washes out of the pen easily." },
      { p: "Our [Classic Fountain Pen](/product/fountain-pen) takes both, so you can start with cartridges and move to bottled ink whenever you like." },
      { tip: "Only use ink made for fountain pens. Calligraphy ink, Indian ink or ballpoint refill ink will clog the feed and can ruin the pen.", kind: "warn", title: "Avoid" },

      { h: "Choose paper that loves ink" },
      { p: "The same pen can look beautiful on one page and messy on another. Thin, rough paper soaks ink into its fibres — lines **feather** (spread into fuzzy edges) and **bleed** through to the back. Smoother, thicker paper keeps every line crisp." },
      { list: [
        "For daily school work, a good-quality register with smooth pages is fine with a fine nib.",
        "For journaling and letters, look for 80–100 gsm paper.",
        "Test a new notebook on the last page before you commit to it.",
      ] },
      { product: "leather-journal", note: "Thick 100 gsm ivory pages that take fountain pen ink without bleeding — a natural partner for a new pen." },

      { h: "Your first week with the pen" },
      { steps: [
        { title: "Hold it lightly", text: "Grip the pen gently, further back than a ballpoint. Let the weight of the pen do the work — no pressing." },
        { title: "Find the sweet spot", text: "Keep the nib's printed side facing up and the pen at about 45° to the paper. Turn it slightly until the ink flows evenly." },
        { title: "Write a full page", text: "New nibs settle in with use. Write a page of anything — a shopping list, a diary entry — before you judge how it writes." },
        { title: "Let it dry", text: "Fountain pen ink takes a few seconds longer to dry. Left-handed writers may prefer a fine nib and quick-drying ink." },
      ] },

      { h: "Care in two minutes" },
      { p: "Fountain pens are simple to look after. Flush the pen with plain water every few weeks (and whenever you change ink colour): remove the cartridge, run the front section under the tap until the water runs clear, and let it dry on a tissue overnight. Cap it whenever you're not writing. That's all it takes to keep a pen writing smoothly for years." },
      { quote: "A fountain pen that's rinsed once a month will outlive most of the people who own it.", cite: "Advice we give with every pen" },

      { h: "Where to go from here" },
      { p: "Once you have a pen you love, you'll want a reason to use it every day — [journaling for five minutes](/blog/journaling-for-beginners) is a good one. Browse all [fountain pens](/shop?cat=fine-writing&sub=fountain-pens), or visit the shop and try a few nibs on paper before you decide — we always keep testers at the counter." },
    ],
  },
  {
    slug: "back-to-school-stationery-checklist",
    title: "The complete back-to-school stationery checklist",
    excerpt:
      "Everything a student needs for the new term, from registers to geometry boxes — plus what you can skip.",
    topic: "School",
    category: "school",
    date: "2026-07-30",
    updated: "2026-10-20",
    next: "choosing-your-first-fountain-pen",
    takeaways: [
      "Check the school's list first — then buy for one term, not the whole year.",
      "Spend on things used daily (pens, registers, geometry box); save on extras.",
      "Label everything with the child's name and class on day one.",
      "Send us the list on WhatsApp and we'll pack it ready to collect.",
    ],
    body: [
      { p: "Every new term brings the same question: what do we actually need? School lists can be long, some items are vague (\"one register\" — which one?), and it's easy to come home with a bag of things that won't be used." },
      { p: "Here's the checklist we fill at the counter most often, organised by subject area, with notes on what's worth spending on and what you can skip. It works for most schools from class 3 up to matric and O-levels." },
      { tip: "Always start with your school's own list. Many schools specify register types, page counts or colours — this checklist fills the gaps.", kind: "note", title: "Before you shop" },

      { h: "Writing essentials" },
      { p: "These are used every single day, so buy decent quality and keep spares at home." },
      { list: [
        "**Blue and black pens** — 3–4 of each. Many students prefer [gel pens](/product/gel-pack) for smooth, dark writing; check whether the school allows them in exams.",
        "**[HB pencils](/product/hb-pencils)** — a box of 12 lasts a term for most students.",
        "**Sharpener with a lid** — so shavings don't end up in the bag.",
        "**Two erasers** — one always goes missing.",
        "**[Highlighters](/product/highlighters)** in 2–3 colours for revision.",
      ] },
      { product: "gel-pack", note: "Ten colours that write smoothly and dry fast — great for notes, headings and colour-coded revision." },

      { h: "Paper and registers" },
      { p: "Registers are the biggest item on most lists. Buy one per subject plus one spare, and check the ruling the school wants." },
      { table: {
        head: ["Item", "How many", "Notes"],
        rows: [
          ["Single-line register", "1 per subject", "Most subjects; 200 pages lasts a term"],
          ["Spiral notebook", "1–2", "Rough work and homework diary"],
          ["Practical / drawing copy", "As per list", "Science practicals and art"],
          ["Clear folder", "2", "Worksheets and loose notices"],
        ],
      } },
      { product: "register-200", note: "Strong binding, smooth white paper and a margin on every page — the register we sell most every term." },
      { p: "A [spiral A5 notebook](/product/spiral-a5) is handy for rough work because it lies flat and pages tear out neatly." },

      { h: "Maths and science" },
      { list: [
        "**A full [geometry box](/product/geometry-box)** — compass, divider, protractor, two set squares, ruler, pencil, sharpener and eraser in one tin.",
        "**A 30 cm ruler** for graphs and diagrams.",
        "**A basic calculator** — only for classes that allow it; check the model your school requires.",
        "**Graph paper or a graph register** for upper classes.",
      ] },
      { tip: "Test the compass in the shop: the joint should be firm and the pencil holder tight. A loose compass makes accurate circles impossible.", title: "Buying tip" },

      { h: "Art and colouring" },
      { p: "Younger classes use colours every week; older students mostly for projects and charts." },
      { list: [
        "[Colour pencils](/product/colour-pencils) — 12 or 24 colours, pre-sharpened",
        "[Felt-tip markers](/product/markers-24) — washable ink is best for younger children",
        "A [watercolour set](/product/watercolour) for classes that have art periods",
        "[Scissors](/product/office-scissors) with rounded tips for younger children, and a glue stick",
      ] },

      { h: "What you can skip" },
      { p: "Some things look exciting in the shop but rarely survive the first month:" },
      { list: [
        "Novelty pens with toys on top — they break and distract.",
        "Oversized pencil cases that don't fit in the desk.",
        "Huge colour sets (48+) for children who use eight colours.",
        "Buying a full year's registers at once — needs change after the first term.",
      ] },
      { quote: "Buy the basics in good quality, then top up mid-term. It's cheaper than replacing broken things.", cite: "What we tell parents every August" },

      { h: "Make the first week easier" },
      { steps: [
        { title: "Label everything", text: "Name and class on every register, the geometry box and the pencil case. Lost property is full of unlabelled stationery." },
        { title: "Cover registers", text: "Plain covers keep registers neat all term — and many schools require them." },
        { title: "Pack a spare kit", text: "One extra pen, pencil and eraser in a small pouch in the school bag saves a lot of stress." },
        { title: "Set up the study desk", text: "Supplies work best when they have a home. Our [10-minute desk routine](/blog/organise-your-desk-in-10-minutes) sets up a study space that stays tidy all term." },
      ] },

      { h: "Let us pack it for you" },
      { p: "Short on time? [Send us your school's list](/contact) on WhatsApp — a photo is fine — and we'll pack everything, label the bag with your child's name and have it ready to collect from Urdu Bazar or delivered in Lahore. Or browse all [school & art supplies](/shop?cat=school) online." },
    ],
  },
  {
    slug: "journaling-for-beginners",
    title: "Journaling for beginners: start with one page",
    excerpt:
      "You don't need a perfect notebook or perfect words. A simple habit that fits into five minutes a day.",
    topic: "Paper & Journals",
    category: "paper",
    date: "2026-07-12",
    updated: "2026-10-20",
    next: "organise-your-desk-in-10-minutes",
    takeaways: [
      "Five minutes and one page is enough — consistency beats length.",
      "Pick a notebook you enjoy opening, not the most expensive one.",
      "Use a simple prompt so you never face a blank page.",
      "Keep the journal where you'll see it every day.",
    ],
    body: [
      { p: "Journaling has a reputation for being time-consuming — long, beautiful entries in perfect handwriting. It doesn't have to be. One page, a few minutes, most days — that's enough to feel the difference: a clearer head at night, a better memory of the year, and a place to work through decisions." },
      { p: "Here's how to start, what you need (very little) and how to keep going after the first enthusiastic week." },

      { h: "Why keep a journal?" },
      { list: [
        "**Clear your mind.** Writing worries down makes them smaller and easier to deal with.",
        "**Remember more.** Small moments you'd forget — a funny thing your child said, a good meal with friends — stay with you.",
        "**Track progress.** Looking back three months shows how far you've come with studies, work or health.",
        "**Better handwriting.** A daily page is the most enjoyable handwriting practice there is.",
      ] },

      { h: "Choose a notebook you like" },
      { p: "Not the most expensive one — one that makes you want to open it. A notebook that feels too precious often stays empty because you're afraid to \"ruin\" it." },
      { table: {
        head: ["Notebook", "Good for", "Consider"],
        rows: [
          ["Spiral A5", "Everyday notes, lies flat, easy to start", "Pages can tear out over time"],
          ["Leather-bound A5", "A journal to keep for years, fountain pens", "Higher price"],
          ["Single-line register", "Very low cost, lots of pages", "Plainer look"],
        ],
      } },
      { p: "A5 is a comfortable size to carry and write in. A [spiral A5 notebook](/product/spiral-a5) is an easy, low-pressure start, while a [leather-bound journal](/product/leather-journal) feels special enough to keep for years." },
      { product: "leather-journal", note: "Soft leather cover, thick ivory paper and a ribbon bookmark — made to be filled and kept." },

      { h: "Use a simple prompt" },
      { p: "The hardest part of journaling is the blank page. A fixed prompt removes that problem — you always know how to begin. Try this three-line format for your first month:" },
      { list: [
        "Three things that happened today",
        "One thing I'm grateful for",
        "One thing I'll do tomorrow",
      ] },
      { tip: "Write the date at the top of every entry, even if you skip days. In a year, the dates turn your journal into a timeline you'll love reading back.", title: "Small detail, big payoff" },
      { h3: "More prompts when you're ready" },
      { list: [
        "What took most of my energy today?",
        "What did I learn this week?",
        "What would make tomorrow a good day?",
        "A conversation I want to remember",
      ] },

      { h: "Build the habit" },
      { steps: [
        { title: "Attach it to something you already do", text: "Write after your evening tea, or before you sleep. An existing habit is the best reminder." },
        { title: "Keep the bar low", text: "Commit to three lines, not a page. On good days you'll write more; on busy days three lines still count." },
        { title: "Don't fix mistakes", text: "Cross out and keep going. A journal is for you, not for marks." },
        { title: "Read back once a month", text: "Ten minutes looking through the last month is what makes the habit feel worth it." },
      ] },
      { quote: "You don't need perfect words. You need a pen, a page and five honest minutes.", cite: "From our journal" },

      { h: "Add a little colour" },
      { p: "A few [gel pens](/product/gel-pack) or [highlighters](/product/highlighters) make it easy to mark moods, goals or anything worth remembering — one colour for gratitude, another for plans. Writing with a fountain pen? Here's [how to choose your first one](/blog/choosing-your-first-fountain-pen); a smooth nib makes the daily page a small pleasure." },

      { h: "Keep it where you'll see it" },
      { p: "A journal on your desk gets used. A journal in a drawer gets forgotten. Leave it open on the desk with a pen on top, and it will remind you every evening. If your desk is too cluttered to leave it out, start with our [10-minute desk routine](/blog/organise-your-desk-in-10-minutes)." },
      { p: "Find your next notebook in [notebooks & paper](/shop?cat=paper), or visit the shop and feel the paper before you choose — it matters more than you'd think." },
    ],
  },
];

// reading time from the actual words (≈ 220 words a minute)
function countWords(post) {
  const strings = [];
  const walk = (v, key) => {
    if (typeof v === "string") key !== "product" && key !== "kind" && strings.push(v);
    else if (Array.isArray(v)) v.forEach((x) => walk(x));
    else if (v && typeof v === "object") Object.entries(v).forEach(([k, x]) => walk(x, k));
  };
  walk([post.takeaways, post.body]);
  const text = strings.join(" ").replace(/\]\([^)]+\)/g, " ").replace(/[*[\]]/g, "");
  return text.split(/\s+/).filter(Boolean).length;
}

export const posts = raw.map((p) => ({ ...p, readTime: Math.max(1, Math.round(countWords(p) / 220)) }));

export function formatDate(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
