// "Fly to cart": a copy of the product photo arcs from where it was added
// into the header cart icon, which then gives a little bounce.
// The header cart button carries `data-cart-target`.

const reduceMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function bumpCart(target) {
  target.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.28) rotate(-8deg)" },
      { transform: "scale(0.92) rotate(4deg)" },
      { transform: "scale(1)" },
    ],
    { duration: 450, easing: "ease-out" }
  );
}

export function flyToCart(sourceEl) {
  const target = document.querySelector("[data-cart-target]");
  if (!target) return;
  const to = target.getBoundingClientRect();
  if (!sourceEl || reduceMotion() || !to.width) {
    bumpCart(target);
    return;
  }

  const from = sourceEl.getBoundingClientRect();
  if (!from.width) {
    bumpCart(target);
    return;
  }

  // flying copy, sized to the source but capped so big gallery photos stay light
  const size = Math.min(from.width, from.height, 220);
  const ghost = document.createElement("img");
  ghost.src = sourceEl.currentSrc || sourceEl.src;
  ghost.alt = "";
  ghost.className = "fly-ghost";
  if (sourceEl.closest(".card__art--cutout")) ghost.classList.add("fly-ghost--cutout");
  Object.assign(ghost.style, {
    width: `${size}px`,
    height: `${size}px`,
    left: `${from.left + from.width / 2 - size / 2}px`,
    top: `${from.top + from.height / 2 - size / 2}px`,
  });
  document.body.appendChild(ghost);

  // move centre → centre, rising above both points for a curved path
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const lift = Math.min(160, Math.abs(dx) * 0.35 + 60);
  const end = 28 / size;

  const anim = ghost.animate(
    [
      { transform: "translate(0, 0) scale(1) rotate(0deg)", opacity: 1, offset: 0 },
      { transform: `translate(0, -24px) scale(1.06) rotate(-4deg)`, opacity: 1, offset: 0.12 },
      {
        transform: `translate(${dx * 0.55}px, ${dy * 0.55 - lift}px) scale(${0.55 + end}) rotate(8deg)`,
        opacity: 1,
        offset: 0.6,
      },
      { transform: `translate(${dx}px, ${dy}px) scale(${end}) rotate(0deg)`, opacity: 0.6, offset: 1 },
    ],
    { duration: 850, easing: "cubic-bezier(0.5, 0, 0.3, 1)", fill: "forwards" }
  );
  anim.onfinish = () => {
    ghost.remove();
    bumpCart(target);
  };
}
