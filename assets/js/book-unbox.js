/* ==========================================================================
   Rizwan Stationers — Book Unboxing / Review section  (isolated)
   Scroll-scrubbed 3D unboxing. Reuses the page's existing GSAP + ScrollTrigger.
   Everything is scoped to each .rz-book-unbox root via gsap.context — no global
   selectors, no side effects outside the namespace. Falls back to a clean
   static card when GSAP is unavailable or prefers-reduced-motion is set.
   ========================================================================== */
(function () {
  "use strict";

  function num(root, name) {
    return parseFloat(getComputedStyle(root).getPropertyValue(name)) || 0;
  }

  function initRoot(root) {
    if (root.dataset.rzbuReady) return;
    root.dataset.rzbuReady = "1";

    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!gsap || !ScrollTrigger || reduce) {
      root.classList.add("rzbu-static");
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    gsap.context(function () {
      var stage = root.querySelector("[data-rz-stage]");
      var mobile = window.matchMedia("(max-width: 720px)").matches;

      // geometry (matches the CSS vars for this breakpoint)
      var bh = num(root, "--rzbu-bh");
      var kh = num(root, "--rzbu-kh");

      var bookInsideY = bh * 0.02;                 // concealed inside the tall box
      var bookRiseY   = -(bh * 0.37);              // lifted up through the opening
      var bookExitY   = bookRiseY - kh * 0.95;     // leaves the frame upward

      // resting state
      gsap.set("[data-rz-box]", { transformOrigin: "50% 50%" });
      gsap.set("[data-rz-book]", { y: bookInsideY, scale: 0.9, opacity: 0, transformOrigin: "50% 50%" });
      gsap.set("[data-rz-bookwrap]", { rotateY: -24, rotateX: 3 });
      gsap.set("[data-rz-bookshadow]", { opacity: 0 });

      var rot = mobile ? 8 : 12;

      var tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: "+=" + (mobile ? 300 : 420) + "%",
          pin: stage,
          scrub: 1,
          invalidateOnRefresh: true
        }
      });

      // 0.00–0.10 — box eases closer, hint fades
      tl.fromTo("[data-rz-box]", { scale: 0.82, y: 34 }, { scale: 1, y: 6, ease: "power2.out" }, 0.0)
        .to("[data-rz-hint]", { opacity: 0, ease: "power1.in" }, 0.03);

      // 0.10–0.22 — the tape seal releases
      tl.to(".rzbu-seal", { opacity: 0, ease: "power1.inOut" }, 0.10);

      // 0.16–0.40 — the four flaps open upward and splay outward
      tl.to(root, { "--rzbu-flap-front": 20, ease: "power2.inOut" }, 0.16)
        .to(root, { "--rzbu-flap-back": -20, ease: "power2.inOut" }, 0.16)
        .to(root, { "--rzbu-flap-left": 34, ease: "power2.inOut" }, 0.19)
        .to(root, { "--rzbu-flap-right": 34, ease: "power2.inOut" }, 0.19);

      // 0.38–0.60 — the book rises out of the box
      tl.to("[data-rz-book]", { opacity: 1, duration: 0.06, ease: "power1.out" }, 0.38)
        .to("[data-rz-book]", { y: bookRiseY, scale: 1, ease: "power3.out" }, 0.40)
        .to("[data-rz-bookshadow]", { opacity: 0.5, ease: "power2.out" }, 0.46);

      // 0.44–0.66 — box recedes so focus lands on the book
      tl.to("[data-rz-box]", { y: 120, opacity: 0.16, ease: "power2.inOut" }, 0.50);

      // 0.56–0.76 — subtle 3D presentation rotation + camera focus
      tl.to("[data-rz-bookwrap]", { rotateY: 9, rotateX: -2, ease: "power2.inOut" }, 0.56)
        .to("[data-rz-scene]", { scale: mobile ? 1.03 : 1.06, ease: "power2.inOut" }, 0.56)
        .fromTo("[data-rz-scene]", { rotateX: rot }, { rotateX: rot - 5, ease: "power2.inOut" }, 0.56);

      // 0.72–0.88 — product copy resolves in
      tl.to("[data-rz-label]", { opacity: 1, y: 0, ease: "power3.out" }, 0.72)
        .to("[data-rz-name]",  { opacity: 1, y: 0, ease: "power3.out" }, 0.75)
        .to("[data-rz-desc]",  { opacity: 1, y: 0, ease: "power3.out" }, 0.78)
        .to("[data-rz-price]", { opacity: 1, y: 0, ease: "power3.out" }, 0.81)
        .to("[data-rz-cta]",   { opacity: 1, y: 0, ease: "power3.out" }, 0.84);

      // 0.82–1.00 — the box fully clears, then the book smoothly exits;
      // the copy stays put so the CTA remains shoppable at the end.
      tl.to("[data-rz-box]", { opacity: 0, ease: "power2.in" }, 0.82)
        .to("[data-rz-book]", { y: bookExitY, scale: 1.02, opacity: 0, ease: "power2.in" }, 0.88)
        .to("[data-rz-bookshadow]", { opacity: 0, ease: "power2.in" }, 0.88);

      // keep px offsets correct across breakpoints
      var ro;
      window.addEventListener("resize", function () {
        clearTimeout(ro);
        ro = setTimeout(function () { ScrollTrigger.refresh(); }, 160);
      }, { passive: true });

      ScrollTrigger.refresh();
    }, root);
  }

  function boot() {
    var roots = document.querySelectorAll(".rz-book-unbox");
    for (var i = 0; i < roots.length; i++) initRoot(roots[i]);
  }

  if (document.readyState === "complete") boot();
  else window.addEventListener("load", boot);
})();
