// Shrinks a photo in the browser before upload: longest side at most MAX_SIDE px,
// re-encoded as WebP (keeps transparency). A 1–2 MB camera/AI photo usually ends up
// around 100–250 KB, so the server stores and serves much lighter files.
// Falls back to the original file if the browser can't decode or encode it,
// or if the "compressed" file wouldn't actually be smaller.

export const MAX_SIDE = 1600;
export const QUALITY = 0.85;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Can't read this image"));
    };
    img.src = url;
  });
}

export async function compressImage(file, { maxSide = MAX_SIDE, quality = QUALITY } = {}) {
  // animated GIFs and SVGs would lose animation / sharpness
  if (!file.type.startsWith("image/") || /gif|svg/.test(file.type)) return file;
  let img;
  try {
    img = await loadImage(file);
  } catch {
    return file;
  }
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
  // some browsers silently fall back to PNG when WebP encoding isn't supported
  if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return file;
  const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
  return new File([blob], name, { type: "image/webp", lastModified: Date.now() });
}

export const formatSize = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
