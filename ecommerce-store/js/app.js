/* ============================================================
   app.js — Main entry point. Bootstraps all modules.
   ============================================================ */

/* ── No-flash theme restore (runs as early as possible) ──────
   We apply the stored theme before DOMContentLoaded to prevent
   a white flash when dark mode is saved. The HTML attribute
   is set synchronously here.
*/
(function () {
  const stored = localStorage.getItem('luxe-theme') || 'light';
  document.documentElement.setAttribute('data-theme', stored);
})();

/* ── DOMContentLoaded bootstrap ── */
document.addEventListener('DOMContentLoaded', () => {
  // Apply theme icon correctly (icon element is now in DOM)
  applyStoredTheme();

  // Restore persistent state
  loadCart();
  loadWishlist();

  // Sync UI from restored state
  updateCartUI();
  updateWishlistBadge();

  // Initialise non-product UI components
  initFaq();
  initBackToTop();
  initHeaderSearch();
  initHamburger();
  initNewsletter();
  initCartEvents();
  initModalEvents();
  initProductGridEvents();

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

  // Hero CTA scroll
  const heroShopBtn = document.getElementById('heroShopBtn');
  if (heroShopBtn) {
    heroShopBtn.addEventListener('click', () => {
      document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Hero wishlist btn scroll
  const heroWishlistBtn = document.getElementById('heroWishlistBtn');
  if (heroWishlistBtn) {
    heroWishlistBtn.addEventListener('click', () => {
      document.getElementById('wishlist-section').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Retry button
  const retryBtn = document.getElementById('retryBtn');
  if (retryBtn) retryBtn.addEventListener('click', loadAndRenderProducts);

  // Logo home
  const logoHome = document.getElementById('logoHome');
  if (logoHome) {
    logoHome.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Bootstrap product loading
  loadAndRenderProducts();
});

/* ── Main product loading + render pipeline ── */

/**
 * Fetch all products, then wire up filters and render.
 * Handles loading (skeleton), success, and error states.
 */
const loadAndRenderProducts = async () => {
  const errorEl = document.getElementById('errorState');
  if (errorEl) errorEl.classList.add('hidden');

  // Show skeleton while loading
  showSkeletonCards(6);

  try {
    allProducts = await fetchAllProducts();

    // Build category buttons dynamically from API data
    buildCategoryButtons(allProducts);

    // Wire up filter events — pass the render callback
    initFilters(renderFilteredProducts);

    // Initial full render
    renderFilteredProducts();

    // Render wishlist section
    renderWishlistSection();

  } catch (err) {
    console.error('Failed to load products:', err);
    document.getElementById('productGrid').innerHTML = '';
    showErrorState();
  }
};

/* ── Filter Change Callback ── */

/**
 * Called whenever any filter (search / category / sort) changes.
 * Applies current filters to allProducts and re-renders.
 */
const renderFilteredProducts = () => {
  const filtered = applyFilters(allProducts);

  // Expose for load-more access across files
  window.__currentFiltered = filtered;

  renderProducts(filtered);
};