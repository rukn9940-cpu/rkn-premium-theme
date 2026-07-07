/**
 * Button ripple
 * -------------
 * Lightweight Material-style press feedback for the theme's own
 * `.btn`/`.s-infinite-scroll-btn` controls (both already `position: relative`
 * + `overflow: hidden` in CSS, see `components/_button.scss`/
 * `utilities/_helpers.scss`). Intentionally excludes Salla web components
 * (e.g. `salla-cart-summary`) since clipping their internal shadow-DOM
 * markup could hide a cart-count badge or similar UI we don't control.
 *
 * A single delegated `pointerdown` listener creates one short-lived `<span>`
 * per press (removed after its animation ends, so nothing ever leaks) — no
 * per-button markup or listeners needed. No-ops entirely under
 * `prefers-reduced-motion`, matching every other motion effect in the theme.
 */
const RIPPLE_SELECTOR = '.btn, .s-infinite-scroll-btn';
const RIPPLE_CLASS = 'ripple__wave';

export function initRipple(root = document) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  root.addEventListener(
    'pointerdown',
    event => {
      if (event.button !== 0 && event.pointerType === 'mouse') return;

      const target = event.target.closest(RIPPLE_SELECTOR);
      if (!target || target.disabled || target.getAttribute('aria-disabled') === 'true') return;

      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.6;
      const wave = document.createElement('span');
      wave.className = RIPPLE_CLASS;
      wave.style.width = wave.style.height = `${size}px`;
      wave.style.left = `${event.clientX - rect.left - size / 2}px`;
      wave.style.top = `${event.clientY - rect.top - size / 2}px`;

      target.querySelectorAll(`.${RIPPLE_CLASS}`).forEach(node => node.remove());
      target.appendChild(wave);

      wave.addEventListener(
        'animationend',
        () => {
          wave.remove();
        },
        { once: true }
      );
    },
    { passive: true }
  );
}
