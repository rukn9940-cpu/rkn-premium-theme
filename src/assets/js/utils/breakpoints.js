/**
 * JavaScript mirror of `src/assets/styles/abstracts/_breakpoints.scss`.
 * Keep both maps in sync manually — there is intentionally no build-time
 * bridge between SCSS and JS to keep the toolchain simple and dependency-free.
 *
 * @module utils/breakpoints
 */

export const breakpoints = Object.freeze({
  xs: 375,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1440,
});

/**
 * @param {keyof typeof breakpoints} name
 * @returns {boolean} whether the viewport currently matches `min-width: <name>`
 */
export function isAtLeast(name) {
  return window.matchMedia(`(min-width: ${breakpoints[name]}px)`).matches;
}

/**
 * Subscribes to a breakpoint threshold and invokes `callback` on every
 * match-state change (fires once immediately with the current state).
 *
 * @param {keyof typeof breakpoints} name
 * @param {(matches: boolean) => void} callback
 * @returns {() => void} unsubscribe function
 */
export function onBreakpointChange(name, callback) {
  const mediaQueryList = window.matchMedia(`(min-width: ${breakpoints[name]}px)`);
  const listener = event => callback(event.matches);

  callback(mediaQueryList.matches);
  mediaQueryList.addEventListener('change', listener);

  return () => mediaQueryList.removeEventListener('change', listener);
}
