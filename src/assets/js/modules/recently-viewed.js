/**
 * Recently Viewed
 * ----------------
 * Salla keeps no "recently viewed" history of its own, so this tracks it
 * entirely client-side in `localStorage`. The single product page
 * (`views/pages/product/single.twig`) drops an inert
 * `<script type="application/json" data-recently-viewed-record>` with the
 * current product's real, server-rendered data; this module reads that once
 * per page load to update the history, then renders it into every
 * `[data-recently-viewed]` shell present on the page (see
 * `partials/utility/recently-viewed.twig`).
 *
 * Also exposes `getMostRecentId()` so `js/modules/smart-recommendations.js`
 * can key Salla's own related-products system off "the last product this
 * visitor looked at" on pages that have no product of their own (cart, home).
 */
import { qs, qsa } from '../core/dom.js';
import { escapeHtml } from '../utils/index.js';

const STORAGE_KEY = 'rkn:recently-viewed';
const MAX_STORED = 20;
const MAX_DISPLAYED = 10;

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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.slice(0, MAX_STORED)));
  } catch {
    /* storage unavailable (private mode/quota) — history simply won't persist */
  }
}

function recordCurrentView(root) {
  const recordEl = qs('[data-recently-viewed-record]', root);
  if (!recordEl) return readState();

  let product;
  try {
    product = JSON.parse(recordEl.textContent);
  } catch {
    return readState();
  }
  if (!product?.id) return readState();

  const state = readState().filter(item => String(item.id) !== String(product.id));
  state.unshift(product);
  writeState(state);
  return state;
}

function renderCard(item) {
  const addToCart =
    item.type && item.status
      ? `
        <salla-add-product-button
          class="recently-viewed__add"
          product-id="${escapeHtml(item.id)}"
          product-type="${escapeHtml(item.type)}"
          product-status="${escapeHtml(item.status)}"
        ></salla-add-product-button>
      `
      : '';

  return `
    <article class="recently-viewed__item">
      <a href="${escapeHtml(item.url)}" class="recently-viewed__item-media">
        <img src="${escapeHtml(item.image)}" alt="" loading="lazy" width="200" height="200">
      </a>
      <div class="recently-viewed__item-body">
        <a href="${escapeHtml(item.url)}" class="recently-viewed__item-name">${escapeHtml(item.name)}</a>
        <span class="recently-viewed__item-price">${escapeHtml(item.price)}</span>
        ${addToCart}
      </div>
    </article>
  `;
}

function renderSections(state) {
  qsa('[data-recently-viewed]').forEach(section => {
    const listEl = qs('[data-recently-viewed-list]', section);
    if (!listEl) return;

    const excludeId = section.dataset.excludeId;
    const items = state.filter(item => !excludeId || String(item.id) !== String(excludeId)).slice(0, MAX_DISPLAYED);

    if (!items.length) {
      section.hidden = true;
      return;
    }

    listEl.innerHTML = items.map(renderCard).join('');
    section.hidden = false;
  });
}

export function getMostRecentId(excludeId) {
  const match = readState().find(item => !excludeId || String(item.id) !== String(excludeId));
  return match?.id ?? null;
}

export function initRecentlyViewed(root = document) {
  const state = recordCurrentView(root);
  renderSections(state);
}
