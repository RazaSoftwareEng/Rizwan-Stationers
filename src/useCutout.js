import { useEffect, useState } from "react";

// Turns a product photo shot on a plain white background into a transparent cut-out,
// in the browser, so cards can lift the product out of the frame on hover.
// Only the white connected to the photo's edges is removed (highlights inside the
// product stay). Photos whose edges aren't mostly white are left alone (null).
// Needs a same-origin image (product media is served through the /media proxy).

const MAX_SIDE = 900;
const cache = new Map(); // src -> Promise<string | null>

const isWhite = (d, i, t) => d[i] > t && d[i + 1] > t && d[i + 2] > t && Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]) < 22;

function process(img) {
  const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h);
  const d = data.data;

  // 1. are the edges white enough to call this a white-background shot?
  const edge = [];
  for (let x = 0; x < w; x++) edge.push(x, (h - 1) * w + x);
  for (let y = 1; y < h - 1; y++) edge.push(y * w, y * w + w - 1);
  const white = edge.filter((p) => isWhite(d, p * 4, 232)).length;
  if (white / edge.length < 0.9) return null;

  // 2. flood-fill the white background in from the edges
  const bg = new Uint8Array(w * h);
  const stack = edge.filter((p) => isWhite(d, p * 4, 222));
  for (const p of stack) bg[p] = 1;
  while (stack.length) {
    const p = stack.pop();
    const x = p % w;
    const y = (p - x) / w;
    const next = [x > 0 && p - 1, x < w - 1 && p + 1, y > 0 && p - w, y < h - 1 && p + w];
    for (const n of next) {
      if (n === false || bg[n]) continue;
      if (isWhite(d, n * 4, 222)) {
        bg[n] = 1;
        stack.push(n);
      }
    }
  }

  // 3. clear the background, soften the edge so it doesn't look jagged
  for (let p = 0; p < w * h; p++) {
    const i = p * 4;
    if (bg[p]) {
      d[i + 3] = 0;
      continue;
    }
    const x = p % w;
    const touchesBg = (x > 0 && bg[p - 1]) || (x < w - 1 && bg[p + 1]) || (p >= w && bg[p - w]) || (p < w * (h - 1) && bg[p + w]);
    if (touchesBg) {
      // lighter (whiter) fringe pixels fade out more
      const light = Math.min(d[i], d[i + 1], d[i + 2]);
      d[i + 3] = Math.round(255 * Math.min(1, Math.max(0.25, (255 - light) / 90)));
    }
  }
  ctx.putImageData(data, 0, 0);

  // 4. trim the empty margin so the product fills the frame
  let top = h,
    left = w,
    right = -1,
    bottom = -1;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (d[(y * w + x) * 4 + 3] > 24) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
  if (right < left) return null;
  const pad = Math.round(Math.max(w, h) * 0.02);
  const cw = Math.min(w, right - left + 1 + pad * 2);
  const ch = Math.min(h, bottom - top + 1 + pad * 2);
  const out = document.createElement("canvas");
  out.width = cw;
  out.height = ch;
  out.getContext("2d").drawImage(canvas, Math.max(0, left - pad), Math.max(0, top - pad), cw, ch, 0, 0, cw, ch);
  return new Promise((resolve) => out.toBlob((b) => resolve(b ? URL.createObjectURL(b) : null), "image/png"));
}

export function makeCutout(src) {
  if (!src) return Promise.resolve(null);
  if (!cache.has(src)) {
    cache.set(
      src,
      new Promise((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          try {
            resolve(process(img));
          } catch {
            resolve(null); // e.g. a cross-origin image the canvas may not read
          }
        };
        img.onerror = () => resolve(null);
        img.src = src;
      }),
    );
  }
  return cache.get(src);
}

// React hook: the cut-out's URL once ready, otherwise null
export function useCutout(src) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let live = true;
    setUrl(null);
    makeCutout(src).then((u) => live && setUrl(u));
    return () => {
      live = false;
    };
  }, [src]);
  return url;
}
