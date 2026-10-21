// "Shop the desk" hotspots on /desk-wide.jpg — a wide 1670 × 696 crop of after.png
// (y 130–826, which also drops the baked-in "After" label).
// box = [x1, y1, x2, y2] in image pixels around the product; dot = where the marker sits.
// Each spot shows the API product whose name matches `name` (case and punctuation ignored);
// spots with no matching product are hidden.
export const DESK_IMAGE = { src: "/desk-wide.jpg", width: 1670, height: 696 };

export const deskSpots = [
  { id: "highlighters", name: "Neon Highlighters — Set of 4", box: [632, 0, 805, 90], dot: [728, 50] },
  { id: "deskzen", name: "DeskZen Desk Organiser", box: [630, 5, 1108, 236], dot: [1052, 170] },
  { id: "box-file", name: "Lever Arch Box File — Blue", box: [1182, 0, 1670, 175], dot: [1425, 60] },
  { id: "spiral-a5", name: "Spiral Notebook A5", box: [582, 280, 1032, 696], dot: [810, 570] },
  { id: "rollerball", name: "Metal Rollerball Pen", box: [1052, 358, 1110, 696], dot: [1081, 510] },
  { id: "stapler", name: "Heavy-duty Office Stapler", box: [1214, 238, 1478, 394], dot: [1340, 295] },
  { id: "paper-clips", name: "Paper Clips in Clear Dispenser — 100", box: [1484, 290, 1656, 462], dot: [1570, 375] },
  { id: "sticky-cube", name: "Sticky Notes Cube", box: [1280, 444, 1506, 670], dot: [1392, 538] },
];
