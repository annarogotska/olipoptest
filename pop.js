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

  if (packRow && freqRow && qtyValue) {
    let pack = 12;
    let freq = "once";
    let qty = 1;
    let cartItems = 0;
    let flavor = "blackberry-vanilla";

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

    function render() {
      const p = PRICES[pack];
      const f = FLAVORS[flavor];

      packRow.querySelectorAll("button").forEach((b) => {
        const on = Number(b.dataset.pack) === pack;
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
      if (miniCartName) miniCartName.textContent = f.name;
      if (miniCartSub) miniCartSub.textContent = (pack === 1 ? "1 Can" : "12 Pack") + " · " + freqLabel + (qty > 1 ? " · ×" + qty : "");
      if (miniCartPrice) miniCartPrice.textContent = money(total);
    }

    packRow.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-pack]");
      if (!btn) return;
      pack = Number(btn.dataset.pack);
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
