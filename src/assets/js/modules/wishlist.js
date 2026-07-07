/**
 * Wishlist
 * --------
 * Wires up every `[data-wishlist-toggle]` button (rendered in
 * `partials/product/card.twig`) to the real Salla Wishlist API
 * (`salla.wishlist.toggle`) instead of Twig-inline `onclick` handlers, so the
 * interaction stays testable/CSP-friendly while still using the platform SDK.
 *
 * @see https://docs.salla.dev — Storefront SDK, Wishlist endpoints.
 */
const ACTIVE_CLASS = 'is-active';
const SELECTOR = '[data-wishlist-toggle]';

function setState(button, isActive) {
  button.classList.toggle(ACTIVE_CLASS, isActive);
  button.setAttribute('aria-pressed', String(isActive));

  // Labels are rendered server-side (translated by Twig) into
  // `data-label-*` attributes so this module never hardcodes copy.
  const label = isActive ? button.dataset.labelRemove : button.dataset.labelAdd;
  if (label) button.setAttribute('aria-label', label);
}

function handleToggle(event) {
  const button = event.target.closest(SELECTOR);
  if (!button) return;

  const productId = button.dataset.productId;
  if (!productId || !window.salla?.wishlist?.toggle) return;

  const nextState = !button.classList.contains(ACTIVE_CLASS);
  setState(button, nextState);
  button.disabled = true;

  window.salla.wishlist
    .toggle(productId)
    .catch(() => setState(button, !nextState))
    .finally(() => {
      button.disabled = false;
    });
}

export function initWishlist(root = document) {
  root.addEventListener('click', handleToggle);
}
