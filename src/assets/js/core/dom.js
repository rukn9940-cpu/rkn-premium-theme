/**
 * Minimal DOM query helpers. Kept intentionally tiny — this is not a jQuery
 * replacement, just enough sugar to avoid repeating
 * `document.querySelector` boilerplate across modules.
 *
 * @module core/dom
 */

/**
 * @param {string} selector
 * @param {ParentNode} [scope]
 * @returns {Element|null}
 */
export function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

/**
 * @param {string} selector
 * @param {ParentNode} [scope]
 * @returns {Element[]}
 */
export function qsa(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

/**
 * Runs `fn` once the DOM is interactive, or immediately if it already is.
 * @param {() => void} fn
 */
export function onReady(fn) {
  if (document.readyState !== 'loading') {
    fn();
    return;
  }

  document.addEventListener('DOMContentLoaded', fn, { once: true });
}
