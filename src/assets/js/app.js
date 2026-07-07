/**
 * RKN Premium Theme — main JavaScript entry point.
 *
 * Loaded on every page (see `views/layouts/master.twig`). Owns
 * framework-agnostic bootstrapping plus the global (every-page) behaviors:
 * header (sticky/mobile drawer/mega-menu accordion) and the wishlist toggle.
 * Page-specific behavior (e.g. home carousels) lives in its own entry —
 * see `js/home.js`.
 */

import { onReady } from './core/dom.js';
import { config } from './core/config.js';
import { initHeader } from './modules/header.js';
import { initWishlist } from './modules/wishlist.js';
import { initClipboard } from './modules/clipboard.js';
import { initThemeMode } from './modules/theme-mode.js';
import { initBackToTop } from './modules/back-to-top.js';
import { initCarousels } from './modules/carousel.js';
import { initYoutubeFacade } from './modules/youtube-facade.js';
import { initStickyAddToCart } from './modules/sticky-add-to-cart.js';
import { initScrollReveal } from './modules/scroll-reveal.js';
import { initRipple } from './modules/ripple.js';
import { initProductReels } from './modules/product-reels.js';
import { initProduct360Viewer, initProductViewer3d } from './modules/product-360-viewer.js';
import { initLiveSearch } from './modules/live-search.js';
import { initQuickView } from './modules/quick-view.js';
import { initCompare } from './modules/compare.js';
import { initRecentlyViewed } from './modules/recently-viewed.js';
import { initSmartRecommendations } from './modules/smart-recommendations.js';

onReady(() => {
  // Enables progressive-enhancement CSS (`.js .foo { ... }`) to distinguish
  // "JS available" from "JS failed/disabled" states.
  document.documentElement.classList.add('js');
  document.documentElement.classList.toggle('is-preview', config.isPreview);

  initHeader();
  initWishlist();
  initClipboard();
  initThemeMode();
  initBackToTop();
  // Both are cheap no-ops on pages without a `[data-carousel]`/
  // `[data-youtube-facade]` element (home, blog listing, static pages with a
  // rich-text/gallery/video custom component) — kept global rather than a
  // second per-page bundle for two small, sitewide-eligible features.
  initCarousels();
  initYoutubeFacade();
  initStickyAddToCart();
  initScrollReveal();
  initRipple();
  initProductReels();
  initProduct360Viewer();
  initProductViewer3d();
  initLiveSearch();
  initQuickView();
  initCompare();
  initRecentlyViewed();
  initSmartRecommendations();
});
