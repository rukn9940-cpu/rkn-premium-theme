# RKN Premium Theme

A production-ready, premium [Salla](https://salla.sa) storefront theme built
on the **Twilight** theme engine — complete storefront, customer account
area, blog, and campaign/landing pages, with Dark Mode, full RTL/LTR support,
WCAG 2.2 AA accessibility, and Core Web Vitals-optimized delivery.

See [`PROJECT_SPEC.md`](./PROJECT_SPEC.md) for the full technical
specification, architecture rationale, and page-by-page reference.

## Requirements

- Node.js `>= 18` (see `.nvmrc`)
- npm `>= 9`
- [Salla CLI](https://www.npmjs.com/package/@salla.sa/cli) for theme preview/sync:
  ```bash
  npm install -g @salla.sa/cli
  salla login
  ```

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Start the watcher (rebuilds on change and syncs with Salla preview)
npm run watch

# 3. In another terminal, start the Salla theme preview
salla theme preview
```

## Scripts

| Script                 | Description                                              |
| ---------------------- | -----------------------------------------------------------|
| `npm run development`  | One-off development build (unminified, source maps).     |
| `npm run watch`        | Development build that rebuilds on file changes.         |
| `npm run production`   | Optimized production build (minified CSS/JS).            |
| `npm run lint`         | Lint JavaScript and SCSS.                                 |
| `npm run lint:js`      | Lint JavaScript only (ESLint).                            |
| `npm run lint:css`     | Lint SCSS only (Stylelint).                                |
| `npm run format`       | Format JS/SCSS with Prettier.                              |

## Pages implemented

| Page | Path |
| --- | --- |
| Home | `src/views/pages/index.twig` |
| Product (single) | `src/views/pages/product/single.twig` |
| Category / Search / Offers listing | `src/views/pages/product/index.twig` |
| Cart | `src/views/pages/cart.twig` |
| Thank you (order confirmation) | `src/views/pages/thank-you.twig` |
| Customer profile | `src/views/pages/customer/profile.twig` |
| Customer orders (list + single) | `src/views/pages/customer/orders/{index,single}.twig` |
| Customer wishlist | `src/views/pages/customer/wishlist.twig` |
| Customer notifications | `src/views/pages/customer/notifications.twig` |
| Brands (list + single) | `src/views/pages/brands/{index,single}.twig` |
| Blog (list + single article) | `src/views/pages/blog/{index,single}.twig` |
| Static pages (About/Contact/FAQ/Terms) | `src/views/pages/page-single.twig` |
| Landing / campaign page (offer + 404 pattern) | `src/views/pages/landing-page.twig` |
| Loyalty program | `src/views/pages/loyalty.twig` |

Salla's Twilight router uses a **fixed page-file convention** — there is no
standalone `search.twig`, `offers.twig`, or `404.twig`; search results and
offer listings are variants of `product/index.twig`, and "page not found"
states are handled inline (see `landing-page.twig`'s `{% if not landing %}`
branch) rather than via a dedicated error template.

## Project structure

```
RKN-Premium-Theme/
├─ src/
│  ├─ assets/
│  │  ├─ images/        # Static imagery copied to /public/images
│  │  ├─ icons/          # Inline-friendly SVG icons copied to /public/icons
│  │  ├─ fonts/          # Self-hosted webfonts copied to /public/fonts
│  │  ├─ styles/         # SCSS architecture (7-1 pattern), entry: app.scss
│  │  └─ js/             # JavaScript architecture, entry: app.js
│  ├─ locales/           # ar.json / en.json translation strings
│  └─ views/
│     ├─ layouts/        # HTML shells (master.twig, customer.twig)
│     ├─ partials/       # Non-themeable Twig fragments (a11y, product, nav, utility)
│     ├─ components/     # Merchant-configurable Twilight components (home, header, footer)
│     └─ pages/          # Full page templates (see table above)
├─ package.json
├─ webpack.config.js
├─ twilight.json
└─ PROJECT_SPEC.md
```

Every non-trivial folder contains its own `README.md` documenting the
conventions specific to it — start there before adding new files.

## Feature highlights

- **10 built-in color presets** — Professional Blue, Midnight Black,
  Emerald, Royal Purple, Orange, Red, Minimal White, Luxury Gold, Navy, and
  Dark Mode. Switch the entire storefront's brand color from Theme Settings
  in the Partners Portal — no code edits, no rebuild. Defaults to "Custom",
  which keeps using Salla's native Theme Features color picker. See §6.3b
  of `PROJECT_SPEC.md`.
- **Full design system, all Theme-Settings-driven** — border radius
  (sharp/soft/rounded/extra-rounded), shadow depth (flat/soft/premium),
  spacing density (compact/comfortable/spacious), a base font-size scale, and
  button shape (pill/rounded/sharp) each resolve to CSS custom properties in
  `partials/utility/design-system-vars.twig`, so every card/button/modal in
  the storefront restyles instantly with zero rebuild.
- **8 header layouts, 8 footer layouts, 10 hero-banner layouts, 5 product
  card styles, and a Banner Builder** (unlimited full/half/third-width
  promo banners) — every option is a presentation-only variant of the exact
  same real data/markup, switchable per-store from Theme Settings/the home
  builder. See the layout tables in `PROJECT_SPEC.md`.
- **Advanced animation system** — native cross-document page transitions
  (`@view-transition`), directional scroll-reveal (`data-reveal`/`="left"
  /"right"/"zoom"`), a Material-style button ripple, real second-photo hover
  crossfade on product cards, and shimmering loading skeletons for every
  async Twilight component — all `prefers-reduced-motion`-aware.
- **Dark Mode** — merchant-toggleable (`dark_mode_enabled` Theme Setting),
  anti-FOUC inline bootstrap script, `localStorage`-persisted user
  preference, and full `prefers-color-scheme` support.
- **Premium shopping features** — Product Reels, an interactive 360° product
  viewer, a multi-column Mega Menu Builder, instant Live Search, Quick View,
  Compare Products, a sticky Add to Cart bar, Recently Viewed, and Smart
  Recommendations — every one merchant-configurable and backed by real
  Salla data (see `src/assets/js/modules/README.md`).
- **Mega menu, sticky header, announcement bar, mobile off-canvas nav** —
  all driven by real Salla menu/category data, no placeholder links.
- **Custom homepage sections** — hero banner, categories, featured products,
  offers/countdown, brand slider, testimonials, store features, product
  reels, a banner builder, plus merchant-authored blocks (rich text,
  gallery, YouTube video facade).
- **Floating utilities** — back-to-top and WhatsApp contact button, both
  merchant-toggleable via Theme Settings.
- **SEO** — per-page `<title>`/description/canonical, Open Graph tags, and
  JSON-LD structured data (`Organization`, `Product`, `BlogPosting`) on every
  relevant page; private account/checkout pages are marked `noindex`.

## Engineering principles

- **Mobile-first** — every style is authored for the smallest viewport
  first and progressively enhanced upward via `breakpoint-up()`.
- **RTL & LTR** — CSS logical properties (`margin-inline-start`,
  `inset-inline-end`, ...) are the default direction strategy so one
  stylesheet serves both `dir="rtl"` and `dir="ltr"` storefronts.
- **SEO ready** — semantic HTML, a single `<h1>` per page, per-page
  title/description/canonical blocks, Open Graph metadata, and JSON-LD
  structured data across product, blog, and organization pages.
- **Accessibility (WCAG 2.2 AA)** — visible focus states, a skip link,
  `prefers-reduced-motion`/`prefers-contrast` support, and a 44×44px
  minimum tap target are enforced at the foundation level.
- **Core Web Vitals** — content-hashed, minified, code-split assets;
  explicit image dimensions with `loading`/`fetchpriority` hints; a
  click-to-load YouTube facade; no unused CSS/JS frameworks shipped.
- **Clean architecture** — a strict, one-directional dependency order
  (abstracts → base → layout → components → pages → utilities) and a clear
  split between Twilight *components* (merchant-configurable) and
  *partials* (structural, non-themeable).

## License

Proprietary — all rights reserved.
