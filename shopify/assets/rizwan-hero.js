/* ==========================================================================
   Rizwan Stationers — Cinematic Hero engine
   One pinned, scroll-driven scene: floating studio → camera descent → desk
   assembly → CTA. Real products, GPU-only transforms, graceful fallback.
   ========================================================================== */
(function () {
  "use strict";

  const RS = window.RS || {};
  const PRODUCTS = RS.PRODUCTS || [];
  const DESK_ORDER = RS.DESK_ORDER || [];
  const MOBILE_SET = RS.MOBILE_SET || [];

  const scene      = document.getElementById("scene");
  const catsEl     = document.getElementById("cats");
  const nav        = document.getElementById("nav");
  const reduceMQ   = window.matchMedia("(prefers-reduced-motion: reduce)");

  const byId = {};
  PRODUCTS.forEach((p) => (byId[p.id] = p));

  /* ---------- helpers ---------- */
  const vw = () => window.innerWidth;
  const vh = () => window.innerHeight;
  const isMobile = () => window.innerWidth <= 860;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const sizeFactor = () => (isMobile() ? 0.5 : 1);

  const PKR = (n) => "Rs. " + n.toLocaleString("en-PK");

  /* resolve the active layout config for a phase, honouring mobile variants */
  function cfgFor(p, phase) {
    const m = isMobile();
    if (phase === "hero") return (m && p.mHero) ? p.mHero : p.hero;
    return (m && p.mDesk) ? p.mDesk : p.desk;
  }

  /* ---------- build the product DOM (once) ---------- */
  function buildProducts() {
    if (!scene) return;
    PRODUCTS.forEach((p) => {
      const el = document.createElement("a");
      el.className = "product";
      el.id = "prod-" + p.id;
      el.href = RS.STORE + "/products/" + p.handle;
      el.setAttribute("aria-label", p.name + " — " + PKR(p.price));
      el.innerHTML =
        '<div class="product__shadow"></div>' +
        '<div class="product__plate">' +
          '<img class="product__img" src="' + p.img + '" alt="' + p.name + '" loading="' + (p.desk.z >= 4 ? "eager" : "lazy") + '" decoding="async" />' +
          '<div class="product__info">' +
            '<div class="product__meta"><span class="n">' + p.name + '</span><span class="b">' + p.blurb + '</span></div>' +
            '<div class="product__buy"><span class="p">' + PKR(p.price) + '</span><span class="v">View &rarr;</span></div>' +
          '</div>' +
        '</div>';
      // scroll-driven base state + intro reveal state (seed at hero position)
      const h = cfgFor(p, "hero");
      p._s = { x: (h.x / 100) * window.innerWidth, y: (h.y / 100) * window.innerHeight, rot: h.rot, scale: h.scale };
      p._r = { o: 0, ry: 40, rs: 0.92 };
      p._c = { v: 0.14 };
      p._el = el;
      p._img = el.querySelector(".product__img");
      p._plate = el.querySelector(".product__plate");
      scene.appendChild(el);
    });
    layoutProducts();
  }

  /* size the plates for the current breakpoint */
  function layoutProducts() {
    const f = sizeFactor();
    PRODUCTS.forEach((p) => {
      const w = p.w * f;
      p._el.style.width = w + "px";
      p._el.style.marginLeft = -w / 2 + "px";
      p._el.style.marginTop = -(w * 0.75) / 2 + "px";
    });
  }

  /* px position from a product + phase (honours mobile variants) */
  function pos(p, phase) {
    const c = cfgFor(p, phase);
    return { x: (c.x / 100) * vw(), y: (c.y / 100) * vh() };
  }

  function applyVisibility() {
    const m = isMobile();
    PRODUCTS.forEach((p) => {
      const show = !m || MOBILE_SET.indexOf(p.id) !== -1;
      p._el.style.display = show ? "" : "none";
      p._visible = show;
    });
  }

  /* ---------- category cards (real collections) ---------- */
  function buildCats() {
    if (!catsEl) return;
    const base = "https://cdn.shopify.com/s/files/1/1013/5194/8581/collections/";
    const CATS = [
      { t: "Office Supplies", h: "office-supplies-example-products", img: "https://cdn.shopify.com/s/files/1/1013/5194/8581/files/Pens_in_ceramic_jar_202609071548.jpg?v=1788778171&width=700" },
      { t: "Art Pencils",     h: "art-pencil",             img: base + "categories_1.jpg?v=1786349762&width=700" },
      { t: "Cutters & Scissors", h: "paper-cutter-scissors", img: base + "categories_2.jpg?v=1786350081&width=700" },
      { t: "Drawing Pads",    h: "drawing-pad",            img: base + "categories_5.jpg?v=1786350131&width=700" },
      { t: "Sketch Books",    h: "sketch-books",           img: base + "categories_4.jpg?v=1786349975&width=700" },
      { t: "Acrylic Paints",  h: "acrylic-paint-set",      img: base + "categories_9.jpg?v=1786349730&width=700" }
    ];
    catsEl.innerHTML = CATS.map((c) =>
      '<a class="cat will-reveal" href="' + RS.STORE + "/collections/" + c.h + '">' +
        '<img src="' + c.img + '" alt="' + c.t + '" loading="lazy" decoding="async" />' +
        '<span class="cat__label"><span>' + c.t + '</span><span>&rarr;</span></span>' +
      "</a>"
    ).join("");
  }

  /* ---------- reveal-on-scroll for the brand page below ---------- */
  function bandReveals() {
    const targets = [];
    document.querySelectorAll(".statement, .band--stats .stat, .band__head, .band--quote blockquote, .band--cta h2, .band--cta p, .band--cta .btn").forEach((el) => {
      el.classList.add("will-reveal");
      targets.push(el);
    });
    document.querySelectorAll(".cat").forEach((el) => targets.push(el));
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          e.target.style.transitionDelay = (Math.min(i, 4) * 60) + "ms";
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    targets.forEach((el) => io.observe(el));
  }

  /* ---------- nav visibility (only if this build ships its own nav) ---------- */
  function navWatch() {
    if (!nav) return; // Shopify themes provide their own header
    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle("is-visible", y > vh() * 0.55);
      nav.classList.toggle("is-solid", y > vh() * 0.9);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ======================================================================
     STATIC / REDUCED-MOTION PATH
     ====================================================================== */
  function runStatic() {
    document.body.classList.add("no-cinema");
    // show everything in resting-desk state, no motion
    PRODUCTS.forEach((p) => {
      p._el.style.display = "";
      p._el.classList.add("is-live");
    });
    buildCats();
    bandReveals();
    navWatch();
    if (nav) nav.classList.add("is-visible");
  }

  /* ======================================================================
     CINEMATIC PATH
     ====================================================================== */
  function runCinema() {
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);
    const ST = window.ScrollTrigger;

    applyVisibility();

    /* ---- render loop: compose scroll-base + intro + float + parallax ---- */
    let floatFactor = 1;         // 1 in hero, →~0.12 as the desk assembles
    const pointer = { tx: 0, ty: 0, x: 0, y: 0 };
    let t0 = performance.now();

    function render() {
      const t = (performance.now() - t0) / 1000;
      // ease pointer
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;

      for (let i = 0; i < PRODUCTS.length; i++) {
        const p = PRODUCTS[i];
        if (!p._visible) continue;
        const s = p._s, r = p._r;
        const depth = p.hero.z;
        // subtle idle float (sinusoidal, per-object phase)
        const amp = (2.4 + depth * 0.9) * floatFactor;
        const fx = Math.sin(t * 0.55 + depth) * amp;
        const fy = Math.cos(t * 0.42 + depth * 1.7) * amp;
        // depth parallax from pointer
        const pStr = (depth * 2.6 + 4) * floatFactor;
        const px = pointer.x * pStr;
        const py = pointer.y * pStr * 0.6;

        const x = s.x + fx + px;
        const y = s.y + fy + py + r.ry;
        p._el.style.opacity = r.o;
        p._el.style.transform =
          "translate3d(" + x.toFixed(2) + "px," + y.toFixed(2) + "px,0) rotate(" +
          s.rot.toFixed(2) + "deg) scale(" + (s.scale * r.rs).toFixed(3) + ")";
        p._el.style.setProperty("--contact", p._c.v.toFixed(3));
      }
    }
    gsap.ticker.add(render);

    /* ---- pointer parallax (desktop pointers only) ---- */
    if (window.matchMedia("(pointer:fine)").matches) {
      window.addEventListener("mousemove", (e) => {
        pointer.tx = (e.clientX / vw()) * 2 - 1;
        pointer.ty = (e.clientY / vh()) * 2 - 1;
      }, { passive: true });
    }

    /* ---- intro reveal (plays once, not scrubbed) ---- */
    const intro = gsap.timeline({ delay: 0.15 });
    gsap.set(".hero__title .line > span", { yPercent: 116 });
    intro
      .to(".hero__label", { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" })
      .to(".hero__title .line > span", { yPercent: 0, duration: 1.0, ease: "power4.out", stagger: 0.09 }, "-=0.45")
      .to(".hero__sub", { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
      .to(".hero__cta", { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
      .to(PRODUCTS.filter(p=>p._visible).map((p) => p._r), {
        o: 1, ry: 0, rs: 1, duration: 1.1, ease: "power3.out", stagger: 0.08
      }, "-=0.9");

    /* ---- the scrubbed master timeline ---- */
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: "#stage",
        start: "top top",
        end: () => "+=" + (isMobile() ? 420 : 560) + "%",
        pin: "#viewport",
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          floatFactor = clamp(1 - self.progress / 0.34, 0.12, 1);
        }
      }
    });

    // ACT 1→2 : hero copy lifts away, camera descends into the room
    tl.to(".hero__title .line > span", { yPercent: -120, ease: "power2.in" }, 0.02)
      .to([".hero__label", ".hero__sub", ".hero__cta"], { opacity: 0, y: -40, ease: "power2.in" }, 0.02)
      .to("#scrollHint", { opacity: 0, ease: "power1.in" }, 0.02)
      .to("#atmos", { opacity: 0, ease: "power1.inOut" }, 0.05)
      .to("#room", { opacity: 1, ease: "power2.inOut" }, 0.07)
      .to("#deskSurface", { opacity: 1, y: "0%", ease: "power2.out" }, 0.06)
      // gentle camera travel on the whole product layer
      .fromTo("#scene", { y: 0, scale: 1.02 }, { y: () => vh() * 0.06, scale: 1.0, ease: "power1.inOut" }, 0.05)
      // empty-desk caption in, then out
      .fromTo("#deskIntro", { opacity: 0, y: 24 }, { opacity: 1, y: 0, ease: "power2.out" }, 0.15)
      .to("#deskIntro", { opacity: 0, y: -24, ease: "power2.in" }, 0.30);

    // ACT 3 : products settle onto the desk, one after another
    const order = DESK_ORDER.filter((id) => byId[id] && byId[id]._visible);
    const seg = 0.52 / order.length;          // spread the landings over the middle
    order.forEach((id, i) => {
      const p = byId[id];
      const at = 0.30 + i * seg;
      tl.to(p._s, {
        x: () => pos(p, "desk").x,
        y: () => pos(p, "desk").y,
        rot: () => cfgFor(p, "desk").rot,
        scale: () => cfgFor(p, "desk").scale,
        duration: seg * 1.7,
        ease: "power3.inOut"
      }, at)
      .to(p._c, { v: 0.5, duration: seg * 1.7, ease: "power2.out" }, at);
    });
    // initialise scroll-base state to hero positions (function values re-resolve on refresh)
    order.concat(PRODUCTS.filter(p=>p._visible && order.indexOf(p.id)===-1).map(p=>p.id))
      .forEach((id) => {
        const p = byId[id];
        tl.set(p._s, {
          x: () => pos(p, "hero").x, y: () => pos(p, "hero").y,
          rot: () => cfgFor(p, "hero").rot, scale: () => cfgFor(p, "hero").scale
        }, 0);
      });

    // ACT 4 : the finished-desk message
    tl.fromTo("#deskFinal", { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "power3.out" }, 0.9)
      .to("#deskSurface", { filter: "brightness(1.04)", ease: "none" }, 0.88);

    // make products interactive once the desk is complete
    ST.create({
      trigger: "#stage",
      start: "top top",
      end: () => "+=" + (isMobile() ? 420 : 560) + "%",
      onUpdate: (self) => {
        const live = self.progress > 0.82;
        PRODUCTS.forEach((p) => p._el && p._el.classList.toggle("is-live", live));
      }
    });

    buildCats();
    bandReveals();
    navWatch();

    /* reposition on resize (function values re-resolve on refresh) */
    let rt;
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => { layoutProducts(); applyVisibility(); ST.refresh(); }, 160);
    }, { passive: true });

    // first paint of resting state
    ST.refresh();
  }

  /* ---------- boot ---------- */
  function boot() {
    buildProducts();
    const cinemaOK = !!(window.gsap && window.ScrollTrigger) && !reduceMQ.matches;
    if (cinemaOK) runCinema();
    else runStatic();
  }

  // GSAP is deferred; wait until scripts + DOM are ready
  if (document.readyState === "complete") boot();
  else window.addEventListener("load", boot);
})();
