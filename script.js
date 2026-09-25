/* =========================================================
   MYNTRA CLONE — SCRIPT (Frontend + Local Backend Simulation)
   ========================================================= */

(function () {
  "use strict";

  /* =====================================================
     LOCAL "DATABASE" — localStorage based
  ===================================================== */
  const DB = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch {}
    }
  };

  const KEYS = {
    WISHLIST: "myntra_wishlist",
    BAG: "myntra_bag",
    USER: "myntra_user"
  };

  let wishlist = DB.get(KEYS.WISHLIST, []);
  let bag = DB.get(KEYS.BAG, []);

  /* =====================================================
     LOADER
  ===================================================== */
  window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if (loader) setTimeout(() => loader.classList.add("hidden"), 500);
  });

  /* =====================================================
     TOAST
  ===================================================== */
  const toastEl = document.getElementById("toast");
  let toastTimer = null;

  function showToast(message, icon = "fa-circle-check") {
    if (!toastEl) return;
    toastEl.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  /* =====================================================
     HEADER SCROLL
  ===================================================== */
  const header = document.getElementById("header");
  const backToTop = document.getElementById("backToTop");

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("scrolled", y > 40);
    if (backToTop) backToTop.classList.toggle("show", y > 500);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* =====================================================
     MOBILE NAV
  ===================================================== */
  const hamburger = document.getElementById("hamburgerBtn");
  const menu = document.getElementById("mainMenu");
  const backdrop = document.getElementById("navBackdrop");

  function closeMenu() {
    hamburger?.classList.remove("active");
    menu?.classList.remove("open");
    backdrop?.classList.remove("open");
  }

  if (hamburger && menu) {
    hamburger.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("open");
      hamburger.classList.toggle("active", isOpen);
      backdrop?.classList.toggle("open", isOpen);
    });
  }
  backdrop?.addEventListener("click", closeMenu);
  document.querySelectorAll(".menu a").forEach(a =>
    a.addEventListener("click", closeMenu)
  );

  /* =====================================================
     SEARCH + SUGGESTIONS
  ===================================================== */
  const searchInput = document.getElementById("searchInput");
  const searchSuggest = document.getElementById("searchSuggest");
  const searchForm = document.getElementById("searchForm");

  const popularSearches = Array.from(
    document.querySelectorAll(".popular-searches a")
  ).map(a => a.textContent.trim());

  const navLinks = Array.from(
    document.querySelectorAll(".menu a")
  ).map(a => a.textContent.trim());

  const searchIndex = Array.from(
    new Set([...navLinks, ...popularSearches])
  ).filter(Boolean);

  function renderSuggestions(query) {
    if (!searchSuggest) return;
    const q = query.trim().toLowerCase();

    if (!q) {
      searchSuggest.classList.remove("open");
      searchSuggest.innerHTML = "";
      return;
    }

    const matches = searchIndex
      .filter(item => item.toLowerCase().includes(q))
      .slice(0, 6);

    if (!matches.length) {
      searchSuggest.classList.remove("open");
      searchSuggest.innerHTML = "";
      return;
    }

    searchSuggest.innerHTML = matches
      .map(m =>
        `<button type="button" data-term="${m}">
          <i class="fa-solid fa-magnifying-glass" style="margin-right:10px;color:#94969f;"></i>${m}
        </button>`
      )
      .join("");
    searchSuggest.classList.add("open");
  }

  if (searchInput) {
    searchInput.addEventListener("input", e => renderSuggestions(e.target.value));
    searchInput.addEventListener("focus", e => renderSuggestions(e.target.value));

    document.addEventListener("click", e => {
      if (
        searchSuggest &&
        !searchSuggest.contains(e.target) &&
        e.target !== searchInput
      ) {
        searchSuggest.classList.remove("open");
      }
    });

    searchSuggest?.addEventListener("click", e => {
      const btn = e.target.closest("button[data-term]");
      if (!btn) return;
      searchInput.value = btn.dataset.term;
      searchSuggest.classList.remove("open");
      doSearch(btn.dataset.term);
    });
  }

  function doSearch(term) {
    if (!term) return;
    showToast(`Showing results for "${term}"`, "fa-magnifying-glass");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  searchForm?.addEventListener("submit", e => {
    e.preventDefault();
    doSearch(searchInput.value.trim());
  });

  /* =====================================================
     WISHLIST + BAG
  ===================================================== */
  const wishlistCountEl = document.getElementById("wishlistCount");
  const bagCountEl = document.getElementById("bagCount");
  const wishlistDrawer = document.getElementById("wishlistDrawer");
  const wishlistDrawerBody = document.getElementById("wishlistDrawerBody");
  const wishlistTrigger = document.getElementById("wishlistTrigger");
  const bagTrigger = document.getElementById("bagTrigger");
  const closeWishlistBtn = document.getElementById("closeWishlist");

  function updateWishlistBadge() {
    if (!wishlistCountEl) return;
    wishlistCountEl.textContent = wishlist.length;
    wishlistCountEl.classList.toggle("show", wishlist.length > 0);
  }

  function updateBagBadge() {
    if (!bagCountEl) return;
    bagCountEl.textContent = bag.length;
    bagCountEl.classList.toggle("show", bag.length > 0);
  }

  function bump(el) {
    if (!el) return;
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
  }

  function renderWishlistDrawer() {
    if (!wishlistDrawerBody) return;
    if (!wishlist.length) {
      wishlistDrawerBody.innerHTML = `<p class="drawer-empty">Your wishlist is empty.<br>Tap the heart on any item to save it here.</p>`;
      return;
    }
    wishlistDrawerBody.innerHTML = wishlist
      .map(item => `
        <div class="drawer-item" data-id="${item.id}">
          <img src="${item.img}" alt="wishlist item" />
          <span>Saved Item</span>
          <button class="drawer-remove" data-id="${item.id}" aria-label="Remove">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>`)
      .join("");
  }

  function toggleWishlistItem(id, img, btnEl) {
    const idx = wishlist.findIndex(w => w.id === id);
    const isActive = idx === -1;

    if (isActive) {
      wishlist.push({ id, img });
      showToast("Added to wishlist", "fa-heart");
    } else {
      wishlist.splice(idx, 1);
      showToast("Removed from wishlist", "fa-heart-crack");
    }

    DB.set(KEYS.WISHLIST, wishlist);
    updateWishlistBadge();
    bump(wishlistCountEl);
    renderWishlistDrawer();

    document.querySelectorAll(`.wish-btn[data-id="${CSS.escape(id)}"]`).forEach(b => {
      b.classList.toggle("active", isActive);
      const icon = b.querySelector("i");
      if (icon) icon.className = isActive ? "fa-solid fa-heart" : "fa-regular fa-heart";
    });

    if (btnEl) {
      btnEl.classList.add("pulse");
      setTimeout(() => btnEl.classList.remove("pulse"), 400);
    }
  }

  document.addEventListener("click", e => {
    const wishBtn = e.target.closest(".wish-btn");
    if (wishBtn) {
      const tile = wishBtn.closest(".product-tile-inner") || wishBtn.closest(".branditems");
      const img = tile ? tile.querySelector("img") : null;
      toggleWishlistItem(wishBtn.dataset.id, img ? img.src : "", wishBtn);
      return;
    }

    const removeBtn = e.target.closest(".drawer-remove");
    if (removeBtn) {
      const id = removeBtn.dataset.id;
      const tileBtn = document.querySelector(`.wish-btn[data-id="${CSS.escape(id)}"]`);
      toggleWishlistItem(id, "", tileBtn);
      return;
    }

    const tileInner = e.target.closest(".branditems");
    if (tileInner && !e.target.closest(".wish-btn")) {
      const img = tileInner.querySelector("img");
      const product = {
        id: "p_" + Date.now(),
        img: img ? img.src : ""
      };
      bag.push(product);
      DB.set(KEYS.BAG, bag);
      updateBagBadge();
      bump(bagCountEl);
      showToast("Added to bag", "fa-bag-shopping");
    }
  });

  // Restore wishlist heart state on load
  wishlist.forEach(item => {
    document.querySelectorAll(`.wish-btn[data-id="${CSS.escape(item.id)}"]`).forEach(b => {
      b.classList.add("active");
      const icon = b.querySelector("i");
      if (icon) icon.className = "fa-solid fa-heart";
    });
  });

  updateWishlistBadge();
  updateBagBadge();
  renderWishlistDrawer();

  if (wishlistTrigger && wishlistDrawer) {
    wishlistTrigger.addEventListener("click", () => wishlistDrawer.classList.add("open"));
  }
  if (closeWishlistBtn && wishlistDrawer) {
    closeWishlistBtn.addEventListener("click", () => wishlistDrawer.classList.remove("open"));
  }
  if (bagTrigger) {
    bagTrigger.addEventListener("click", () => {
      showToast(
        bag.length ? `You have ${bag.length} item(s) in your bag` : "Your bag is empty",
        "fa-bag-shopping"
      );
    });
  }

  /* =====================================================
     SWIPERS
  ===================================================== */
  function initSwipers() {
    if (typeof Swiper === "undefined") return;

    const heroEl = document.querySelector(".hero-swiper");
    if (heroEl) {
      new Swiper(heroEl, {
        loop: true,
        autoplay: { delay: 4200, disableOnInteraction: false },
        pagination: { el: ".hero-swiper .swiper-pagination", clickable: true },
        navigation: {
          nextEl: ".hero-swiper .swiper-button-next",
          prevEl: ".hero-swiper .swiper-button-prev"
        },
        speed: 700,
        effect: "slide"
      });
    }

    document.querySelectorAll(".brand-swiper").forEach(el => {
      new Swiper(el, {
        slidesPerView: "auto",
        spaceBetween: 16,
        navigation: {
          nextEl: el.querySelector(".swiper-button-next"),
          prevEl: el.querySelector(".swiper-button-prev")
        },
        freeMode: true,
        grabCursor: true,
        mousewheel: { forceToAxis: true }
      });
    });
  }

  /* =====================================================
     SCROLL REVEAL
  ===================================================== */
  function initReveal() {
    const targets = document.querySelectorAll(
      ".brandsection, .brand-swiper, .banner, .category-grid, .offerdelas, .sbc"
    );
    targets.forEach(t => t.classList.add("reveal"));

    if (!("IntersectionObserver" in window)) {
      targets.forEach(t => t.classList.add("in-view"));
      return;
    }

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    targets.forEach(t => io.observe(t));
  }

  /* =====================================================
     INIT
  ===================================================== */
  document.addEventListener("DOMContentLoaded", () => {
    initSwipers();
    initReveal();
  });
})();