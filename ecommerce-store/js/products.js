/* ============================================================
   products.js — Product rendering, wishlist, compare, skeleton, load more
   ============================================================ */

const WISHLIST_KEY = 'luxe-wishlist';
const BATCH_SIZE   = 8;

/* ── State ── */
let allProducts      = [];
let displayedCount   = BATCH_SIZE;
let wishlist         = new Set();
let compareSet       = new Set();

/* ── Wishlist Persistence ── */

const loadWishlist = () => {
  try {
    const stored = localStorage.getItem(WISHLIST_KEY);
    wishlist = stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    wishlist = new Set();
  }
};

const saveWishlist = () => {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify([...wishlist]));
};

const toggleWishlist = (productId) => {
  if (wishlist.has(productId)) {
    wishlist.delete(productId);
    showToast('Removed from wishlist', 'info');
  } else {
    wishlist.add(productId);
    showToast('Saved to wishlist ❤', 'success');
  }
  saveWishlist();
  updateWishlistBadge();
  renderWishlistSection();
  syncWishlistIcons();
};

const updateWishlistBadge = () => {
  const badge    = document.getElementById('wishlistBadge');
  const navCount = document.getElementById('wishlistNavCount');
  const count    = wishlist.size;
  if (badge) {
    badge.textContent = count;
    badge.classList.toggle('hidden', count === 0);
  }
  if (navCount) navCount.textContent = count || '';
};

const syncWishlistIcons = () => {
  document.querySelectorAll('.card-action-btn[data-action="wishlist"]').forEach(btn => {
    const id      = Number(btn.dataset.id);
    const isLiked = wishlist.has(id);
    btn.classList.toggle('wishlisted', isLiked);
    btn.querySelector('i').className = isLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    btn.setAttribute('aria-label', isLiked ? 'Remove from wishlist' : 'Add to wishlist');
  });
};

/* ── Skeleton Loading ── */

const showSkeletonCards = (count = 6) => {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  grid.innerHTML = Array.from({ length: count }, buildSkeletonCardHtml).join('');
};

const buildSkeletonCardHtml = () => `
  <div class="skeleton-card" role="listitem" aria-hidden="true">
    <div class="skeleton-card__img skeleton"></div>
    <div class="skeleton-card__body">
      <div class="skeleton-card__badge skeleton"></div>
      <div class="skeleton-card__title-line skeleton-card__title-line--full skeleton"></div>
      <div class="skeleton-card__title-line skeleton-card__title-line--short skeleton"></div>
      <div class="skeleton-card__stars-row">
        ${Array.from({ length: 5 }, () => '<div class="skeleton-card__star skeleton"></div>').join('')}
        <div class="skeleton-card__rating-count skeleton"></div>
      </div>
      <div class="skeleton-card__footer">
        <div class="skeleton-card__price skeleton"></div>
        <div class="skeleton-card__btn skeleton"></div>
      </div>
    </div>
  </div>
`;

/* ── Product Card HTML ── */

/**
 * Build HTML for a single product card.
 * @param {Object} product
 * @param {number} index   Staggered animation delay index
 */
const buildProductCardHtml = (product, index) => {
  const isWishlisted  = wishlist.has(product.id);
  const isCompared    = compareSet.has(product.id);
  const heartClass    = isWishlisted ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
  const heartWishlist = isWishlisted ? 'wishlisted' : '';
  const compareClass  = isCompared ? 'compared' : '';
  const delay         = Math.min(index * 60, 600);

  return `
    <div class="product-card" role="listitem" data-product-id="${product.id}" style="animation-delay:${delay}ms">
      <div class="card-img-wrap">
        <img
          class="card-img"
          src="${product.image}"
          alt="${product.title}"
          loading="lazy"
          onerror="this.closest('.card-img-wrap').innerHTML = '<div class=\\'card-img-placeholder\\'><i class=\\'fa-regular fa-image\\'></i></div>'"
        />
        <span class="card-badge">${product.category}</span>
        <div class="card-actions">
          <button
            class="card-action-btn ${heartWishlist}"
            data-action="wishlist"
            data-id="${product.id}"
            aria-label="${isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}"
          >
            <i class="${heartClass}"></i>
          </button>
          <button
            class="card-action-btn"
            data-action="quick-view"
            data-id="${product.id}"
            aria-label="Quick view"
          >
            <i class="fa-regular fa-eye"></i>
          </button>
          <button
            class="card-action-btn ${compareClass}"
            data-action="compare"
            data-id="${product.id}"
            aria-label="Compare"
            title="Compare"
          >
            <i class="fa-solid fa-scale-balanced"></i>
          </button>
        </div>
      </div>
      <div class="card-body">
        <h3 class="card-title">${product.title}</h3>
        <div class="card-rating-row">
          <div class="stars">${buildStarsHtml(product.rating.rate)}</div>
          <span class="rating-count">(${product.rating.count})</span>
        </div>
        <div class="card-footer">
          <span class="card-price">$${product.price.toFixed(2)}</span>
          <button
            class="card-add-btn"
            data-action="add-to-cart"
            data-id="${product.id}"
            aria-label="Add ${product.title} to cart"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;
};

/* ── Render Products ── */

/**
 * Render the filtered + sorted product list into the grid.
 * @param {Array} filtered  Products to display
 */
const renderProducts = (filtered) => {
  const grid     = document.getElementById('productGrid');
  const countEl  = document.getElementById('productCount');
  const emptyEl  = document.getElementById('emptyState');
  const loadWrap = document.getElementById('loadMoreWrap');

  if (!grid) return;

  displayedCount = BATCH_SIZE;

  if (filtered.length === 0) {
    grid.innerHTML = '';
    emptyEl.classList.remove('hidden');
    if (countEl) countEl.textContent = 'Showing 0 products';
    if (loadWrap) loadWrap.classList.add('hidden');
    return;
  }

  emptyEl.classList.add('hidden');
  const visible = filtered.slice(0, displayedCount);
  grid.innerHTML = visible.map((p, i) => buildProductCardHtml(p, i)).join('');

  if (countEl) {
    countEl.textContent = `Showing ${visible.length} of ${filtered.length} product${filtered.length !== 1 ? 's' : ''}`;
  }

  const showLoadMore = filtered.length > displayedCount;
  if (loadWrap) loadWrap.classList.toggle('hidden', !showLoadMore);
};

/**
 * Append the next batch of products (Load More).
 * @param {Array} filtered  Current filtered list
 */
const loadMoreProducts = (filtered) => {
  const grid     = document.getElementById('productGrid');
  const countEl  = document.getElementById('productCount');
  const loadWrap = document.getElementById('loadMoreWrap');

  const prevCount  = displayedCount;
  displayedCount   = Math.min(displayedCount + BATCH_SIZE, filtered.length);
  const newSlice   = filtered.slice(prevCount, displayedCount);

  newSlice.forEach((p, i) => {
    const div = document.createElement('div');
    div.innerHTML = buildProductCardHtml(p, i);
    grid.appendChild(div.firstElementChild);
  });

  if (countEl) {
    countEl.textContent = `Showing ${displayedCount} of ${filtered.length} products`;
  }

  const showLoadMore = displayedCount < filtered.length;
  if (loadWrap) loadWrap.classList.toggle('hidden', !showLoadMore);
};

/* ── Wishlist Section ── */

const renderWishlistSection = () => {
  const grid  = document.getElementById('wishlistGrid');
  const empty = document.getElementById('wishlistEmptyState');
  if (!grid) return;

  const wishlisted = allProducts.filter(p => wishlist.has(p.id));

  if (wishlisted.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  grid.innerHTML = wishlisted.map((p, i) => buildProductCardHtml(p, i)).join('');
};

/* ── Compare Feature ── */

const toggleCompare = (productId) => {
  if (compareSet.has(productId)) {
    compareSet.delete(productId);
  } else {
    if (compareSet.size >= 3) {
      showToast('You can compare up to 3 products.', 'error');
      return;
    }
    compareSet.add(productId);
  }
  updateCompareBar();
  syncCompareIcons();
};

const updateCompareBar = () => {
  const bar    = document.getElementById('compareBar');
  const label  = document.getElementById('compareBarLabel');
  const nowBtn = document.getElementById('compareNowBtn');

  const count = compareSet.size;
  bar.classList.toggle('hidden', count === 0);
  if (label) label.textContent = `${count} item${count !== 1 ? 's' : ''} selected`;
  if (nowBtn) nowBtn.disabled = count < 2;
};

const syncCompareIcons = () => {
  document.querySelectorAll('.card-action-btn[data-action="compare"]').forEach(btn => {
    const id        = Number(btn.dataset.id);
    const inCompare = compareSet.has(id);
    btn.classList.toggle('compared', inCompare);
    btn.setAttribute('aria-pressed', inCompare ? 'true' : 'false');
  });
};

/* ── Product Grid Event Delegation ── */

const initProductGridEvents = () => {
  const grid = document.getElementById('productGrid');
  if (grid) attachGridEvents(grid);

  const wishlistGrid = document.getElementById('wishlistGrid');
  if (wishlistGrid) attachGridEvents(wishlistGrid);

  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      loadMoreProducts(window.__currentFiltered || allProducts);
    });
  }

  const compareNow   = document.getElementById('compareNowBtn');
  const compareClear = document.getElementById('compareClearBtn');
  const compareClose = document.getElementById('compareModalCloseBtn');

  if (compareNow) {
    compareNow.addEventListener('click', () => {
      const products = [...compareSet].map(id => allProducts.find(p => p.id === id)).filter(Boolean);
      openCompareModal(products);
    });
  }
  if (compareClear) {
    compareClear.addEventListener('click', () => {
      compareSet.clear();
      updateCompareBar();
      syncCompareIcons();
    });
  }
  if (compareClose) {
    compareClose.addEventListener('click', closeCompareModal);
  }

  const wishlistHeaderBtn = document.getElementById('wishlistHeaderBtn');
  if (wishlistHeaderBtn) {
    wishlistHeaderBtn.addEventListener('click', () => {
      document.getElementById('wishlist-section').scrollIntoView({ behavior: 'smooth' });
    });
  }
};

/**
 * Attach delegated click events to a product grid element.
 * @param {HTMLElement} grid
 */
const attachGridEvents = (grid) => {
  grid.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-action="add-to-cart"]');
    if (addBtn) {
      e.stopPropagation();
      const id      = Number(addBtn.dataset.id);
      const product = allProducts.find(p => p.id === id);
      if (product) addToCart(product);
      return;
    }

    const wishBtn = e.target.closest('[data-action="wishlist"]');
    if (wishBtn) {
      e.stopPropagation();
      toggleWishlist(Number(wishBtn.dataset.id));
      return;
    }

    const quickViewBtn = e.target.closest('[data-action="quick-view"]');
    if (quickViewBtn) {
      e.stopPropagation();
      const product = allProducts.find(p => p.id === Number(quickViewBtn.dataset.id));
      if (product) openProductModal(product);
      return;
    }

    const compareBtn = e.target.closest('[data-action="compare"]');
    if (compareBtn) {
      e.stopPropagation();
      toggleCompare(Number(compareBtn.dataset.id));
      return;
    }

    const card = e.target.closest('.product-card');
    if (card) {
      const id      = Number(card.dataset.productId);
      const product = allProducts.find(p => p.id === id);
      if (product) openProductModal(product);
    }
  });
};

/* ── Modal Events ── */

const initModalEvents = () => {
  const overlay  = document.getElementById('productModalOverlay');
  const closeBtn = document.getElementById('modalCloseBtn');
  const minusBtn = document.getElementById('modalQtyMinus');
  const plusBtn  = document.getElementById('modalQtyPlus');
  const addBtn   = document.getElementById('modalAddToCartBtn');

  if (closeBtn) closeBtn.addEventListener('click', closeProductModal);

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeProductModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const productOverlay  = document.getElementById('productModalOverlay');
      const checkoutOverlay = document.getElementById('checkoutModalOverlay');
      const compareOverlay  = document.getElementById('compareModalOverlay');
      if (!productOverlay.classList.contains('hidden'))  closeProductModal();
      if (!checkoutOverlay.classList.contains('hidden')) closeCheckoutModal();
      if (!compareOverlay.classList.contains('hidden'))  closeCompareModal();
    }
  });

  if (minusBtn) minusBtn.addEventListener('click', () => changeModalQty(-1));
  if (plusBtn)  plusBtn.addEventListener('click',  () => changeModalQty(1));

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      if (!currentModalProduct) return;
      addToCart(currentModalProduct, modalQty);
      closeProductModal();
    });
  }
};

/* ── Error State ── */

const showErrorState = () => {
  const grid  = document.getElementById('productGrid');
  const error = document.getElementById('errorState');
  if (grid)  grid.innerHTML = '';
  if (error) error.classList.remove('hidden');
};

const hideErrorState = () => {
  const error = document.getElementById('errorState');
  if (error) error.classList.add('hidden');
};

# video link :

  https://drive.google.com/file/d/1PhAn8lrs3_GMa-7zna2JJdm1OSwKIiDP/view?usp=drivesdk
  