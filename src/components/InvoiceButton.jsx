import { useEffect, useRef, useState } from "react";
import { downloadInvoice } from "../invoice.js";
import Icon from "./Icon.jsx";

// "Download invoice" button. With `auto`, the PDF also downloads by itself once per order
// (right after checkout), so the customer has it on their phone or laptop.
export default function InvoiceButton({ order, auto = false, className = "btn btn--ghost btn--lg" }) {
  const [state, setState] = useState("idle"); // idle | working | done | failed
  const started = useRef(false);

  async function run() {
    setState("working");
    setState((await downloadInvoice(order)) ? "done" : "failed");
  }

  useEffect(() => {
    if (!auto || !order || started.current) return;
    started.current = true;
    const key = `rs-invoiced-${order.number}`;
    try {
      if (sessionStorage.getItem(key)) return; // don't download again on refresh
      sessionStorage.setItem(key, "1");
    } catch {
      /* storage blocked — still download once */
    }
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, order?.number]);

  if (!order) return null;
  return (
    <button type="button" className={className} onClick={run} disabled={state === "working"}>
      <Icon name="download" />
      {state === "working" ? "Preparing invoice…" : state === "done" ? "Invoice downloaded — again" : state === "failed" ? "Try the invoice again" : "Download invoice"}
    </button>
  );
}
