import { useEffect, useId, useRef, useState } from "react";

// Small dependency-free SVG charts for the admin dashboard.
// Colors (validated on the white card surface):
//   area/line  #b08a3e brand gold   ·  bars #14254a brand navy  (single series each, >= 3:1)
//   order status  ordinal blue ramp #86b6ef → #0d366b (one hue, light→dark)
//   stock  status good #0ca30c / critical #d03b3b, always with a text label
export const CHART = {
  gold: "#b08a3e",
  navy: "#14254a",
  grid: "#ece7dc",
  axis: "#8a8f9c",
  ordinal: ["#86b6ef", "#3987e5", "#1c5cab", "#0d366b"],
  good: "#0ca30c",
  critical: "#d03b3b",
};

// tooltip that follows the pointer inside a chart box
function useTip() {
  const box = useRef(null);
  const [tip, setTip] = useState(null);
  const show = (e, content) => {
    const r = box.current.getBoundingClientRect();
    const x = e.clientX - r.left;
    setTip({ x, y: e.clientY - r.top, flip: x > r.width - 170, content });
  };
  const node = tip && (
    <div className={"adm-tip" + (tip.flip ? " is-flip" : "")} style={{ left: tip.x, top: tip.y }} role="status">
      {tip.content}
    </div>
  );
  return { box, show, hide: () => setTip(null), node };
}

function SrTable({ caption, rows, head }) {
  return (
    <table className="adm-sr">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {head.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) => (
              <td key={j}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const niceMax = (v) => {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
};

/* ---------- area chart with crosshair (one series over time) ---------- */
export function AreaChart({ data, format = (v) => v, label, emptyText }) {
  const id = useId().replace(/:/g, "");
  const { box, show, hide, node } = useTip();
  const [hover, setHover] = useState(null);
  // draw at the box's real width so axis text stays a readable size on phones
  const [W, setW] = useState(640);
  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, [box]);
  const H = W < 480 ? 200 : 220,
    L = 52,
    R = 12,
    T = 14,
    B = 28;
  const peak = Math.max(0, ...data.map((d) => d.value));
  // with no data yet, show a sensible empty scale instead of 0–1
  const max = peak ? niceMax(peak) : 1000;
  const x = (i) => L + (i * (W - L - R)) / Math.max(1, data.length - 1);
  const y = (v) => T + (H - T - B) * (1 - v / max);
  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.value)}`).join("");
  const area = `${line}L${x(data.length - 1)},${y(0)}L${x(0)},${y(0)}Z`;
  const empty = data.every((d) => !d.value);
  const ticks = [0, 0.5, 1].map((f) => max * f);
  const every = Math.ceil(data.length / Math.max(3, Math.floor((W - L) / 80)));

  function onMove(e) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.max(0, Math.min(data.length - 1, Math.round(((px - L) / (W - L - R)) * (data.length - 1))));
    setHover(i);
    show(e, (
      <>
        <strong>{data[i].full || data[i].label}</strong>
        <span>
          {label}: {format(data[i].value)}
        </span>
        {data[i].note && <span>{data[i].note}</span>}
      </>
    ));
  }

  return (
    <div className="adm-chart" ref={box}>
      <svg viewBox={`0 0 ${W} ${H}`} className="adm-chart__svg" role="img" aria-label={`${label} by day`} onMouseMove={onMove} onMouseLeave={() => (setHover(null), hide())}>
        <defs>
          <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={CHART.gold} stopOpacity="0.28" />
            <stop offset="1" stopColor={CHART.gold} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke={CHART.grid} />
            <text x={L - 8} y={y(t)} dy="0.32em" textAnchor="end" className="adm-chart__axis">
              {format(t)}
            </text>
          </g>
        ))}
        {data.map((d, i) =>
          // every n-th day, plus the last one unless it would crowd the previous label
          i % every === 0 || (i === data.length - 1 && i % every >= every / 2 + 0.5) ? (
            <text key={i} x={x(i)} y={H - 8} textAnchor="middle" className="adm-chart__axis">
              {d.label}
            </text>
          ) : null,
        )}
        <path d={area} fill={`url(#g${id})`} />
        <path d={line} fill="none" stroke={CHART.gold} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {hover != null && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={T} y2={y(0)} stroke={CHART.axis} strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(data[hover].value)} r="5" fill={CHART.gold} stroke="#fff" strokeWidth="2" />
          </>
        )}
      </svg>
      {empty && <p className="adm-chart__empty">{emptyText}</p>}
      {node}
      <SrTable caption={label} head={["Day", label]} rows={data.map((d) => [d.full || d.label, format(d.value)])} />
    </div>
  );
}

/* ---------- horizontal bars (one series, ranked) ---------- */
export function BarChart({ data, format = (v) => v, label, onSelect }) {
  const { box, show, hide, node } = useTip();
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="adm-chart" ref={box} onMouseLeave={hide}>
      <ul className="adm-hbars" aria-label={label}>
        {data.map((d) => (
          <li
            key={d.label}
            onMouseMove={(e) =>
              show(e, (
                <>
                  <strong>{d.label}</strong>
                  <span>
                    {label}: {format(d.value)}
                  </span>
                  {d.note && <span>{d.note}</span>}
                </>
              ))
            }
          >
            <button type="button" className="adm-hbars__row" onClick={() => onSelect?.(d)} disabled={!onSelect}>
              <span className="adm-hbars__name">{d.label}</span>
              <span className="adm-hbars__track">
                <span className="adm-hbars__bar" style={{ width: `${Math.max(2, (d.value / max) * 100)}%`, background: CHART.navy }} />
              </span>
              <span className="adm-hbars__val">{format(d.value)}</span>
            </button>
          </li>
        ))}
      </ul>
      {node}
    </div>
  );
}

/* ---------- donut (parts of a whole, few slices, with legend) ---------- */
export function Donut({ segments, centerValue, centerLabel, label }) {
  const { box, show, hide, node } = useTip();
  const [active, setActive] = useState(null);
  const total = segments.reduce((n, s) => n + s.value, 0);
  const R = 70,
    STROKE = 22,
    C = 2 * Math.PI * R,
    GAP = total && segments.filter((s) => s.value).length > 1 ? 3 : 0;
  let offset = 0;
  return (
    <div className="adm-donut" ref={box}>
      <div className="adm-donut__ring">
        <svg viewBox="0 0 180 180" role="img" aria-label={label} onMouseLeave={() => (setActive(null), hide())}>
          <circle cx="90" cy="90" r={R} fill="none" stroke={CHART.grid} strokeWidth={STROKE} />
          {total > 0 &&
            segments.map((s, i) => {
              if (!s.value) return null;
              const len = (s.value / total) * C;
              const dash = `${Math.max(0, len - GAP)} ${C - Math.max(0, len - GAP)}`;
              const el = (
                <circle
                  key={s.label}
                  cx="90"
                  cy="90"
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={active === i ? STROKE + 6 : STROKE}
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                  transform="rotate(-90 90 90)"
                  style={{ transition: "stroke-width .2s" }}
                  onMouseMove={(e) => {
                    setActive(i);
                    show(e, (
                      <>
                        <strong>{s.label}</strong>
                        <span>
                          {s.value} · {Math.round((s.value / total) * 100)}%
                        </span>
                      </>
                    ));
                  }}
                />
              );
              offset += len;
              return el;
            })}
        </svg>
        <div className="adm-donut__center">
          <strong>{centerValue}</strong>
          <span>{centerLabel}</span>
        </div>
      </div>
      <ul className="adm-legend">
        {segments.map((s) => (
          <li key={s.label}>
            <span className="adm-legend__sw" style={{ background: s.color }} />
            <span className="adm-legend__name">{s.label}</span>
            <span className="adm-legend__val">
              {s.value}
              {total > 0 && <small> · {Math.round((s.value / total) * 100)}%</small>}
            </span>
          </li>
        ))}
      </ul>
      {node}
    </div>
  );
}

/* ---------- vertical columns (distribution) ---------- */
export function ColumnChart({ data, label }) {
  const { box, show, hide, node } = useTip();
  const max = niceMax(Math.max(0, ...data.map((d) => d.value)));
  return (
    <div className="adm-chart" ref={box} onMouseLeave={hide}>
      <div className="adm-cols" role="img" aria-label={label}>
        {data.map((d) => (
          <div
            key={d.label}
            className="adm-cols__col"
            onMouseMove={(e) =>
              show(e, (
                <>
                  <strong>{d.label}</strong>
                  <span>
                    {d.value} {d.value === 1 ? "product" : "products"}
                  </span>
                </>
              ))
            }
          >
            <span className="adm-cols__plot">
              <span className="adm-cols__bar" style={{ height: `${(d.value / max) * 100}%`, background: CHART.navy }} />
            </span>
            <span className="adm-cols__label">{d.label}</span>
          </div>
        ))}
      </div>
      {node}
      <SrTable caption={label} head={["Price range", "Products"]} rows={data.map((d) => [d.label, d.value])} />
    </div>
  );
}
