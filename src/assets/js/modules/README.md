# Modules

Feature-scoped JavaScript. Each module exposes a single `init*()` entry
point and owns its DOM queries/event wiring — modules must not reach into
each other's internals; use `core/events.js` to communicate across module
boundaries when needed.

| Module               | Responsibility                                                                 |
| -------------------- | ------------------------------------------------------------------------------- |
| `header.js`          | Sticky header scroll state, mobile off-canvas drawer, mobile menu accordion.     |
| `wishlist.js`        | `[data-wishlist-toggle]` buttons → `salla.wishlist.toggle()`.                    |
| `carousel.js`        | Generic `IntersectionObserver`-driven scroll-snap carousel (`[data-carousel]`) — powers the hero banner, testimonials, and blog featured slider alike. |
| `theme-mode.js`      | Dark Mode toggle (`[data-theme-toggle]`), `localStorage` persistence; the initial theme is set by an inline anti-FOUC script in `layouts/master.twig`, this module only keeps it in sync after user interaction. |
| `back-to-top.js`     | Shows/hides `partials.utility.back-to-top` past a scroll threshold; scrolls smoothly, respecting `prefers-reduced-motion`. |
| `clipboard.js`       | Copy-to-clipboard for `[data-copy]` elements (order reference on `thank-you.twig`). |
| `youtube-facade.js`  | Click-to-load YouTube embeds for `[data-youtube-facade]` (the homepage `video` custom component) — defers the iframe until the user opts in. |
| `sticky-add-to-cart.js` | Product page only: reveals the condensed `[data-sticky-atc]` bar once the in-page add-to-cart button (tracked via `[data-sticky-atc-sentinel]`) scrolls out of view, via `IntersectionObserver`. |
| `scroll-reveal.js`   | Adds `.is-visible` to `[data-reveal]` elements the first time they enter the viewport (fade-and-rise entrance, homepage sections only). Fully visible with no JS/reduced-motion — purely decorative. |
| `product-reels.js`   | Vertical video feed (`home.product-reels` custom component): lazy-loads each reel's video/YouTube iframe as it nears the viewport, autoplays (muted) only while substantially visible via a second `IntersectionObserver`, tap-to-toggle playback/sound. |
| `product-360-viewer.js` | Product page gallery: `[data-product-360]` (drag/touch/pinch/wheel/gyroscope/fullscreen spin viewer over an ordered real product-photo sequence) and `[data-product-viewer-3d]` (fullscreen toggle for Salla's native `<model-viewer>` 3D models). Both are opt-in — see `views/pages/product/single.twig`'s gallery-media-triage comment. |
| `live-search.js`     | Custom instant-search overlay (`[data-live-search]`, `partials/utility/live-search.twig`): debounced `salla.product.search()` calls, results grouped into Products/Categories/Brands (the latter two derived from the matched products themselves), full Arrow Up/Down/Enter/Escape keyboard navigation. |
| `quick-view.js`      | Clones a product card's hidden `[data-quick-view-template]` (real, server-rendered product markup — see `partials/product/card.twig`) into the shared `partials/utility/quick-view.twig` modal. No fetch, no re-implemented add-to-cart/options logic. |
| `compare.js`         | `[data-compare-toggle]` buttons → a client-side (localStorage) selection, since Salla has no compare-list endpoint. Renders the floating `partials/utility/compare-bar.twig`; opening `partials/utility/compare-modal.twig` fetches each product's current record via `salla.product.getDetails()` and builds the side-by-side table (falls back to the lightweight card summary if a fetch fails). |
| `recently-viewed.js` | Records each product page visit (from an inert JSON block on `single.twig`) into a client-side (localStorage) history, and renders it into every `[data-recently-viewed]` shell (`partials/utility/recently-viewed.twig`). Exposes `getMostRecentId()` for `smart-recommendations.js`. |
| `smart-recommendations.js` | On pages with no "current product" (cart/home), mounts a real `<salla-products-list source="related">` targeted at the visitor's most recently viewed product (via `recently-viewed.js`) into `partials/utility/smart-recommendations.twig`. On the product page itself this is served server-side directly — see `views/pages/product/single.twig`. |
| `ripple.js`          | Material-style press feedback: one delegated `pointerdown` listener creates a short-lived `.ripple__wave` span inside the pressed `.btn`/`.s-infinite-scroll-btn` (both already `position: relative; overflow: hidden`), auto-removed on `animationend`. Intentionally skips Salla web components to avoid clipping their internal markup (e.g. a cart-count badge). No-ops entirely under `prefers-reduced-motion`. |

All modules are imported and initialized once from `app.js`; there is no
secondary per-page bundle. A module whose target markup doesn't exist on
the current page (e.g. `carousel.js` on a page with no `[data-carousel]`)
simply finds nothing to wire up and is a no-op.

Desktop mega-menu reveal needs no JS — it's pure CSS (`:hover`/`:focus-within`,
see `styles/layout/_header.scss`).
