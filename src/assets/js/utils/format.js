/**
 * Small formatting/escaping helpers shared by any module that builds HTML
 * from live API data (live search, compare, recently viewed...).
 * @module utils/format
 */

/**
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]
  );
}

/**
 * Formats a raw numeric amount using the store's configured currency
 * (falls back to SAR, matching Salla's own default) and the document's
 * current locale, so figures inserted by JS match the server-rendered
 * `|money` filter as closely as possible without another API round-trip.
 * @param {number|string} amount
 * @returns {string}
 */
export function formatMoney(amount) {
  if (amount == null || amount === '') return '';

  try {
    return new Intl.NumberFormat(document.documentElement.lang || undefined, {
      style: 'currency',
      currency: window.salla?.config?.get('store.currency') || 'SAR',
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return String(amount);
  }
}

/**
 * Removes duplicate entries (by `.url`) while preserving order — handy when
 * de-duping categories/brands surfaced across several matched products.
 * @param {Array<{url?: string}>} items
 */
export function uniqueByUrl(items) {
  const seen = new Set();
  const result = [];
  items.forEach(item => {
    if (!item?.url || seen.has(item.url)) return;
    seen.add(item.url);
    result.push(item);
  });
  return result;
}
