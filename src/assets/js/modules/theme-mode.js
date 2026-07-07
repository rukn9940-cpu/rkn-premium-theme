/**
 * Theme mode (Dark Mode) toggle
 * ------------------------------
 * The actual light/dark attribute is already applied before first paint by
 * the inline snippet in `views/layouts/master.twig` (avoids a flash of the
 * wrong theme). This module only wires up the visible toggle button
 * (`[data-theme-toggle]`, rendered in the header) so the user can override
 * the OS/stored preference, and keeps `localStorage` + the button's
 * `aria-pressed` state in sync.
 */
const STORAGE_KEY = 'rkn-theme-mode';
const SELECTOR = '[data-theme-toggle]';

function currentMode() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

function applyMode(mode) {
  document.documentElement.setAttribute('data-theme', mode);
  document.querySelectorAll(SELECTOR).forEach(button => {
    button.setAttribute('aria-pressed', String(mode === 'dark'));
  });
}

function handleClick(event) {
  const button = event.target.closest(SELECTOR);
  if (!button) return;

  const nextMode = currentMode() === 'dark' ? 'light' : 'dark';
  try {
    window.localStorage.setItem(STORAGE_KEY, nextMode);
  } catch {
    // Storage unavailable (private mode/quota) — mode still applies for
    // the current page view via the DOM attribute.
  }
  applyMode(nextMode);
}

export function initThemeMode(root = document) {
  // Sync initial `aria-pressed` in case the inline head snippet chose dark
  // before this module (and its markup) was ready.
  applyMode(currentMode());
  root.addEventListener('click', handleClick);
}
