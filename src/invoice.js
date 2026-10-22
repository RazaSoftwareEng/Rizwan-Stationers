// Builds a PDF invoice for an order in the browser and downloads it to the customer's device.
// jsPDF is loaded only when an invoice is actually made, so it doesn't slow the shop down.
import { shop } from "./data/shop.js";
import { ordersEnabled } from "./orders.js";

const NAVY = [20, 37, 74];
const GOLD = [176, 138, 62];
const INK = [24, 34, 58];
const MUTED = [100, 107, 122];
const LINE = [232, 224, 208];
const CREAM = [246, 241, 231];

const rs = (n) => "Rs " + Math.round(Number(n) || 0).toLocaleString("en-PK");
// the built-in PDF fonts only cover Latin text — swap the few characters they can't draw
const safe = (s) =>
  String(s ?? "")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, "...")
    .replace(/[^\x20-\x7E -ÿ–—]/g, "");

// the seal, shrunk to a small JPEG on the navy band so the PDF stays light (~30 KB)
async function logoDataUrl() {
  try {
    const img = new Image();
    img.src = "/seal.png";
    await img.decode();
    const size = 240;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgb(20, 37, 74)"; // header colour behind the seal's transparent corners
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);
    return canvas.toDataURL("image/jpeg", 0.85);
  } catch {
    return null;
  }
}

export async function makeInvoice(order) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 16; // margin
  const c = order.customer || {};
  const pickup = c.method === "pickup";
  const date = new Date(order.date || Date.now());
  const fmtDate = date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const fmtTime = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  // ---- header band ----
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 38, "F");
  const logo = await logoDataUrl();
  if (logo) doc.addImage(logo, "JPEG", M, 7, 24, 24);
  const tx = logo ? M + 30 : M;
  doc.setTextColor(217, 191, 133);
  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.text("Rizwan Stationer", tx, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(200, 208, 224);
  doc.text("STATIONERY & FINE WRITING  -  SINCE 1995", tx, 24);
  doc.text(safe(`${shop.address}  |  ${shop.phone}`), tx, 29.5);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("INVOICE", W - M, 18, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(217, 191, 133);
  doc.text(safe(order.number), W - M, 25, { align: "right" });

  // ---- order + customer blocks ----
  let y = 50;
  const col2 = W / 2 + 4;
  const label = (t, x, yy) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...GOLD);
    doc.text(t.toUpperCase(), x, yy);
  };
  const lines = (arr, x, yy, width) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    let cy = yy;
    for (const t of arr.filter(Boolean)) {
      const wrapped = doc.splitTextToSize(safe(t), width);
      doc.text(wrapped, x, cy);
      cy += wrapped.length * 5;
    }
    return cy;
  };

  label("Billed to", M, y);
  const yLeft = lines([c.name, c.phone, c.email, pickup ? "Pickup from the shop" : [c.address, c.city].filter(Boolean).join(", ")], M, y + 6, W / 2 - M - 6);
  label("Order details", col2, y);
  const yRight = lines(
    [`Order no: ${order.number}`, `Date: ${fmtDate}, ${fmtTime}`, `Status: ${order.status || "Received"}`, `Payment: ${pickup ? "Pay at the shop" : "Cash on delivery"}`],
    col2,
    y + 6,
    W - M - col2,
  );
  y = Math.max(yLeft, yRight) + 6;

  // ---- items table ----
  const cols = { item: M + 4, qty: W - M - 62, price: W - M - 34, total: W - M - 4 };
  doc.setFillColor(...NAVY);
  doc.roundedRect(M, y, W - 2 * M, 9, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text("ITEM", cols.item, y + 6);
  doc.text("QTY", cols.qty, y + 6, { align: "right" });
  doc.text("PRICE", cols.price, y + 6, { align: "right" });
  doc.text("AMOUNT", cols.total, y + 6, { align: "right" });
  y += 9;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  (order.items || []).forEach((it, i) => {
    const name = doc.splitTextToSize(safe(it.name), cols.qty - cols.item - 10);
    const h = Math.max(9, name.length * 5 + 4);
    if (y + h > H - 50) {
      doc.addPage();
      y = M;
    }
    if (i % 2) {
      doc.setFillColor(...CREAM);
      doc.rect(M, y, W - 2 * M, h, "F");
    }
    doc.setTextColor(...INK);
    doc.text(name, cols.item, y + 6);
    doc.text(String(it.qty), cols.qty, y + 6, { align: "right" });
    doc.text(rs(it.price), cols.price, y + 6, { align: "right" });
    doc.text(rs(it.price * it.qty), cols.total, y + 6, { align: "right" });
    y += h;
  });
  doc.setDrawColor(...LINE);
  doc.line(M, y, W - M, y);

  // ---- totals ----
  y += 8;
  const subtotal = order.subtotal ?? (order.items || []).reduce((n, i) => n + i.price * i.qty, 0);
  const row = (t, v, bold) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 12 : 10);
    doc.setTextColor(...(bold ? INK : MUTED));
    doc.text(t, W - M - 60, y);
    doc.setTextColor(...INK);
    doc.text(v, W - M - 4, y, { align: "right" });
    y += bold ? 9 : 7;
  };
  row("Subtotal", rs(subtotal));
  row("Delivery", safe(order.delivery || "-"));
  doc.setDrawColor(...GOLD);
  doc.line(W - M - 62, y - 3, W - M, y - 3);
  y += 3;
  row("Total", rs(order.total), true);
  if (order.delivery === "Confirmed on call") {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("Delivery charges, if any, are confirmed on the phone call.", W - M - 4, y - 2, { align: "right" });
    y += 4;
  }

  // ---- footer ----
  const fy = H - 32;
  doc.setDrawColor(...LINE);
  doc.line(M, fy, W - M, fy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text("Thank you for shopping with us!", M, fy + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  const site = window.location.origin;
  doc.text(
    safe(ordersEnabled ? `Track your order: ${site}/track  (order number + phone number)` : `Keep this invoice — quote ${order.number} when you call or message us.`),
    M,
    fy + 14,
  );
  doc.text(safe(`Questions? Call or WhatsApp ${shop.phone}  |  ${shop.email}`), M, fy + 19);
  doc.text("This is a computer-generated invoice and needs no signature.", M, fy + 24);

  return doc;
}

// make + download; returns false if it couldn't (e.g. the browser blocked it)
export async function downloadInvoice(order) {
  try {
    const doc = await makeInvoice(order);
    doc.save(`Invoice-${order.number}.pdf`);
    return true;
  } catch (err) {
    console.error("invoice", err);
    return false;
  }
}
