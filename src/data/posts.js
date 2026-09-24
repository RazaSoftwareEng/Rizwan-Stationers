// Blog posts. Body blocks: { h: "heading" } or { p: "paragraph" } or { list: [...] }.
export const posts = [
  {
    slug: "organise-your-desk-in-10-minutes",
    title: "How to organise your desk in 10 minutes",
    excerpt:
      "A cluttered desk slows you down. Here's a quick routine — and the one tool — that turns chaos into calm.",
    topic: "Desk & Study",
    category: "organisers",
    date: "2026-09-10",
    readTime: 4,
    cover: "/blog-desk.jpg",
    body: [
      { p: "Papers under papers, pens that have wandered off, sticky notes stuck to everything. A messy desk costs you time every single day — and it's easier to fix than you think." },
      { h: "1. Clear everything off" },
      { p: "Take every item off the desk and put it on a chair or the floor. Starting from an empty surface is the fastest way to see what actually belongs there." },
      { h: "2. Sort into three piles" },
      { list: ["Use daily — pens, notebook, sticky notes", "Use weekly — stapler, files, reference books", "Doesn't belong — old papers, wrappers, dried-out pens"] },
      { h: "3. Give daily items one home" },
      { p: "This is where a desk organiser earns its place. One base with slots for pens, clips, notes and scissors means everything you reach for is in the same spot — every time." },
      { h: "4. File or bin the rest" },
      { p: "Weekly items go in a drawer or file tray. Anything in the third pile leaves the desk today. Repeat the routine every Friday and it takes two minutes." },
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
    readTime: 5,
    body: [
      { p: "A good fountain pen makes writing feel effortless. The ink flows with almost no pressure, and your handwriting often improves just from slowing down a little." },
      { h: "Pick the right nib" },
      { list: ["Fine (F) — neat, small handwriting and cheaper paper", "Medium (M) — the everyday all-rounder", "Broad (B) — bold lines and signatures"] },
      { p: "If you're unsure, start with a fine or medium nib." },
      { h: "Cartridge or bottle?" },
      { p: "Cartridges are clean and convenient. A converter lets you fill from a bottle, which gives you far more colours and costs less over time. Many pens accept both." },
      { h: "Care in two minutes" },
      { p: "Flush the pen with plain water every few weeks, and cap it whenever you're not writing. That's all it takes to keep it writing smoothly for years." },
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
    readTime: 3,
    body: [
      { p: "Every new term brings the same question: what do we actually need? Here's the list we fill at the counter most often." },
      { h: "Writing" },
      { list: ["Blue and black ballpoint or gel pens", "HB pencils, sharpener and eraser", "Highlighters in 2–3 colours"] },
      { h: "Paper" },
      { list: ["Single-line registers for each subject", "A spiral notebook for rough work", "A clear folder for loose sheets"] },
      { h: "Maths & art" },
      { list: ["A full geometry box", "Colour pencils or markers", "A basic watercolour set for younger classes"] },
      { p: "Tip: send us your school's list on WhatsApp and we'll pack the whole thing for you, ready to collect." },
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
    readTime: 4,
    body: [
      { p: "Journaling has a reputation for being time-consuming. It doesn't have to be. One page, a few minutes, most days — that's enough to feel the difference." },
      { h: "Choose a notebook you like" },
      { p: "Not the most expensive one — one that makes you want to open it. A5 is a comfortable size to carry and write in." },
      { h: "Use a simple prompt" },
      { list: ["Three things that happened today", "One thing I'm grateful for", "One thing I'll do tomorrow"] },
      { h: "Keep it where you'll see it" },
      { p: "A journal on your desk gets used. A journal in a drawer gets forgotten." },
    ],
  },
];

export function formatDate(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
