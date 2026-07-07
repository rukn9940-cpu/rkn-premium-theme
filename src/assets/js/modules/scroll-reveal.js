/**
 * Scroll reveal
 * -------------
 * Adds `.is-visible` to `[data-reveal]` elements the first time they enter
 * the viewport, pairing with the `reveal-on-scroll` mixin (see
 * `abstracts/_mixins.scss`) for a subtle fade-and-rise entrance. Purely
 * decorative progressive enhancement: elements are fully visible without JS
 * (see `.no-js`/base fallback below) and the mixin itself no-ops under
 * `prefers-reduced-motion`.
 */
const SELECTOR = '[data-reveal]';
const VISIBLE_CLASS = 'is-visible';

export function initScrollReveal(root = document) {
  const targets = root.querySelectorAll(SELECTOR);
  if (!targets.length) return;

  if (
    !('IntersectionObserver' in window) ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    targets.forEach(el => el.classList.add(VISIBLE_CLASS));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add(VISIBLE_CLASS);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );

  targets.forEach((el, index) => {
    // Gentle stagger for elements revealed together (e.g. a grid of cards)
    // without needing per-element markup — capped so long grids don't end
    // up with a multi-second tail.
    el.style.transitionDelay = `${Math.min(index % 8, 8) * 60}ms`;
    observer.observe(el);
  });
}
