/**
 * Compare Products
 * ----------------
 * Salla has no server-side "compare list" endpoint, so the selection itself
 * is kept client-side only, in `localStorage` (survives navigation across
 * the store, cleared by the visitor at will). Each `[data-compare-toggle]`
 * button (rendered per product in `partials/product/card.twig`) carries just
 * enough real, server-rendered data (name/url/image/price/type/status) as
 * `data-compare-*` attributes for the floating bar to render instantly with
 * zero network calls; opening the full comparison table then fetches the
 * complete, current record for each product via the documented
 * `salla.product.getDetails()` endpoint (price/stock can otherwise go stale
 * between when a product was added and when it's compared).
 */
import { qs, qsa } from '../core/dom.js';
import { escapeHtml, formatMoney } from '../utils/index.js';

const STORAGE_KEY = 'rkn:compare-products';
const OPEN_CLASS = 'is-open';
const TOGGLE_SELECTOR = '[data-compare-toggle]';
const DETAIL_FIELDS = ['images', 'brand', 'rating', 'category'];

function readState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable (private mode/quota) — comparison simply won't persist */
  }
}

function ratingStars(rating) {
  return rating?.stars ?? rating?.starts ?? rating?.rate ?? 0;
}

class Compare {
  constructor(bar, modal) {
    this.bar = bar;
    this.modal = modal;
    this.itemsEl = qs('[data-compare-bar-items]', bar);
    this.openBtn = qs('[data-compare-open-modal]', bar);
    this.bodyEl = qs('[data-compare-modal-body]', modal);
    this.max = Number.parseInt(bar.dataset.compareMax, 10) || 4;
    this.labels = { ...bar.dataset, ...(this.bodyEl?.dataset ?? {}) };
    this.state = readState();

    this.renderBar();
    this.syncToggleButtons();
    this.bindEvents();
  }

  bindEvents() {
    document.addEventListener('click', event => {
      const toggle = event.target.closest(TOGGLE_SELECTOR);
      if (toggle) {
        this.handleToggle(toggle);
        return;
      }

      const removeBtn = event.target.closest('[data-compare-remove]');
      if (removeBtn) {
        this.remove(removeBtn.dataset.compareRemove);
        return;
      }

      if (event.target.closest('[data-compare-clear]')) {
        this.clear();
        return;
      }

      if (event.target.closest('[data-compare-open-modal]')) {
        this.openModal();
        return;
      }

      if (event.target.closest('[data-compare-close]')) this.closeModal();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && this.isModalOpen()) this.closeModal();
    });
  }

  isModalOpen() {
    return !this.modal.hidden;
  }

  has(id) {
    return this.state.some(item => String(item.id) === String(id));
  }

  handleToggle(toggle) {
    const id = toggle.dataset.productId;
    if (!id) return;

    if (this.has(id)) {
      this.remove(id);
      return;
    }

    if (this.state.length >= this.max) {
      const message = (this.labels.labelMaxReached || '').replace(':count', String(this.max));
      if (message && window.salla?.notify?.info) window.salla.notify.info(message);
      return;
    }

    this.state.push({
      id,
      name: toggle.dataset.compareName || '',
      url: toggle.dataset.compareUrl || '',
      image: toggle.dataset.compareImage || '',
      price: toggle.dataset.comparePrice || '',
      type: toggle.dataset.compareType || '',
      status: toggle.dataset.compareStatus || '',
    });
    this.persist();
  }

  remove(id) {
    this.state = this.state.filter(item => String(item.id) !== String(id));
    this.persist();

    if (this.state.length < 2 && this.isModalOpen()) this.renderModalBody();
  }

  clear() {
    this.state = [];
    this.persist();
    this.closeModal();
  }

  persist() {
    writeState(this.state);
    this.renderBar();
    this.syncToggleButtons();
  }

  syncToggleButtons() {
    qsa(TOGGLE_SELECTOR).forEach(btn => {
      const active = this.has(btn.dataset.productId);
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));

      const label = active ? btn.dataset.labelRemove : btn.dataset.labelAdd;
      if (label) btn.setAttribute('aria-label', label);
    });
  }

  renderBar() {
    if (!this.state.length) {
      this.bar.hidden = true;
      this.bar.classList.remove(OPEN_CLASS);
      document.documentElement.classList.remove('has-compare-bar');
      return;
    }

    this.bar.hidden = false;
    document.documentElement.classList.add('has-compare-bar');
    requestAnimationFrame(() => this.bar.classList.add(OPEN_CLASS));

    this.itemsEl.innerHTML = this.state
      .map(
        item => `
          <div class="compare-bar__item">
            <img class="compare-bar__item-image" src="${escapeHtml(item.image)}" alt="" loading="lazy" width="40" height="40">
            <button type="button" class="compare-bar__item-remove" data-compare-remove="${escapeHtml(item.id)}" aria-label="${escapeHtml(this.labels.labelRemove)}">
              <svg width="10" height="10" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </div>
        `
      )
      .join('');

    const label = (this.labels.labelOpen || 'Compare (:count)').replace(':count', String(this.state.length));
    this.openBtn.textContent = label;
    this.openBtn.disabled = this.state.length < 2;
  }

  openModal() {
    if (this.state.length < 2) return;

    this.modal.hidden = false;
    document.documentElement.classList.add('has-open-drawer');
    requestAnimationFrame(() => {
      this.modal.classList.add(OPEN_CLASS);
      qs('.compare-modal__close', this.modal)?.focus();
    });
    this.renderModalBody();
  }

  closeModal() {
    this.modal.classList.remove(OPEN_CLASS);
    document.documentElement.classList.remove('has-open-drawer');
    // Return focus to the bar's "Compare" button (the only possible trigger)
    // so keyboard/screen reader users aren't dropped back at the document top.
    this.openBtn?.focus();
    window.setTimeout(() => {
      if (!this.modal.classList.contains(OPEN_CLASS)) this.modal.hidden = true;
    }, 200);
  }

  renderModalBody() {
    if (this.state.length < 2) {
      this.bodyEl.innerHTML = `<p class="compare-modal__empty">${escapeHtml(this.labels.labelEmpty || '')}</p>`;
      return;
    }

    this.bodyEl.innerHTML = `<p class="compare-modal__empty">${escapeHtml(this.labels.labelLoading || '')}</p>`;

    const items = this.state;
    Promise.all(
      items.map(item =>
        window.salla?.product?.getDetails
          ? window.salla.product
              .getDetails(item.id, DETAIL_FIELDS)
              .then(response => response?.data ?? response)
              .catch(() => null)
          : Promise.resolve(null)
      )
    ).then(details => {
      // Never let one failed lookup blank the whole table — fall back to the
      // lightweight summary already captured when the item was added.
      const products = items.map((item, index) => details[index] || item);
      this.renderTable(products);
    });
  }

  renderTable(products) {
    const l = this.labels;
    const rows = [
      { label: l.labelPrice, cells: products.map(p => this.#priceCell(p)) },
      { label: l.labelRating, cells: products.map(p => this.#ratingCell(p)) },
      { label: l.labelBrand, cells: products.map(p => escapeHtml(p.brand?.name) || '—') },
      { label: l.labelCategory, cells: products.map(p => escapeHtml(p.category?.name) || '—') },
      { label: l.labelAvailability, cells: products.map(p => this.#availabilityCell(p)) },
    ];

    const head = products
      .map(
        p => `
          <th class="compare-table__col">
            <button type="button" class="compare-table__remove" data-compare-remove="${escapeHtml(p.id)}" aria-label="${escapeHtml(l.labelRemove)}">&times;</button>
            <a href="${escapeHtml(p.url)}" class="compare-table__product">
              <img src="${escapeHtml(p.image?.url || p.image)}" alt="" loading="lazy" width="96" height="96">
              <span>${escapeHtml(p.name)}</span>
            </a>
            ${this.#addToCartMarkup(p)}
          </th>
        `
      )
      .join('');

    const body = rows
      .map(
        row => `
          <tr>
            <th scope="row" class="compare-table__row-label">${escapeHtml(row.label)}</th>
            ${row.cells.map(cell => `<td>${cell}</td>`).join('')}
          </tr>
        `
      )
      .join('');

    this.bodyEl.innerHTML = `
      <table class="compare-table">
        <thead><tr><th></th>${head}</tr></thead>
        <tbody>${body}</tbody>
      </table>
    `;
  }

  #priceCell(product) {
    // Fresh detail responses carry numeric `price`/`sale_price` (formatted
    // here); the lightweight fallback summary (used if the fetch fails)
    // only has an already-formatted `price` string from the card — show it
    // as-is rather than mis-formatting it a second time.
    if (typeof product.price === 'string') return escapeHtml(product.price);

    const onSale = product.is_on_sale ?? false;
    const current = formatMoney(onSale ? product.sale_price : product.price);
    if (!onSale || !product.regular_price) return escapeHtml(current);

    return `${escapeHtml(current)} <s class="compare-table__price-regular">${escapeHtml(formatMoney(product.regular_price))}</s>`;
  }

  #ratingCell(product) {
    const stars = ratingStars(product.rating);
    const count = product.rating?.count;
    if (!count) return escapeHtml(this.labels.labelNoReviews || '');
    return `★ ${escapeHtml(stars)} (${escapeHtml(count)})`;
  }

  #availabilityCell(product) {
    const available =
      product.is_available ?? (product.is_out_of_stock != null ? !product.is_out_of_stock : product.status === 'sale');
    const label = available ? this.labels.labelInStock : this.labels.labelOutOfStock;
    return `<span class="compare-table__stock${available ? '' : ' is-out'}">${escapeHtml(label)}</span>`;
  }

  #addToCartMarkup(product) {
    if (!product.type || !product.status) return '';

    return `
      <salla-add-product-button
        class="compare-table__add"
        width="wide"
        product-id="${escapeHtml(product.id)}"
        product-type="${escapeHtml(product.type)}"
        product-status="${escapeHtml(product.status)}"
      ></salla-add-product-button>
    `;
  }
}

export function initCompare(root = document) {
  const bar = qs('[data-compare-bar]', root);
  const modal = qs('[data-compare-modal]', root);
  if (bar && modal) new Compare(bar, modal);
}
