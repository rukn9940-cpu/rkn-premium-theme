/**
 * Returns a debounced wrapper around `fn` that delays invocation until
 * `wait` ms have elapsed since the last call. Useful for scroll/resize/input
 * handlers so they don't run on every single event (protects INP/CLS).
 *
 * @template {(...args: any[]) => void} F
 * @param {F} fn
 * @param {number} [wait=150]
 * @returns {F}
 */
export function debounce(fn, wait = 150) {
  let timeoutId;

  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * Returns a throttled wrapper around `fn` that invokes at most once per
 * `wait` ms, leading-edge.
 *
 * @template {(...args: any[]) => void} F
 * @param {F} fn
 * @param {number} [wait=150]
 * @returns {F}
 */
export function throttle(fn, wait = 150) {
  let isThrottled = false;

  return function throttled(...args) {
    if (isThrottled) return;

    isThrottled = true;
    fn.apply(this, args);
    setTimeout(() => {
      isThrottled = false;
    }, wait);
  };
}
