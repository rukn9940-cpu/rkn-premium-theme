/**
 * Central runtime configuration.
 *
 * Reads values that Twilight/Salla expose globally at render time
 * (see `views/layouts/master.twig`) instead of hardcoding them, so this
 * module stays correct across stores/locales without code changes.
 *
 * @module core/config
 */

const documentElement = document.documentElement;

export const config = Object.freeze({
  /** @type {'rtl' | 'ltr'} */
  direction: documentElement.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr',

  /** @type {string} BCP-47-ish language tag set by Twilight on <html lang="">. */
  language: documentElement.getAttribute('lang') || 'ar',

  /** True when running inside the Salla Twilight theme preview/editor. */
  isPreview: Boolean(window.salla?.config?.get?.('preview_mode', false)),
});

export default config;
