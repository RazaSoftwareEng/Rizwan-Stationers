// "Shop the desk" hotspots on /desk-wide.jpg — a wide 1670 × 696 crop of after.png
// (y 130–826, which also drops the baked-in "After" label).
// box = [x1, y1, x2, y2] in image pixels around the product; dot = where the marker sits.
// Prices and names come from products.js via `id`.
export const DESK_IMAGE = { src: "/desk-wide.jpg", width: 1670, height: 696 };

export const deskSpots = [
  { id: "highlighters", box: [632, 0, 805, 90], dot: [728, 50] },
  { id: "deskzen", box: [630, 5, 1108, 236], dot: [1052, 170] },
  { id: "box-file", box: [1182, 0, 1670, 175], dot: [1425, 60] },
  { id: "spiral-a5", box: [582, 280, 1032, 696], dot: [810, 570] },
  { id: "rollerball", box: [1052, 358, 1110, 696], dot: [1081, 510] },
  { id: "stapler", box: [1214, 238, 1478, 394], dot: [1340, 295] },
  { id: "paper-clips", box: [1484, 290, 1656, 462], dot: [1570, 375] },
  { id: "sticky-cube", box: [1280, 444, 1506, 670], dot: [1392, 538] },
];
