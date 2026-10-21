// "The Pen Studio" floating carousel on the home page.
// Each entry pairs an upright transparent cutout (tip pointing down) and a glow colour
// with the API product whose name matches `name` (case and punctuation ignored).
// Entries without a matching product are skipped; with none, the section is hidden.
// `size` scales the image height (default 1).
// The middle entry is shown first.
const P = "/Products/pens/";

export const showcase = [
  { id: "hb-pencils", name: "HB Pencils — Box of 12", img: P + "hb-pencils.webp", glow: "#e2a33a" },
  { id: "whiteboard-marker", name: "Whiteboard Marker — Blue", img: P + "whiteboard-marker.webp", glow: "#2f6bff" },
  { id: "gel-pack", name: "Gel Pens — Pack of 10", img: P + "gel-pack.webp", glow: "#e79bb0" },
  { id: "calligraphy-pen", name: "Calligraphy Pen — Burgundy", img: P + "calligraphy-pen.webp", glow: "#b0334a" },
  { id: "ballpoint-blue", name: "Classic Ballpoint Pen — Blue", img: P + "ballpoint-blue.webp", glow: "#3d7bff" },
  { id: "highlighters", name: "Neon Highlighters — Set of 4", img: P + "highlighters.webp", glow: "#e6f23a" },
  { id: "student-fountain", name: "Student Fountain Pen", img: P + "student-fountain.webp", glow: "#5cc2ff" },
  { id: "gold-ballpoint", name: "Gold Executive Ballpoint Pen", img: P + "gold-ballpoint.webp", glow: "#e2b84f" },
  { id: "fountain-pen", name: "Classic Fountain Pen — Navy & Gold", img: P + "fountain-pen.webp", glow: "#d9bf85" },
  { id: "rollerball", name: "Metal Rollerball Pen", img: P + "rollerball.webp", glow: "#c0c7d6" },
  { id: "colour-pencils", name: "Colour Pencils — Set of 24", img: P + "colour-pencils.webp", glow: "#ff7a1a" },
  { id: "mechanical-pencil", name: "Mechanical Pencil — 0.5 mm", img: P + "mechanical-pencil.webp", glow: "#b8bfcc" },
  { id: "markers-24", name: "Colour Markers — Set of 24", img: P + "markers-24.webp", glow: "#22b35a" },
  { id: "brush-pen", name: "Brush Pen — Black Tip", img: P + "brush-pen.webp", glow: "#e53935" },
  { id: "permanent-marker", name: "Permanent Marker — Black", img: P + "permanent-marker.webp", glow: "#c9ced8" },
  { id: "correction-pen", name: "Correction Pen", img: P + "correction-pen.webp", glow: "#4a7dff" },
  { id: "paint-brush", name: "Round Watercolour Brush — No. 8", img: P + "paint-brush.webp", glow: "#c08a4f" },
];
