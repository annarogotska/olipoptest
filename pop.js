(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const money = (n) => "$" + n.toFixed(2);
  const CDN = "https://drinkolipop.com/cdn/shop/files/";

  const PRICES = {
    1: { once: 3.00, sub: 2.55 },
    12: { once: 35.99, sub: 30.59 }
  };

  const FLAVORS = {
    "blackberry-vanilla": { name: "Blackberry Vanilla", file: "blackberry-vanilla-9g-olipop_gallery-image_single-can_new_asset.webp", desc: "Blackberry, crisp apple and a splash of mandarin — layered berry with a smooth vanilla finish.", bg: "#B1127C" },
    "vintage-cola": { name: "Vintage Cola", file: "vintage-cola-9g-olipop_gallery-image_single-can_new_asset.webp", desc: "Deep caramel and cola nut, dialled back — the straight swap for a daily cola habit.", bg: "#DD2C0B" },
    "cherry-cola": { name: "Cherry Cola", file: "cherry-cola-9g-olipop_gallery-main-image_new_asset.webp", desc: "Dark cherry over a cola base. Reads as a fountain drink, not a cough syrup.", bg: "#CA2217" },
    "classic-grape": { name: "Classic Grape", file: "classic-grape-9g-olipop_gallery-image_single-can_new_asset.webp", desc: "Concord grape, purple and nostalgic — converts people who say they hate diet soda.", bg: "#76238E" },
    "orange-cream": { name: "Orange Cream", file: "orange-cream-9g-olipop_gallery-image_single-can_new_asset.webp", desc: "Orange and vanilla, creamsicle territory. Sweet enough to drink like a dessert.", bg: "#E3790F" },
    "strawberry-vanilla": { name: "Strawberry Vanilla", file: "strawberry-vanilla-9g-olipop_gallery-main-image_new_asset.webp", desc: "Strawberry with a soft vanilla tail — the brand's most-reordered flavor.", bg: "#D9210D" },
    "lemon-lime": { name: "Lemon Lime", file: "lemon-lime-9g-olipop_gallery-image_single-can_new_asset.webp", desc: "Sharp citrus, no syrupy finish. The one to keep cold for a hot afternoon.", bg: "#00A53B" }
  };

  /* ---------- Hero: flavor-figurine carousel ---------- */
  (function initToonHero() {
    const section = $("hero");
    const carousel = $("toonCarousel");
    if (!section || !carousel) return;

    const order = ["blackberry-vanilla", "classic-grape", "orange-cream", "lemon-lime"];
    const items4 = order.map((key) => {
      const f = FLAVORS[key];
      const im = new Image();
      im.src = CDN + f.file + "?width=700";
      const div = document.createElement("div");
      div.className = "toon-hero__item";
      div.innerHTML = '<img src="' + CDN + f.file + '?width=700" alt="OLIPOP ' + f.name + ' can" draggable="false" />';
      carousel.appendChild(div);
      return div;
    });

    const ghost = $("toonGhost");
    const desc = $("toonDesc");
    const prevBtn = $("toonPrev");
    const nextBtn = $("toonNext");

    let activeIndex = 0;
    let isAnimating = false;

    function render() {
      const center = activeIndex;
      const left = (activeIndex + 3) % 4;
      const right = (activeIndex + 1) % 4;
      const back = (activeIndex + 2) % 4;

      items4.forEach((el) => el.removeAttribute("data-role"));
      items4[center].setAttribute("data-role", "center");
      items4[left].setAttribute("data-role", "left");
      items4[right].setAttribute("data-role", "right");
      items4[back].setAttribute("data-role", "back");

      const f = FLAVORS[order[activeIndex]];
      section.style.backgroundColor = f.bg;
      if (ghost) ghost.textContent = f.name.split(" ")[0];
      if (desc) desc.textContent = f.desc;
    }

    function navigate(dir) {
      if (isAnimating) return;
      isAnimating = true;
      activeIndex = dir === "next" ? (activeIndex + 1) % 4 : (activeIndex + 3) % 4;
      render();
      window.setTimeout(() => { isAnimating = false; }, 650);
    }

    if (prevBtn) prevBtn.addEventListener("click", () => navigate("prev"));
    if (nextBtn) nextBtn.addEventListener("click", () => navigate("next"));

    render();
  })();

  /* ---------- Count-up stats on scroll ---------- */
  (function initCountUp() {
    const nodes = document.querySelectorAll("[data-count-to]");
    if (!nodes.length) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const animate = (el) => {
      const target = Number(el.dataset.countTo);
      const suffix = el.dataset.suffix || "";
      if (reduceMotion) {
        el.textContent = target + suffix;
        return;
      }
      const duration = 1100;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    nodes.forEach((el) => io.observe(el));
  })();

  /* ---------- Buy box / cart ---------- */
  const packRow = $("packRow");
  const freqRow = $("freqRow");
  const qtyValue = $("qtyValue");
  const priceOnce = $("priceOnce");
  const priceSubBase = $("priceSubBase");
  const addToCartBtn = $("addToCartBtn");
  const cartTotal = $("cartTotal");
  const cartCount = document.querySelector(".p-cart-count");
  const cartBtn = $("cartBtn");
  const swatchRow = $("swatchRow");
  const buyTitle = $("buyTitle");
  const buyDesc = $("buyDesc");
  const miniCart = $("miniCart");
  const miniCartImg = $("miniCartImg");
  const miniCartName = $("miniCartName");
  const miniCartSub = $("miniCartSub");
  const miniCartPrice = $("miniCartPrice");
  const miniCartBtn = $("miniCartBtn");
  const ymalGrid = $("ymalGrid");
  const mixPicker = $("mixPicker");
  const mixTotalEl = $("mixTotal");
  const mixTotalWrap = document.querySelector(".p-mix__total");
  const buyStage = document.querySelector(".p-buy__stage");

  if (packRow && freqRow && qtyValue) {
    let pack = 12;
    let freq = "once";
    let qty = 1;
    let cartItems = 0;
    let flavor = "blackberry-vanilla";
    const mixCounts = {};

    if (swatchRow) {
      swatchRow.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-flavor]");
        if (!btn) return;
        flavor = btn.dataset.flavor;
        const f = FLAVORS[flavor];

        swatchRow.querySelectorAll("button").forEach((b) => {
          const on = b === btn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-checked", String(on));
        });

        if (buyTitle) buyTitle.textContent = f.name;
        if (buyDesc) buyDesc.textContent = f.desc;
        if (miniCartImg) miniCartImg.src = CDN + f.file + "?width=100";
        const buySection = $("buy");
        if (buySection) buySection.style.backgroundColor = f.bg;
        renderYmal();
        render();
      });
    }

    function renderYmal() {
      if (!ymalGrid) return;
      ymalGrid.innerHTML = "";
      const others = Object.keys(FLAVORS).filter((key) => key !== flavor).slice(0, 4);
      others.forEach((key) => {
        const f = FLAVORS[key];
        const card = document.createElement("div");
        card.className = "p-ymal-card";
        card.innerHTML =
          '<div class="p-ymal-card__stage"><img src="' + CDN + f.file + '?width=300" alt="OLIPOP ' + f.name + ' can" /></div>' +
          '<div class="p-ymal-card__body">' +
            '<span class="p-ymal-card__name">' + f.name + '</span>' +
            '<div class="p-ymal-card__foot"><span class="p-ymal-card__price">$35.99 / 12-pack</span><button type="button" class="p-ymal-card__add" data-flavor="' + key + '">Add</button></div>' +
          '</div>';
        ymalGrid.appendChild(card);
      });
    }

    if (ymalGrid) {
      ymalGrid.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-flavor]");
        if (!btn) return;
        const swatchBtn = swatchRow && swatchRow.querySelector('button[data-flavor="' + btn.dataset.flavor + '"]');
        if (swatchBtn) swatchBtn.click();
        $("buy").scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    function mixTotalCount() {
      return Object.keys(FLAVORS).reduce((sum, key) => sum + (mixCounts[key] || 0), 0);
    }

    function renderMix() {
      if (!mixPicker) return;
      const total = mixTotalCount();
      Object.keys(FLAVORS).forEach((key) => {
        const el = $("mixCount-" + key);
        if (el) el.textContent = String(mixCounts[key] || 0);
      });
      if (mixTotalEl) mixTotalEl.textContent = String(total);
      if (mixTotalWrap) mixTotalWrap.classList.toggle("is-complete", total === 12);
      const atMax = total >= 12;
      mixPicker.querySelectorAll(".p-mix-item__plus").forEach((b) => { b.disabled = atMax; });
    }

    function updateVisualMode() {
      const isMix = pack === "mix";
      if (swatchRow) swatchRow.hidden = isMix;
      if (buyStage) buyStage.hidden = isMix;
      if (mixPicker) mixPicker.hidden = !isMix;

      const buySection = $("buy");
      if (isMix) {
        if (buyTitle) buyTitle.textContent = "Build Your Mix";
        if (buyDesc) buyDesc.textContent = "Pick any combination of our 7 flavors — 12 cans total, one price.";
        if (buySection) buySection.style.backgroundColor = "#76238E";
      } else {
        const f = FLAVORS[flavor];
        if (buyTitle) buyTitle.textContent = f.name;
        if (buyDesc) buyDesc.textContent = f.desc;
        if (buySection) buySection.style.backgroundColor = f.bg;
      }
    }

    if (mixPicker) {
      mixPicker.addEventListener("click", (e) => {
        const plusBtn = e.target.closest(".p-mix-item__plus");
        const minusBtn = e.target.closest(".p-mix-item__minus");
        if (!plusBtn && !minusBtn) return;
        const key = (plusBtn || minusBtn).dataset.flavor;
        if (plusBtn) {
          if (mixTotalCount() >= 12) return;
          mixCounts[key] = (mixCounts[key] || 0) + 1;
        } else {
          mixCounts[key] = Math.max(0, (mixCounts[key] || 0) - 1);
        }
        renderMix();
        render();
      });
    }

    function render() {
      const isMix = pack === "mix";
      const p = PRICES[isMix ? 12 : pack];
      const f = FLAVORS[flavor];

      packRow.querySelectorAll("button").forEach((b) => {
        const on = b.dataset.pack === String(pack);
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-checked", String(on));
      });
      freqRow.querySelectorAll("button").forEach((b) => {
        const on = b.dataset.freq === freq;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-checked", String(on));
      });

      priceOnce.textContent = money(p.once);
      priceSubBase.textContent = money(p.once);
      qtyValue.textContent = String(qty);

      const unit = freq === "sub" ? p.sub : p.once;
      const total = unit * qty;
      cartTotal.textContent = money(total);

      const freqLabel = freq === "sub" ? "Subscribe" : "One Time";
      const packLabel = pack === 1 ? "1 Can" : isMix ? "Mix 12" : "12 Pack";
      if (miniCartName) miniCartName.textContent = isMix ? "Custom Mix" : f.name;
      if (miniCartSub) miniCartSub.textContent = packLabel + " · " + freqLabel + (qty > 1 ? " · ×" + qty : "");
      if (miniCartPrice) miniCartPrice.textContent = money(total);

      if (addToCartBtn) addToCartBtn.disabled = isMix && mixTotalCount() !== 12;
    }

    packRow.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-pack]");
      if (!btn) return;
      pack = btn.dataset.pack === "mix" ? "mix" : Number(btn.dataset.pack);
      updateVisualMode();
      render();
    });

    freqRow.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-freq]");
      if (!btn) return;
      freq = btn.dataset.freq;
      render();
    });

    $("qtyMinus").addEventListener("click", () => { qty = Math.max(1, qty - 1); render(); });
    $("qtyPlus").addEventListener("click", () => { qty = Math.min(99, qty + 1); render(); });

    function itemsLabel(n) { return n + " item" + (n === 1 ? "" : "s"); }

    function addToCart() {
      cartItems += qty;
      if (cartCount) cartCount.textContent = String(cartItems);
      if (cartBtn) cartBtn.setAttribute("aria-label", "Cart, " + itemsLabel(cartItems));
    }

    const cartLabel = $("cartLabel");
    if (addToCartBtn && cartLabel && cartTotal) {
      addToCartBtn.addEventListener("click", () => {
        addToCart();
        cartLabel.textContent = "Added ✓";
        cartTotal.style.display = "none";
        window.setTimeout(() => {
          cartLabel.textContent = "Add to Cart — ";
          cartTotal.style.display = "";
        }, 1200);
      });
    }

    if (miniCartBtn) {
      miniCartBtn.addEventListener("click", () => {
        addToCart();
        const label = miniCartBtn.textContent;
        miniCartBtn.textContent = "Added ✓";
        window.setTimeout(() => { miniCartBtn.textContent = label; }, 1200);
      });
    }

    renderYmal();
    renderMix();
    render();
  }

  /* ---------- Sticky mini-cart visibility ---------- */
  const footerEl = document.querySelector(".p-footer");
  if (miniCart) {
    let raf = 0;
    const tick = () => {
      raf = 0;
      const pastHero = window.scrollY > window.innerHeight * 0.85;
      const footerInView = footerEl && footerEl.getBoundingClientRect().top < window.innerHeight;
      miniCart.classList.toggle("is-visible", pastHero && !footerInView);
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
  }

  /* ---------- Ingredient orbit: continuous 3D carousel ---------- */
  (function initIngredientOrbit() {
    const orbit = document.querySelector(".p-ingr-orbit");
    const stage = $("ingrStage");
    if (!orbit || !stage) return;
    const cards = stage.querySelectorAll(".p-ingr-card");
    if (!cards.length) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const n = cards.length;
    // Parameters mirror the reference InfiniteSpiral component
    const radius = 170;
    const verticalSpacing = 60;
    const centerScale = 1.2;
    const edgeBlur = 6;
    const edgeFade = 0.3;
    const orbitSpeed = 22; // degrees per second (~ speed prop)
    const riseSpeed = 46; // px per second, direction="up"

    const vSpan = n * verticalSpacing;
    const vMargin = 70;
    let angle = 0;
    let paused = false;
    let last = performance.now();
    const yOffsets = Array.from({ length: n }, (_, i) => (i / n) * vSpan - vSpan / 2);

    orbit.addEventListener("mouseenter", () => { paused = true; });
    orbit.addEventListener("mouseleave", () => { paused = false; });

    function layout() {
      cards.forEach((card, i) => {
        const a = angle + (360 / n) * i;
        const rad = (a * Math.PI) / 180;
        const z = Math.cos(rad) * radius;
        const x = Math.sin(rad) * radius;
        const y = yOffsets[i];
        const depth = (z + radius) / (2 * radius); // 0 = farthest back, 1 = closest front
        const scale = 0.7 + (centerScale - 0.7) * depth;
        const edgeDist = Math.abs(y) - vSpan / 2;
        const vFade = edgeDist > 0 ? Math.max(0, 1 - edgeDist / vMargin) : 1;
        const opacity = (edgeFade + (1 - edgeFade) * depth) * vFade;
        const blur = (1 - depth) * edgeBlur;
        card.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px," + z.toFixed(1) + "px) scale(" + scale.toFixed(3) + ")";
        card.style.opacity = opacity.toFixed(2);
        card.style.filter = "blur(" + blur.toFixed(1) + "px)";
        card.style.zIndex = String(Math.round(z));
      });
    }

    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!paused) {
        angle += orbitSpeed * dt;
        const wrapAt = vSpan / 2 + vMargin;
        for (let i = 0; i < n; i++) {
          yOffsets[i] -= riseSpeed * dt;
          if (yOffsets[i] < -wrapAt) yOffsets[i] += vSpan + vMargin * 2;
        }
      }
      layout();
      requestAnimationFrame(tick);
    }

    layout();
    requestAnimationFrame(tick);
  })();

  /* ---------- Newsletter signup ---------- */
  (function initSignup() {
    const form = $("signupForm");
    const msg = $("signupMsg");
    if (!form || !msg) return;
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.elements.namedItem("email");
      const value = (input.value || "").trim();

      if (!emailRe.test(value)) {
        msg.textContent = "Enter a valid email address.";
        msg.classList.add("is-error");
        input.focus();
        return;
      }
      msg.classList.remove("is-error");
      msg.textContent = "You're in — code WELCOME15 is on its way.";
      form.reset();
    });
  })();
})();
