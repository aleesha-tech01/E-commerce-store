/* ============================================================
   ui.js — Modal, drawer, dark mode, toast, FAQ, back-to-top
   ============================================================ */

/* ── Dark Mode ─────────────────────────────────────────────── */

/**
 * Apply theme without flash. Call before body renders if possible,
 * but we also call on DOMContentLoaded to be safe.
 */
const applyStoredTheme = () => {
  const stored = localStorage.getItem('luxe-theme') || 'light';
  document.documentElement.setAttribute('data-theme', stored);
  updateThemeIcon(stored);
};

const updateThemeIcon = (theme) => {
  const icon = document.getElementById('themeIcon');
  if (!icon) return;
  icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
};

const toggleTheme = () => {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next    = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('luxe-theme', next);
  updateThemeIcon(next);
};

/* ── Toast Notifications ────────────────────────────────────── */

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'|''} type
 * @param {number} duration  ms before auto-dismiss
 */
const showToast = (message, type = '', duration = 2800) => {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const iconMap = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info', '': 'fa-bell' };
  toast.innerHTML = `<i class="fa-solid ${iconMap[type] || iconMap['']}"></i> ${message}`;
  container.appendChild(toast);

  setTimeout(() => dismissToast(toast), duration);
};

const dismissToast = (toast) => {
  toast.classList.add('exiting');
  toast.addEventListener('animationend', () => toast.remove(), { once: true });
};

/* ── Product Modal ──────────────────────────────────────────── */

let currentModalProduct = null;
let modalQty = 1;

const openProductModal = (product) => {
  currentModalProduct = product;
  modalQty = 1;

  const overlay = document.getElementById('productModalOverlay');
  const img     = document.getElementById('modalImage');

  document.getElementById('modalProductTitle').textContent = product.title;
  document.getElementById('modalCategory').textContent     = product.category;
  document.getElementById('modalPrice').textContent        = `$${product.price.toFixed(2)}`;
  document.getElementById('modalDescription').textContent  = product.description;
  document.getElementById('modalReviews').textContent      = `${product.rating.rate} stars · ${product.rating.count} reviews`;
  document.getElementById('modalQtyValue').textContent     = '1';
  document.getElementById('modalStars').innerHTML          = buildStarsHtml(product.rating.rate);

  img.src = product.image;
  img.alt = product.title;
  img.onerror = () => { img.src = buildPlaceholderSvg(); };

  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  overlay.querySelector('.modal').focus();
};

const closeProductModal = () => {
  const overlay = document.getElementById('productModalOverlay');
  const modal   = overlay.querySelector('.modal');
  modal.classList.add('closing');
  overlay.classList.add('closing');
  setTimeout(() => {
    overlay.classList.add('hidden');
    overlay.classList.remove('closing');
    modal.classList.remove('closing');
    document.body.style.overflow = '';
    currentModalProduct = null;
  }, 280);
};

const changeModalQty = (delta) => {
  modalQty = Math.max(1, modalQty + delta);
  document.getElementById('modalQtyValue').textContent = modalQty;
};

/* ── Cart Drawer ────────────────────────────────────────────── */

const openCartDrawer = () => {
  const drawer  = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  overlay.classList.remove('hidden');
  drawer.classList.add('open');
  document.body.style.overflow = 'hidden';
};

const closeCartDrawer = () => {
  const drawer  = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  overlay.classList.add('closing');
  setTimeout(() => {
    overlay.classList.remove('closing');
    overlay.classList.add('hidden');
  }, 280);
  drawer.classList.remove('open');
  document.body.style.overflow = '';
};

/* ── Checkout Modal ─────────────────────────────────────────── */

const openCheckoutModal = (cartItems) => {
  const overlay = document.getElementById('checkoutModalOverlay');
  const summary = document.getElementById('checkoutOrderSummary');

  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  summary.innerHTML = cartItems.map(item => `
    <div class="checkout-item">
      <span class="checkout-item-title">${item.title}</span>
      <span class="checkout-item-qty">×${item.qty}</span>
      <span class="checkout-item-price">$${(item.price * item.qty).toFixed(2)}</span>
    </div>
  `).join('');

  document.getElementById('checkoutTotal').textContent = `$${total.toFixed(2)}`;
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
};

const closeCheckoutModal = () => {
  document.getElementById('checkoutModalOverlay').classList.add('hidden');
  document.body.style.overflow = '';
};

/* ── Compare Modal ──────────────────────────────────────────── */

const openCompareModal = (products) => {
  const overlay = document.getElementById('compareModalOverlay');
  const grid    = document.getElementById('compareGrid');

  grid.innerHTML = products.map(p => `
    <div class="compare-card">
      <img src="${p.image}" alt="${p.title}" class="compare-card-img"
           onerror="this.src='${buildPlaceholderSvg()}'" />
      <div class="compare-card-body">
        <p class="compare-card-title">${p.title}</p>
        <div class="compare-card-row"><span>Category</span><strong>${p.category}</strong></div>
        <div class="compare-card-row"><span>Price</span><strong>$${p.price.toFixed(2)}</strong></div>
        <div class="compare-card-row"><span>Rating</span><strong>${p.rating.rate} ★</strong></div>
        <div class="compare-card-row"><span>Reviews</span><strong>${p.rating.count}</strong></div>
      </div>
    </div>
  `).join('');

  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
};

const closeCompareModal = () => {
  document.getElementById('compareModalOverlay').classList.add('hidden');
  document.body.style.overflow = '';
};

/* ── FAQ Accordion ──────────────────────────────────────────── */

const initFaq = () => {
  const questions = document.querySelectorAll('.faq-question');
  questions.forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      // Close all
      questions.forEach(q => {
        q.setAttribute('aria-expanded', 'false');
        q.nextElementSibling.classList.remove('open');
      });
      // Toggle clicked
      if (!expanded) {
        btn.setAttribute('aria-expanded', 'true');
        btn.nextElementSibling.classList.add('open');
      }
    });
  });
};

/* ── Back To Top ────────────────────────────────────────────── */

const initBackToTop = () => {
  const btn = document.getElementById('backToTopBtn');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('hidden', window.scrollY < 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
};

/* ── Header search toggle ───────────────────────────────────── */

const initHeaderSearch = () => {
  const toggleBtn  = document.getElementById('searchToggleBtn');
  const expand     = document.getElementById('searchExpand');
  const input      = document.getElementById('searchInput');
  const clearBtn   = document.getElementById('searchClearBtn');

  toggleBtn.addEventListener('click', () => {
    const isOpen = expand.classList.toggle('open');
    if (isOpen) input.focus();
    else { input.value = ''; }
  });

  clearBtn.addEventListener('click', () => { input.value = ''; input.focus(); });

  // Sync header search → main filter search
  input.addEventListener('input', () => {
    const mainSearch = document.getElementById('filterSearchInput');
    if (mainSearch) {
      mainSearch.value = input.value;
      mainSearch.dispatchEvent(new Event('input'));
    }
  });
};

/* ── Hamburger ──────────────────────────────────────────────── */

const initHamburger = () => {
  const btn = document.getElementById('hamburgerBtn');
  const nav = document.getElementById('mobileNav');

  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    nav.setAttribute('aria-hidden', !open);
  });

  // Close on nav link click
  nav.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('open');
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      nav.setAttribute('aria-hidden', 'true');
    });
  });
};

/* ── Newsletter ─────────────────────────────────────────────── */

const initNewsletter = () => {
  const btn   = document.getElementById('newsletterBtn');
  const input = document.getElementById('newsletterEmail');

  btn.addEventListener('click', () => {
    const email = input.value.trim();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email.', 'error');
      return;
    }
    showToast('Subscribed! Welcome to LUXE. 🎉', 'success');
    input.value = '';
  });
};

/* ── Shared helpers ─────────────────────────────────────────── */

/**
 * Build star icons HTML string from a numeric rating.
 * @param {number} rating  0–5
 */
const buildStarsHtml = (rating) => {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;

  const fullStars  = '<i class="fa-solid fa-star"></i>'.repeat(full);
  const halfStar   = half ? '<i class="fa-solid fa-star-half-stroke"></i>' : '';
  const emptyStars = '<i class="fa-regular fa-star star-empty"></i>'.repeat(empty);

  return fullStars + halfStar + emptyStars;
};

/**
 * Build a minimal inline SVG placeholder data URI for broken images.
 */
const buildPlaceholderSvg = () => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'>
    <rect width='200' height='200' fill='%23E8E4DD'/>
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
          font-family='sans-serif' font-size='14' fill='%239A948C'>No Image</text>
  </svg>`;
  return `data:image/svg+xml,${svg}`;
};