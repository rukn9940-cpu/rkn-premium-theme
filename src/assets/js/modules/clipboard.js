/**
 * Copy to clipboard
 * ------------------
 * Wires up any `[data-copy]` element (e.g. the order reference on the
 * Thank You page) to copy its `data-copy` value and show brief inline
 * feedback. Uses the standard Clipboard API — no theme-global namespace
 * or external dependency required.
 */
const SELECTOR = '[data-copy]';
const FEEDBACK_MS = 1600;

function showCopied(button) {
  const label = button.querySelector('span');
  const original = label ? label.textContent : null;

  button.classList.add('is-copied');
  button.setAttribute('aria-live', 'polite');
  if (label) label.textContent = button.dataset.copiedLabel || original;

  window.setTimeout(() => {
    button.classList.remove('is-copied');
    if (label && original) label.textContent = original;
  }, FEEDBACK_MS);
}

async function handleClick(event) {
  const button = event.target.closest(SELECTOR);
  if (!button) return;

  const value = button.dataset.copy;
  if (!value) return;

  try {
    await navigator.clipboard.writeText(value);
    showCopied(button);
  } catch {
    // Clipboard API unavailable/denied — fail silently, value stays visible.
  }
}

export function initClipboard(root = document) {
  root.addEventListener('click', handleClick);
}
