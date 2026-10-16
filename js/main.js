/**
 * VoltEdge Luxury Furniture Store - Egyptian Market
 * Main Application Script: Rendering Furniture, Category Filtering, Animations & Interactivity
 */

let activeCategory = "all";

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  renderCategoryFilterTabs();
  renderProducts();
  initCartListeners();
  initIntersectionAnimations();
  initSmoothScroll();
  initGlobalKeyboardEvents();

  if (window.CartController) {
    window.CartController.updateBadge();
  }
});

/* =========================================================================
   1. NAVBAR & MOBILE MENU
   ========================================================================= */
function initNavbar() {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const mobileMenu = document.getElementById("mobileNavMenu");
  const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");

  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener("click", () => {
      const isExpanded = hamburgerBtn.getAttribute("aria-expanded") === "true";
      hamburgerBtn.setAttribute("aria-expanded", !isExpanded);
      hamburgerBtn.classList.toggle("open");
      mobileMenu.classList.toggle("open");
    });
  }

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      const cat = link.getAttribute("data-category");
      if (cat) {
        setCategoryFilter(cat);
      }
      if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.classList.remove("open");
        hamburgerBtn.setAttribute("aria-expanded", "false");
        mobileMenu.classList.remove("open");
      }
    });
  });
}

/* =========================================================================
   2. CATEGORY FILTER TABS
   ========================================================================= */
function renderCategoryFilterTabs() {
  const tabsContainer = document.getElementById("categoryFilterTabs");
  if (!tabsContainer || !window.FURNITURE_CATEGORIES) return;

  tabsContainer.innerHTML = window.FURNITURE_CATEGORIES.map(cat => {
    const isActive = cat.id === activeCategory;
    return `
      <button 
        type="button" 
        class="category-tab-btn ${isActive ? 'active' : ''}" 
        onclick="setCategoryFilter('${cat.id}')"
      >
        ${cat.name}
      </button>
    `;
  }).join("");
}

function setCategoryFilter(categoryId) {
  activeCategory = categoryId;
  renderCategoryFilterTabs();
  renderProducts();

  // Scroll to products if user was higher up
  const productsSection = document.getElementById("products");
  if (productsSection) {
    productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
window.setCategoryFilter = setCategoryFilter;

/* =========================================================================
   3. PRODUCT GRID RENDERING (FURNITURE)
   ========================================================================= */
function renderProducts() {
  const container = document.getElementById("productsGrid");
  if (!container || !window.PRODUCTS) return;

  const filtered = activeCategory === "all"
    ? window.PRODUCTS
    : window.PRODUCTS.filter(p => p.category === activeCategory);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 48px 24px; text-align: center; background: #FFFDF9; border-radius: 18px; border: 1px dashed rgba(154, 107, 60, 0.25);">
        <h4 style="font-size: 1.2rem; color: #6B4A2B; margin-bottom: 8px;">لا توجد قطع معروضة في هذا القسم حالياً</h4>
        <p style="color: #78716C; margin-bottom: 16px;">تواصل معنا عبر واتساب لطلب تفصيل أي تصميم مخصص تريده.</p>
        <button type="button" class="hero-cta-btn" onclick="setCategoryFilter('all')">عرض جميع قطع الأثاث</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((product, index) => {
    return `
      <article class="product-card reveal-card visible" data-index="${index}" id="product-${product.id}">
        <div class="product-image-wrapper">
          <img 
            src="${product.image}" 
            alt="${product.name}" 
            class="product-image" 
            loading="lazy"
          />
          <button 
            type="button" 
            class="add-to-cart-btn" 
            onclick="CartController.addItem('${product.id}')"
            aria-label="أضف ${product.name} إلى السلة"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span>أضف إلى السلة</span>
          </button>
        </div>

        <div class="product-info">
          <div class="product-rating">
            <span class="gold-star" aria-hidden="true">★</span>
            <span class="rating-num">${product.rating.toFixed(1)}</span>
            <span class="rating-reviews">(${product.reviewsCount} تقييم)</span>
          </div>

          <h3 class="product-title">${product.name}</h3>
          
          <p class="product-desc-snippet">${product.description}</p>

          <div class="product-price-row">
            <span class="product-price">${window.formatPrice(product.price)}</span>
            <span class="product-category-tag">${product.category}</span>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

/* =========================================================================
   4. CART & CHECKOUT EVENT LISTENERS
   ========================================================================= */
function initCartListeners() {
  const cartToggleBtns = document.querySelectorAll(".cart-toggle-btn");
  const cartCloseBtn = document.getElementById("cartDrawerClose");
  const cartOverlay = document.getElementById("cartOverlay");

  const checkoutBtn = document.getElementById("proceedToCheckoutBtn");
  const checkoutCloseBtn = document.getElementById("checkoutCloseBtn");
  const checkoutOverlay = document.getElementById("checkoutOverlay");
  const checkoutForm = document.getElementById("checkoutForm");

  const successCloseBtn = document.getElementById("orderSuccessCloseBtn");
  const successOverlay = document.getElementById("orderSuccessOverlay");
  const continueShoppingBtn = document.getElementById("successContinueShoppingBtn");

  cartToggleBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      window.openCartDrawer();
    });
  });

  if (cartCloseBtn) cartCloseBtn.addEventListener("click", window.closeCartDrawer);
  if (cartOverlay) cartOverlay.addEventListener("click", window.closeCartDrawer);

  if (checkoutBtn) checkoutBtn.addEventListener("click", window.CheckoutController.openCheckout);
  if (checkoutCloseBtn) checkoutCloseBtn.addEventListener("click", window.CheckoutController.closeCheckout);
  if (checkoutOverlay) checkoutOverlay.addEventListener("click", window.CheckoutController.closeCheckout);
  if (checkoutForm) checkoutForm.addEventListener("submit", window.CheckoutController.submitOrder);

  if (successCloseBtn) successCloseBtn.addEventListener("click", window.CheckoutController.closeSuccessModal);
  if (successOverlay) successOverlay.addEventListener("click", window.CheckoutController.closeSuccessModal);
  if (continueShoppingBtn) continueShoppingBtn.addEventListener("click", window.CheckoutController.closeSuccessModal);
}

/* =========================================================================
   5. INTERSECTION OBSERVER ANIMATIONS
   ========================================================================= */
function initIntersectionAnimations() {
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal-card, .fade-in-up").forEach(el => {
      el.classList.add("visible");
    });
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: "0px 0px -40px 0px",
    threshold: 0.15
  });

  document.querySelectorAll(".reveal-card, .fade-in-up").forEach(el => {
    observer.observe(el);
  });
}

/* =========================================================================
   6. SMOOTH SCROLLING
   ========================================================================= */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });
}

/* =========================================================================
   7. GLOBAL KEYBOARD ACCESSIBILITY (ESC TO CLOSE)
   ========================================================================= */
function initGlobalKeyboardEvents() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      window.closeCartDrawer();
      window.CheckoutController.closeCheckout();
      window.CheckoutController.closeSuccessModal();
      
      const hamburgerBtn = document.getElementById("hamburgerBtn");
      const mobileMenu = document.getElementById("mobileNavMenu");
      if (hamburgerBtn && mobileMenu && mobileMenu.classList.contains("open")) {
        hamburgerBtn.classList.remove("open");
        hamburgerBtn.setAttribute("aria-expanded", "false");
        mobileMenu.classList.remove("open");
      }
    }
  });
}
