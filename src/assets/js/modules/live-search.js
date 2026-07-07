/**
 * Live Search
 * -----------
 * Custom instant-search overlay (`[data-live-search]`). Product suggestions
 * come from the real, documented Twilight SDK endpoint
 * (`salla.product.search()`); the Categories/Brands groups shown alongside
 * them are simply the unique `product.category`/`product.brand` already
 * present on those same matched products — Salla has no separate
 * category/brand search endpoint, so this is the only honest way to surface
 * them live without inventing data. Full keyboard navigation across the
 * flattened result list (Arrow Up/Down, Enter, Escape).
 */
import { qs, qsa } from '../core/dom.js';
import { debounce, escapeHtml, formatMoney, uniqueByUrl } from '../utils/index.js';

const MIN_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;
const MAX_PRODUCTS = 6;
const MAX_GROUP_ITEMS = 4;
const OPEN_CLASS = 'is-open';
const ITEM_ATTR = 'data-live-search-item';

function formatPrice(product) {
  const onSale = product.is_on_sale ?? product.on_sale ?? false;
  return formatMoney(onSale ? product.sale_price : product.price);
}

class LiveSearch {
  constructor(root) {
    this.root = root;
    this.form = qs('[data-live-search-form]', root);
    this.input = qs('[data-live-search-input]', root);
    this.resultsEl = qs('[data-live-search-results]', root);
    this.labels = root.dataset;
    this.lastQuery = '';
    this.activeIndex = -1;

    if (!this.input || !this.resultsEl) return;

    this.lastTrigger = null;

    qsa('[data-live-search-open]').forEach(trigger =>
      trigger.addEventListener('click', () => {
        this.lastTrigger = trigger;
        this.open();
      })
    );
    qsa('[data-live-search-close]', root).forEach(trigger =>
      trigger.addEventListener('click', () => this.close())
    );

    this.form?.addEventListener('submit', event => event.preventDefault());
    this.input.addEventListener('input', debounce(() => this.handleQuery(), SEARCH_DEBOUNCE_MS));
    this.input.addEventListener('keydown', event => this.handleKeydown(event));

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && this.isOpen()) this.close();
    });
  }

  isOpen() {
    return !this.root.hidden;
  }

  open() {
    this.root.hidden = false;
    document.documentElement.classList.add('has-open-drawer');
    requestAnimationFrame(() => {
      this.root.classList.add(OPEN_CLASS);
      this.input.focus();
    });
  }

  close() {
    this.root.classList.remove(OPEN_CLASS);
    document.documentElement.classList.remove('has-open-drawer');
    // Return focus to whichever header icon opened the overlay so keyboard/
    // screen reader users aren't dropped back at the document top.
    this.lastTrigger?.focus();
    window.setTimeout(() => {
      if (!this.root.classList.contains(OPEN_CLASS)) this.root.hidden = true;
    }, 200);
  }

  getItems() {
    return qsa(`[${ITEM_ATTR}]`, this.resultsEl);
  }

  setActiveIndex(index) {
    const items = this.getItems();
    if (!items.length) return;

    this.activeIndex = ((index % items.length) + items.length) % items.length;
    items.forEach((item, i) => item.classList.toggle('is-active', i === this.activeIndex));
    items[this.activeIndex].scrollIntoView({ block: 'nearest' });
  }

  handleKeydown(event) {
    const items = this.getItems();

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (items.length) this.setActiveIndex(this.activeIndex + 1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (items.length) this.setActiveIndex(this.activeIndex - 1);
      return;
    }

    if (event.key === 'Enter') {
      if (this.activeIndex >= 0 && items[this.activeIndex]) {
        event.preventDefault();
        window.location.href = items[this.activeIndex].href;
      }
    }
  }

  handleQuery() {
    const query = this.input.value.trim();
    this.lastQuery = query;

    if (query.length < MIN_QUERY_LENGTH) {
      this.renderHint();
      return;
    }

    if (!window.salla?.product?.search) return;

    this.root.classList.add('is-loading');

    window.salla.product
      .search(query)
      .then(response => {
        if (query !== this.lastQuery) return;
        this.renderResults(this.#extractProducts(response));
      })
      .catch(() => {
        if (query === this.lastQuery) this.renderMessage(this.labels.labelError);
      })
      .finally(() => {
        if (query === this.lastQuery) this.root.classList.remove('is-loading');
      });
  }

  #extractProducts(response) {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.products)) return response.data.products;
    return [];
  }

  renderHint() {
    this.activeIndex = -1;
    this.renderMessage(this.labels.labelHint);
    this.input.setAttribute('aria-expanded', 'false');
  }

  renderMessage(text) {
    this.resultsEl.innerHTML = `<p class="live-search__hint">${escapeHtml(text)}</p>`;
  }

  renderResults(products) {
    this.activeIndex = -1;

    if (!products.length) {
      this.renderMessage(this.labels.labelEmpty);
      this.input.setAttribute('aria-expanded', 'false');
      return;
    }

    const categories = uniqueByUrl(products.map(p => p.category)).slice(0, MAX_GROUP_ITEMS);
    const brands = uniqueByUrl(products.map(p => p.brand)).slice(0, MAX_GROUP_ITEMS);

    const sections = [
      this.#renderProductsSection(products.slice(0, MAX_PRODUCTS)),
      this.#renderLinksSection(this.labels.labelCategories, categories),
      this.#renderLinksSection(this.labels.labelBrands, brands),
    ]
      .filter(Boolean)
      .join('');

    this.resultsEl.innerHTML = sections;
    this.input.setAttribute('aria-expanded', 'true');
  }

  #renderProductsSection(products) {
    if (!products.length) return '';

    const rows = products
      .map(
        product => `
          <a class="live-search__product" ${ITEM_ATTR} href="${escapeHtml(product.url)}">
            <img class="live-search__product-image" src="${escapeHtml(product.image?.url)}" alt="" loading="lazy" width="44" height="44">
            <span class="live-search__product-info">
              <span class="live-search__product-name">${escapeHtml(product.name)}</span>
              <span class="live-search__product-price">${escapeHtml(formatPrice(product))}</span>
            </span>
          </a>
        `
      )
      .join('');

    return `
      <div class="live-search__section">
        <p class="live-search__section-title">${escapeHtml(this.labels.labelProducts)}</p>
        <div class="live-search__products">${rows}</div>
      </div>
    `;
  }

  #renderLinksSection(title, items) {
    if (!items.length) return '';

    const links = items
      .map(
        item => `<a class="live-search__chip" ${ITEM_ATTR} href="${escapeHtml(item.url)}">${escapeHtml(item.name)}</a>`
      )
      .join('');

    return `
      <div class="live-search__section">
        <p class="live-search__section-title">${escapeHtml(title)}</p>
        <div class="live-search__chips">${links}</div>
      </div>
    `;
  }
}

export function initLiveSearch(root = document) {
  const el = qs('[data-live-search]', root);
  if (el) new LiveSearch(el);
}
