/**
 * Back to top
 * ------------
 * Toggles `[data-back-to-top]` visibility once the visitor scrolls past one
 * viewport height, and smooth-scrolls to the top on click. Pure client-side
 * UX affordance — no Salla API involved.
 */
const SELECTOR = '[data-back-to-top]';
const SHOW_AFTER_VH = 1;

export function initBackToTop(root = document) {
  const button = root.querySelector(SELECTOR);
  if (!button) return;

  const threshold = window.innerHeight * SHOW_AFTER_VH;
  let ticking = false;

  const update = () => {
    button.hidden = window.scrollY < threshold;
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    },
    { passive: true }
  );

  button.addEventListener('click', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  update();
}
