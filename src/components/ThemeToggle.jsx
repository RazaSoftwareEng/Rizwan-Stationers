import { useEffect, useState } from "react";

// Switches the whole site between the standard navy & gold scheme and burgundy & gold.
// The choice is remembered on this device; index.html applies it before the page paints.
const KEY = "rs-theme";
const META = { navy: "#14254a", burgundy: "#6e1423" };

function current() {
  return document.documentElement.dataset.theme === "burgundy" ? "burgundy" : "navy";
}

export function applyTheme(theme, animate = false) {
  const root = document.documentElement;
  if (animate) {
    root.classList.add("theme-switching");
    setTimeout(() => root.classList.remove("theme-switching"), 450);
  }
  if (theme === "burgundy") root.dataset.theme = "burgundy";
  else delete root.dataset.theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", META[theme] || META.navy);
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* ignore */
  }
}

// on/off switch: off = navy & gold (default), on = burgundy & gold
export default function ThemeToggle({ className = "", label = false }) {
  const [theme, setTheme] = useState(current);
  useEffect(() => setTheme(current()), []);
  const on = theme === "burgundy";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      className={"theme-switch " + className}
      onClick={() => {
        const next = on ? "navy" : "burgundy";
        applyTheme(next, true);
        setTheme(next);
      }}
      aria-label="Burgundy colour scheme"
      title={on ? "Switch back to navy & gold" : "Switch to burgundy & gold"}
    >
      <span className="theme-switch__track" aria-hidden="true">
        <span className="theme-switch__knob" />
      </span>
      {label && <span className="theme-switch__label">{on ? "Burgundy theme on" : "Burgundy theme"}</span>}
    </button>
  );
}
