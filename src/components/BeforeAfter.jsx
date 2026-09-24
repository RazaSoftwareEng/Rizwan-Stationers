import { useEffect, useRef, useState } from "react";
import "./BeforeAfter.css";

export default function BeforeAfter({
  before = "/before.png",
  after = "/after.png",
  beforeAlt = "A cluttered desk covered with scattered papers, pens, sticky notes, paper clips and crumpled paper",
  afterAlt = "An organised desk: a black organiser holding markers, scissors, paper clips and sticky notes, a neat notebook, pen, stapler and binders",
}) {
  const ref = useRef(null);
  const [pos, setPosState] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const interactedRef = useRef(false);

  const setPos = (p) => setPosState(Math.max(0, Math.min(100, p)));
  const markInteracted = () => {
    interactedRef.current = true;
    setInteracted(true);
  };
  const xToPos = (clientX) => {
    const r = ref.current.getBoundingClientRect();
    return ((clientX - r.left) / r.width) * 100;
  };

  // one-time nudge when the slider first scrolls into view
  useEffect(() => {
    const el = ref.current;
    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce || !("IntersectionObserver" in window)) {
      later(markInteracted, 5000);
      return () => timers.forEach(clearTimeout);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        later(() => !interactedRef.current && setPos(66), 300);
        later(() => !interactedRef.current && setPos(36), 750);
        later(() => !interactedRef.current && setPos(50), 1200);
        later(markInteracted, 4500);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  function onPointerDown(e) {
    setDragging(true);
    try {
      ref.current.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    setPos(xToPos(e.clientX));
    markInteracted();
  }
  function onPointerMove(e) {
    if (dragging) setPos(xToPos(e.clientX));
  }
  function onKeyDown(e) {
    const step = e.shiftKey ? 10 : 3;
    const next = {
      ArrowLeft: pos - step,
      ArrowDown: pos - step,
      ArrowRight: pos + step,
      ArrowUp: pos + step,
      Home: 0,
      End: 100,
    }[e.key];
    if (next !== undefined) {
      setPos(next);
      markInteracted();
      e.preventDefault();
    }
  }

  const classes = [
    "ba",
    dragging && "is-dragging",
    interacted && "is-interacted",
    pos < 25 && "is-after-revealed",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={ref}
      className={classes}
      style={{ "--pos": pos + "%" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
    >
      <img className="ba__img" src={after} alt={afterAlt} width="1670" height="941" draggable="false" />
      <img className="ba__img ba__before" src={before} alt={beforeAlt} width="1672" height="941" draggable="false" />

      <span className="ba__pill">After</span>
      <div className="ba__divider" aria-hidden="true" />
      <button
        className="ba__handle"
        type="button"
        role="slider"
        aria-label="Compare the cluttered desk with the organised one"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={Math.round(pos)}
        onKeyDown={onKeyDown}
      >
        <svg className="ba__bars" viewBox="0 0 22 22" aria-hidden="true">
          <rect x="6" y="5" width="2.5" height="12" rx="1.25" />
          <rect x="9.75" y="5" width="2.5" height="12" rx="1.25" />
          <rect x="13.5" y="5" width="2.5" height="12" rx="1.25" />
        </svg>
      </button>
      <span className="ba__hint" aria-hidden="true">
        Drag to compare
      </span>
    </div>
  );
}
