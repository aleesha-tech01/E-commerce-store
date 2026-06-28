/* ============================================================
   cart.js — Add, remove, quantity, subtotal, checkout, persistence
   ============================================================ */

const CART_KEY = 'luxe-cart';

/* ── Cart State ── */
let cart = [];

/* ── Persistence ── */

/** Load cart from localStorage and restore state. */
const loadCart = () => {
  try {
    const stored = localStorage.getItem(CART_KEY);
    cart = stored ? JSON.parse(stored) : [];
  } catch {
    cart = [];
  }
};

/** Persist current cart to localStorage. */
const saveCart = () => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

/* ── Cart Operations ── */

/**
 * Add a product to the cart.
 * If already present, increment quantity by the given amount.
 * @param {Object} product   Product object from API
 * @param {number} qty       Quantity to add (default 1)
 */
const addToCart = (product, qty = 1) => {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id:    product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      qty,
    });
  }
  saveCart();
  updateCartUI();
  showToast(`Added to cart — ${truncate(product.title, 30)}`, 'success');
};

/**
 * Remove a cart item by product ID.
 * @param {number} productId
 */
const removeFromCart = (productId) => {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartUI();
};

/**
 * Change quantity of a cart item.
 * Does NOT remove at qty 1 (separate remove button for that).
 * @param {number} productId
 * @param {number} delta      +1 or -1
 */
const changeCartQty = (productId, delta) => {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart();
  updateCartUI();
};

/** Clear all cart items. */
const clearCart = () => {
  cart = [];
  saveCart();
  updateCartUI();
};

/** Return total number of units in cart. */
const getCartCount = () => cart.reduce((sum, item) => sum + item.qty, 0);

/** Return cart subtotal price. */
const getCartSubtotal = () => cart.reduce((sum, item) => sum + item.price * item.qty, 0);

/* ── Cart UI Rendering ── */

/** Full cart UI re-render: badge, items list, footer visibility. */
const updateCartUI = () => {
  renderCartBadge();
  renderCartItems();
  renderCartFooter();
};

const renderCartBadge = () => {
  const badge = document.getElementById('cartBadge');
  const count = getCartCount();
  badge.textContent = count;
  badge.classList.toggle('hidden', count === 0);
};

const renderCartItems = () => {
  const container = document.getElementById('cartItems');
  const emptyEl   = document.getElementById('cartEmpty');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '';
    container.classList.add('hidden');
    emptyEl.classList.remove('hidden');
    return;
  }

  container.classList.remove('hidden');
  emptyEl.classList.add('hidden');
  container.innerHTML = cart.map(item => buildCartItemHtml(item)).join('');
};

/**
 * Build HTML for a single cart item row.
 * @param {Object} item  Cart item {id, title, price, image, qty}
 */
const buildCartItemHtml = (item) => `
  <div class="cart-item" data-cart-id="${item.id}">
    <img
      class="cart-item-img"
      src="${item.image}"
      alt="${item.title}"
      onerror="this.src='${buildPlaceholderSvg()}'"
    />
    <div class="cart-item-info">
      <p class="cart-item-title">${item.title}</p>
      <p class="cart-item-price">$${item.price.toFixed(2)} each</p>
      <div class="cart-item-controls">
        <div class="cart-qty-control">
          <button class="cart-qty-btn" data-action="minus" data-id="${item.id}" aria-label="Decrease">−</button>
          <span class="cart-qty-value">${item.qty}</span>
          <button class="cart-qty-btn" data-action="plus" data-id="${item.id}" aria-label="Increase">+</button>
        </div>
        <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove item">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  </div>
`;

const renderCartFooter = () => {
  const footer  = document.getElementById('cartFooter');
  const subtotal = document.getElementById('cartSubtotal');
  if (!footer) return;
  footer.classList.toggle('hidden', cart.length === 0);
  if (subtotal) subtotal.textContent = `$${getCartSubtotal().toFixed(2)}`;
};

/* ── Event Delegation for Cart ── */

const initCartEvents = () => {
  const cartItemsEl = document.getElementById('cartItems');
  if (cartItemsEl) {
    cartItemsEl.addEventListener('click', (e) => {
      const qtyBtn    = e.target.closest('.cart-qty-btn');
      const removeBtn = e.target.closest('.cart-item-remove');

      if (qtyBtn) {
        const id     = Number(qtyBtn.dataset.id);
        const action = qtyBtn.dataset.action;
        changeCartQty(id, action === 'plus' ? 1 : -1);
      }
      if (removeBtn) {
        const id = Number(removeBtn.dataset.id);
        removeFromCart(id);
      }
    });
  }

  // Cart toggle buttons
  const cartToggle   = document.getElementById('cartToggleBtn');
  const cartClose    = document.getElementById('cartCloseBtn');
  const cartOverlay  = document.getElementById('cartOverlay');
  const continueShopping = document.getElementById('cartContinueShoppingBtn');
  const checkoutBtn  = document.getElementById('checkoutBtn');

  if (cartToggle) cartToggle.addEventListener('click', openCartDrawer);
  if (cartClose)  cartClose.addEventListener('click', closeCartDrawer);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);
  if (continueShopping) continueShopping.addEventListener('click', closeCartDrawer);

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) return;
      closeCartDrawer();
      setTimeout(() => openCheckoutModal([...cart]), 350);
    });
  }

  // Checkout modal close + done
  const checkoutClose = document.getElementById('checkoutModalCloseBtn');
  const checkoutDone  = document.getElementById('checkoutDoneBtn');

  if (checkoutClose) {
    checkoutClose.addEventListener('click', () => {
      clearCart();
      closeCheckoutModal();
      showToast('Order placed! Thank you for shopping at LUXE. 🛍', 'success');
    });
  }
  if (checkoutDone) {
    checkoutDone.addEventListener('click', () => {
      clearCart();
      closeCheckoutModal();
      showToast('Order placed! Thank you for shopping at LUXE. 🛍', 'success');
    });
  }
};

/* ── Utility ── */
const truncate = (str, len) => str.length > len ? str.slice(0, len) + '…' : str;