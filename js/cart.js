/**
 * VoltEdge Luxury Furniture & Decor - Egyptian Market
 * Shopping Cart, Checkout, Egyptian Payment & WhatsApp Ordering Engine
 */

/* =========================================================================
   STORE CONFIGURATION (EGYPT)
   Replace these placeholder values with your real store credentials:
   - WHATSAPP_NUMBER: Egyptian mobile starting with 20 (e.g. 201012345678)
   - VODAFONE_CASH_NUMBER: Your Vodafone Cash wallet (e.g. 01012345678)
   - INSTAPAY_ADDRESS: Your registered InstaPay username/address
   - SHIPPING_FEES: Delivery rates per region
   ========================================================================= */
const STORE_CONFIG = {
  // Store owner's WhatsApp number for order dispatch (Format: 201XXXXXXXXX)
  WHATSAPP_NUMBER: "201012345678",

  // Store's Vodafone Cash wallet number
  VODAFONE_CASH_NUMBER: "01012345678",

  // Store's InstaPay address or IPA handle
  INSTAPAY_ADDRESS: "voltedge@instapay",

  // Delivery fees by Egyptian governorate in Egyptian Pounds
  SHIPPING_FEES: {
    CAIRO_GIZA: 50,         // القاهرة والجيزة: 50 ج.م
    OTHER_GOVERNORATES: 80   // باقي محافظات مصر: 80 ج.م
  },

  // Free shipping threshold
  FREE_SHIPPING_THRESHOLD: 25000
};

// Egyptian Governorates List (27 Governorates)
const EGYPTIAN_GOVERNORATES = [
  { id: "cairo", name: "القاهرة", zone: "cairo_giza" },
  { id: "giza", name: "الجيزة", zone: "cairo_giza" },
  { id: "alexandria", name: "الإسكندرية", zone: "other" },
  { id: "qalyubia", name: "القليوبية", zone: "other" },
  { id: "sharqia", name: "الشرقية", zone: "other" },
  { id: "dakahlia", name: "الدقهلية", zone: "other" },
  { id: "gharbia", name: "الغربية", zone: "other" },
  { id: "monufia", name: "المنوفية", zone: "other" },
  { id: "beheira", name: "البحيرة", zone: "other" },
  { id: "kafr_el_sheikh", name: "كفر الشيخ", zone: "other" },
  { id: "damietta", name: "دمياط", zone: "other" },
  { id: "port_said", name: "بورسعيد", zone: "other" },
  { id: "ismailia", name: "الإسماعيلية", zone: "other" },
  { id: "suez", name: "السويس", zone: "other" },
  { id: "fayoum", name: "الفيوم", zone: "other" },
  { id: "beni_suef", name: "بني سويف", zone: "other" },
  { id: "minya", name: "المنيا", zone: "other" },
  { id: "asyut", name: "أسيوط", zone: "other" },
  { id: "sohag", name: "سوهاج", zone: "other" },
  { id: "qena", name: "قنا", zone: "other" },
  { id: "luxor", name: "الأقصر", zone: "other" },
  { id: "aswan", name: "أسوان", zone: "other" },
  { id: "red_sea", name: "البحر الأحمر", zone: "other" },
  { id: "south_sinai", name: "جنوب سيناء", zone: "other" },
  { id: "north_sinai", name: "شمال سيناء", zone: "other" },
  { id: "matrouh", name: "مطروح", zone: "other" },
  { id: "new_valley", name: "الوادي الجديد", zone: "other" }
];

/* =========================================================================
   CART CONTROLLER & STATE
   ========================================================================= */
const CartController = (function() {
  const STORAGE_KEY = "voltedge_cart_items_v1";

  // Load items from localStorage
  function getItems() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn("Could not read cart from localStorage", e);
      return [];
    }
  }

  // Save items to localStorage
  function saveItems(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Could not write cart to localStorage", e);
    }
    updateBadge();
    renderDrawerItems();
  }

  // Calculate items count
  function getTotalCount() {
    const items = getItems();
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }

  // Calculate subtotal price
  function getSubtotal() {
    const items = getItems();
    return items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  // Add product to cart
  function addItem(productId, quantity = 1) {
    const product = window.PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const items = getItems();
    const existingIndex = items.findIndex(item => item.id === productId);

    if (existingIndex > -1) {
      items[existingIndex].quantity += quantity;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity: quantity
      });
    }

    saveItems(items);
    showToast(`تمت إضافة "${product.name}" إلى السلة`);
  }

  // Remove product from cart
  function removeItem(productId) {
    let items = getItems();
    const itemToRemove = items.find(i => i.id === productId);
    items = items.filter(item => item.id !== productId);
    saveItems(items);
    if (itemToRemove) {
      showToast(`تم حذف "${itemToRemove.name}" من السلة`);
    }
  }

  // Update item quantity (+1 or -1)
  function updateItemQuantity(productId, delta) {
    const items = getItems();
    const item = items.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      removeItem(productId);
    } else {
      saveItems(items);
    }
  }

  // Clear all items
  function clearCart() {
    saveItems([]);
  }

  // Update badge counter in header
  function updateBadge() {
    const count = getTotalCount();
    const badges = document.querySelectorAll(".cart-badge-count");
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? "inline-flex" : "none";
    });
  }

  // Render items inside the slide-in drawer
  function renderDrawerItems() {
    const container = document.getElementById("cartDrawerItems");
    const subtotalEl = document.getElementById("cartDrawerSubtotal");
    const emptyState = document.getElementById("cartDrawerEmpty");
    const footerArea = document.getElementById("cartDrawerFooter");

    if (!container) return;

    const items = getItems();
    const subtotal = getSubtotal();

    if (subtotalEl) {
      subtotalEl.textContent = window.formatPrice(subtotal);
    }

    if (items.length === 0) {
      if (emptyState) emptyState.style.display = "flex";
      if (container) container.innerHTML = "";
      if (footerArea) footerArea.style.display = "none";
      return;
    }

    if (emptyState) emptyState.style.display = "none";
    if (footerArea) footerArea.style.display = "block";

    container.innerHTML = items.map(item => `
      <div class="cart-item-row" data-id="${item.id}">
        <div class="cart-item-thumb">
          <img src="${item.image}" alt="${item.name}" loading="lazy" />
        </div>
        <div class="cart-item-details">
          <div class="cart-item-category">${item.category}</div>
          <h4 class="cart-item-title">${item.name}</h4>
          <div class="cart-item-price">${window.formatPrice(item.price)}</div>
          
          <div class="cart-item-actions">
            <div class="qty-stepper">
              <button type="button" class="qty-btn" onclick="CartController.updateItemQuantity('${item.id}', -1)" aria-label="تقليل الكمية">−</button>
              <span class="qty-number">${item.quantity}</span>
              <button type="button" class="qty-btn" onclick="CartController.updateItemQuantity('${item.id}', 1)" aria-label="زيادة الكمية">+</button>
            </div>
            
            <button type="button" class="cart-item-remove-btn" onclick="CartController.removeItem('${item.id}')" aria-label="حذف المنتج">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>حذف</span>
            </button>
          </div>
        </div>
      </div>
    `).join("");
  }

  return {
    getItems,
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart,
    getTotalCount,
    getSubtotal,
    updateBadge,
    renderDrawerItems
  };
})();

/* =========================================================================
   UI HELPERS: TOAST NOTIFICATION
   ========================================================================= */
let toastTimeout = null;
function showToast(message) {
  let toast = document.getElementById("voltedgeToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "voltedgeToast";
    toast.className = "voltedge-toast";
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <div class="toast-content">
      <svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9A6B3C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>${message}</span>
    </div>
  `;

  toast.classList.add("show");

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

/* =========================================================================
   DRAWER CONTROLLER (CART & OVERLAYS)
   ========================================================================= */
function openCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");
  CartController.renderDrawerItems();
  if (drawer && overlay) {
    drawer.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");
  if (drawer && overlay) {
    drawer.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }
}

/* =========================================================================
   CHECKOUT CONTROLLER
   ========================================================================= */
const CheckoutController = (function() {
  let selectedGov = "cairo";
  let selectedPayment = "cod";

  function openCheckout() {
    const items = CartController.getItems();
    if (items.length === 0) {
      showToast("سلتك فارغة! أضف منتجات قبل إتمام الطلب");
      return;
    }

    closeCartDrawer();
    const modal = document.getElementById("checkoutModal");
    const overlay = document.getElementById("checkoutOverlay");
    if (!modal) return;

    populateGovernorates();
    updateCheckoutSummary();
    setupPaymentEventListeners();

    modal.classList.add("active");
    if (overlay) overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeCheckout() {
    const modal = document.getElementById("checkoutModal");
    const overlay = document.getElementById("checkoutOverlay");
    if (modal) modal.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  function populateGovernorates() {
    const select = document.getElementById("checkoutGovSelect");
    if (!select || select.children.length > 0) return;

    EGYPTIAN_GOVERNORATES.forEach(gov => {
      const opt = document.createElement("option");
      opt.value = gov.id;
      opt.textContent = gov.name;
      if (gov.id === "cairo") opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener("change", (e) => {
      selectedGov = e.target.value;
      updateCheckoutSummary();
    });
  }

  function getShippingFee(govId) {
    const gov = EGYPTIAN_GOVERNORATES.find(g => g.id === govId);
    if (!gov) return STORE_CONFIG.SHIPPING_FEES.OTHER_GOVERNORATES;
    return gov.zone === "cairo_giza"
      ? STORE_CONFIG.SHIPPING_FEES.CAIRO_GIZA
      : STORE_CONFIG.SHIPPING_FEES.OTHER_GOVERNORATES;
  }

  function updateCheckoutSummary() {
    const subtotal = CartController.getSubtotal();
    const shipping = getShippingFee(selectedGov);
    const total = subtotal + shipping;

    const subtotalEl = document.getElementById("checkoutSubtotal");
    const shippingEl = document.getElementById("checkoutShipping");
    const totalEl = document.getElementById("checkoutTotal");
    const itemsCountEl = document.getElementById("checkoutItemsCount");

    if (subtotalEl) subtotalEl.textContent = window.formatPrice(subtotal);
    if (shippingEl) shippingEl.textContent = window.formatPrice(shipping);
    if (totalEl) totalEl.textContent = window.formatPrice(total);
    if (itemsCountEl) itemsCountEl.textContent = `${CartController.getTotalCount()} قطع`;
  }

  function setupPaymentEventListeners() {
    const paymentRadios = document.querySelectorAll('input[name="payment_method"]');
    const vfCard = document.getElementById("vodafoneCashDetails");
    const instaCard = document.getElementById("instapayDetails");

    paymentRadios.forEach(radio => {
      radio.addEventListener("change", (e) => {
        selectedPayment = e.target.value;
        if (vfCard) vfCard.style.display = selectedPayment === "vodafone_cash" ? "block" : "none";
        if (instaCard) instaCard.style.display = selectedPayment === "instapay" ? "block" : "none";
      });
    });
  }

  // Validate Egyptian mobile number format
  function validateEgyptianPhone(phone) {
    const clean = phone.replace(/\s+/g, "").trim();
    // Egyptian mobile starts with 010, 011, 012, or 015 and is exactly 11 digits
    const egRegex = /^01[0125][0-9]{8}$/;
    return egRegex.test(clean);
  }

  // Process and Submit Order
  function submitOrder(e) {
    if (e) e.preventDefault();

    const fullNameInput = document.getElementById("checkoutName");
    const phoneInput = document.getElementById("checkoutPhone");
    const addressInput = document.getElementById("checkoutAddress");
    const notesInput = document.getElementById("checkoutNotes");
    const errorEl = document.getElementById("checkoutErrorMessage");

    const fullName = fullNameInput ? fullNameInput.value.trim() : "";
    const phone = phoneInput ? phoneInput.value.trim() : "";
    const address = addressInput ? addressInput.value.trim() : "";
    const notes = notesInput ? notesInput.value.trim() : "";

    // Clear previous error
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.style.display = "none";
    }

    // Validation
    if (!fullName || fullName.length < 3) {
      showError("يرجى إدخال الاسم بالكامل بشكل صحيح");
      if (fullNameInput) fullNameInput.focus();
      return;
    }

    if (!validateEgyptianPhone(phone)) {
      showError("يرجى إدخال رقم موبايل مصري صحيح مكون من 11 رقماً يبدأ بـ (010, 011, 012, 015)");
      if (phoneInput) phoneInput.focus();
      return;
    }

    if (!address || address.length < 8) {
      showError("يرجى إدخال العنوان التفصيلي (المنطقة، الشارع، رقم العمارة)");
      if (addressInput) addressInput.focus();
      return;
    }

    const items = CartController.getItems();
    if (items.length === 0) {
      showError("سلة المشتريات فارغة!");
      return;
    }

    // Generate Order ID
    const orderId = "VE-" + Math.floor(10000 + Math.random() * 90000);
    const govObj = EGYPTIAN_GOVERNORATES.find(g => g.id === selectedGov) || { name: "القاهرة" };
    const shipping = getShippingFee(selectedGov);
    const subtotal = CartController.getSubtotal();
    const grandTotal = subtotal + shipping;

    const paymentLabels = {
      cod: "الدفع عند الاستلام (COD)",
      vodafone_cash: "فودافون كاش (محفظة رقم: " + STORE_CONFIG.VODAFONE_CASH_NUMBER + ")",
      instapay: "انستا باي (حساب: " + STORE_CONFIG.INSTAPAY_ADDRESS + ")"
    };
    const paymentLabel = paymentLabels[selectedPayment] || "الدفع عند الاستلام";

    // Format WhatsApp message
    let message = `*طلب جديد من متجر VoltEdge الفاخر*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📦 *رقم الطلب:* #${orderId}\n`;
    message += `👤 *العميل:* ${fullName}\n`;
    message += `📱 *رقم الموبايل:* ${phone}\n`;
    message += `📍 *المحافظة:* ${govObj.name}\n`;
    message += `🏠 *العنوان:* ${address}\n`;
    if (notes) message += `📝 *ملاحظات:* ${notes}\n`;
    message += `💳 *طريقة الدفع:* ${paymentLabel}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*المنتجات المطلوبة:*\n`;

    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name} (${item.quantity}×) — ${window.formatPrice(item.price * item.quantity)}\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💰 *المجموع الفرعي:* ${window.formatPrice(subtotal)}\n`;
    message += `🚚 *مصاريف الشحن:* ${window.formatPrice(shipping)}\n`;
    message += `✨ *الإجمالي النهائي:* ${window.formatPrice(grandTotal)}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `تم إنشاء الطلب عبر موقع VoltEdge الإلكتروني.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${STORE_CONFIG.WHATSAPP_NUMBER}?text=${encodedMessage}`;

    // Show Success Modal
    showSuccessModal({
      orderId,
      fullName,
      phone,
      govName: govObj.name,
      address,
      paymentLabel,
      grandTotal,
      whatsappUrl
    });

    // Clear cart after order is locked in
    CartController.clearCart();

    // Trigger WhatsApp link
    window.open(whatsappUrl, "_blank");
  }

  function showError(msg) {
    const errorEl = document.getElementById("checkoutErrorMessage");
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = "block";
    } else {
      showToast(msg);
    }
  }

  function showSuccessModal(orderData) {
    closeCheckout();
    const successModal = document.getElementById("orderSuccessModal");
    const successOverlay = document.getElementById("orderSuccessOverlay");

    if (successModal) {
      document.getElementById("successOrderId").textContent = `#${orderData.orderId}`;
      document.getElementById("successCustomer").textContent = `${orderData.fullName} (${orderData.phone})`;
      document.getElementById("successAddress").textContent = `${orderData.govName} - ${orderData.address}`;
      document.getElementById("successPayment").textContent = orderData.paymentLabel;
      document.getElementById("successTotal").textContent = window.formatPrice(orderData.grandTotal);
      
      const waBtn = document.getElementById("successWhatsAppBtn");
      if (waBtn) {
        waBtn.href = orderData.whatsappUrl;
      }

      successModal.classList.add("active");
      if (successOverlay) successOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }

  function closeSuccessModal() {
    const successModal = document.getElementById("orderSuccessModal");
    const successOverlay = document.getElementById("orderSuccessOverlay");
    if (successModal) successModal.classList.remove("active");
    if (successOverlay) successOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  return {
    openCheckout,
    closeCheckout,
    submitOrder,
    closeSuccessModal
  };
})();

// Helper to copy text to clipboard with feedback
function copyToClipboard(text, btnElement) {
  navigator.clipboard.writeText(text).then(() => {
    const origText = btnElement.innerHTML;
    btnElement.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>تم النسخ!</span>
    `;
    setTimeout(() => {
      btnElement.innerHTML = origText;
    }, 2000);
  }).catch(() => {
    showToast("يمكنك تحديد الرقم ونسخه يدوياً");
  });
}

// Global exposure
window.STORE_CONFIG = STORE_CONFIG;
window.CartController = CartController;
window.CheckoutController = CheckoutController;
window.openCartDrawer = openCartDrawer;
window.closeCartDrawer = closeCartDrawer;
window.showToast = showToast;
window.copyToClipboard = copyToClipboard;
