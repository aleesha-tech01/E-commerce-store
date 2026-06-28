/* ============================================================
   filters.js — Search, category filter, and sort logic.
   All three work simultaneously.
   ============================================================ */

/* ── State ── */
let activeCategory = 'all';
let searchQuery    = '';
let sortOrder      = 'default';

/* ── Debounce (closure-based, no library) ── */

/**
 * Returns a debounced version of fn that delays invocation by `delay` ms.
 * @param {Function} fn
 * @param {number} delay  ms
 */
const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/* ── Category buttons ── */

/**
 * Build dynamic category buttons from fetched product data.
 * "All" button is always first and hardcoded.
 * @param {Array} products  Full products array
 */
const buildCategoryButtons = (products) => {
  const container = document.getElementById('categoryButtons');
  if (!container) return;

  const categories = [...new Set(products.map(p => p.category))].sort();

  const allBtn = createCategoryButton('all', 'All');
  allBtn.classList.add('active');
  container.appendChild(allBtn);

  categories.forEach(cat => {
    container.appendChild(createCategoryButton(cat, capitalise(cat)));
  });
};

/**
 * Create a single category button element.
 * @param {string} value  Category value or 'all'
 * @param {string} label  Display text
 */
const createCategoryButton = (value, label) => {
  const btn = document.createElement('button');
  btn.className    = 'category-btn';
  btn.dataset.cat  = value;
  btn.textContent  = label;
  btn.setAttribute('aria-pressed', value === 'all' ? 'true' : 'false');
  return btn;
};

/**
 * Set the active category and update button states.
 * @param {string} cat
 */
const setActiveCategory = (cat) => {
  activeCategory = cat;
  document.querySelectorAll('.category-btn').forEach(btn => {
    const isActive = btn.dataset.cat === cat;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
};

/* ── Main filter + sort function ── */

/**
 * Apply search, category, and sort simultaneously to the full product list.
 * Returns a filtered & sorted subset.
 * @param {Array}  allProducts  Complete product array
 * @returns {Array}
 */
const applyFilters = (allProducts) => {
  const query = searchQuery.trim().toLowerCase();

  // 1. Category filter
  const byCategory = activeCategory === 'all'
    ? allProducts
    : allProducts.filter(p => p.category === activeCategory);

  // 2. Search filter (case-insensitive, matches title or category)
  const bySearch = query
    ? byCategory.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      )
    : byCategory;

  // 3. Sort
  const sorted = sortProducts(bySearch, sortOrder);
  return sorted;
};

/**
 * Sort a product array by the given order key.
 * @param {Array}  products
 * @param {string} order    'price-asc' | 'price-desc' | 'rating-desc' | 'name-asc' | 'default'
 */
const sortProducts = (products, order) => {
  const copy = [...products];
  switch (order) {
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'rating-desc':
      return copy.sort((a, b) => b.rating.rate - a.rating.rate);
    case 'name-asc':
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return copy;
  }
};

/* ── Reset all filters ── */

const resetFilters = () => {
  activeCategory  = 'all';
  searchQuery     = '';
  sortOrder       = 'default';

  const searchEl = document.getElementById('filterSearchInput');
  const sortEl   = document.getElementById('sortSelect');
  if (searchEl) searchEl.value = '';
  if (sortEl)   sortEl.value   = 'default';
  setActiveCategory('all');

  const headerSearch = document.getElementById('searchInput');
  if (headerSearch) headerSearch.value = '';
};

/* ── Event listener setup ── */

/**
 * Attach all filter-related event listeners.
 * @param {Function} onFilterChange  Called whenever any filter changes
 */
const initFilters = (onFilterChange) => {
  const searchInput   = document.getElementById('filterSearchInput');
  const sortSelect    = document.getElementById('sortSelect');
  const categoryWrap  = document.getElementById('categoryButtons');
  const clearBtn      = document.getElementById('clearFiltersBtn');
  const emptyRetryBtn = document.getElementById('emptyRetryBtn');

  const debouncedSearch = debounce((value) => {
    searchQuery = value;
    onFilterChange();
  }, 300);

  if (searchInput) {
    searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortOrder = e.target.value;
      onFilterChange();
    });
  }

  if (categoryWrap) {
    categoryWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.category-btn');
      if (!btn) return;
      setActiveCategory(btn.dataset.cat);
      onFilterChange();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      resetFilters();
      onFilterChange();
    });
  }

  if (emptyRetryBtn) {
    emptyRetryBtn.addEventListener('click', () => {
      resetFilters();
      onFilterChange();
    });
  }
};

/* ── Utility ── */
const capitalise = (str) => str.charAt(0).toUpperCase() + str.slice(1);
