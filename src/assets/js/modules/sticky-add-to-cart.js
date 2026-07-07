/**
 * Sticky add-to-cart
 * -------------------
 * Product page only. Reveals a condensed, fixed-to-viewport add-to-cart bar
 * (mirroring the in-page product name/price/add-to-cart button) once the
 * visitor scrolls the primary add-to-cart button out of view — a common
 * premium-storefront pattern (Noon/Amazon) that keeps the purchase action
 * reachable on long product pages without duplicating cart logic: the bar's
 * `salla-add-product-button` is an independent instance of the same Twilight
 * web component wired to the same `product-id`, so it shares the exact
 * add-to-cart behavior (including out-of-stock/options rules) with zero
 * custom JS of our own.
 */
const BAR_SELECTOR = '[data-sticky-atc]';
const SENTINEL_SELECTOR = '[data-sticky-atc-sentinel]';
const VISIBLE_CLASS = 'is-visible';
// Mirrored onto <html> so unrelated fixed elements (back-to-top, WhatsApp
// button) can lift themselves clear of the bar via CSS alone.
const HTML_VISIBLE_CLASS = 'has-sticky-atc';

export function initStickyAddToCart(root = document) {
  const bar = root.querySelector(BAR_SELECTOR);
  const sentinel = root.querySelector(SENTINEL_SELECTOR);
  if (!bar || !sentinel || !('IntersectionObserver' in window)) return;

  bar.hidden = false;

  const observer = new IntersectionObserver(
    ([entry]) => {
      // Only reveal once the sentinel has scrolled *above* the viewport
      // (boundingClientRect above 0), never before it's been seen at all.
      const scrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      bar.classList.toggle(VISIBLE_CLASS, scrolledPast);
      document.documentElement.classList.toggle(HTML_VISIBLE_CLASS, scrolledPast);
    },
    { rootMargin: '0px 0px -1px 0px' }
  );

  observer.observe(sentinel);
}
