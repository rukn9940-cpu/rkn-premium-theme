# RKN Premium Theme — Project Specification

| | |
|---|---|
| **Project** | RKN Premium Theme |
| **Platform** | Salla (Twilight theme engine) |
| **Document status** | Complete — full storefront, account area, and content pages implemented |
| **Version** | 0.1.0 |

## 1. Purpose & scope

RKN Premium Theme is a custom Salla Twilight storefront theme built from a
clean, original architecture — no commercial theme's code, structure, or
assets have been copied or adapted.

This document specifies the **complete theme**: build tooling, SCSS/JS
architecture, every page template, every homepage/custom section, Theme
Settings, Dark Mode, and the accessibility/SEO/performance conventions
enforced throughout. Everything described here is implemented with real
Salla Twilight APIs (Twig variables/helpers, Web Components, JS SDK) — there
is no demo content, fake data, or placeholder markup anywhere in the
codebase.

## 2. Goals & non-functional requirements

| Requirement | How it's addressed |
|---|---|
| Compatible with latest Twilight | Uses the documented `twilight.json` schema, standard directory layout, official Web Components (`salla-*`), and the `@salla.sa/twilight` watcher/build integration. |
| Mobile-first | Every SCSS rule is authored for the smallest viewport first; `breakpoint-up()` only ever widens the viewport, never narrows it. |
| RTL & LTR | CSS logical properties are the default direction strategy everywhere (see §6.4); `dir`/`lang` driven by `theme.is_rtl` / `store.language.code`. Zero physical-direction properties (`left`/`right`/`margin-left`/...) exist in the codebase. |
| SEO ready | Per-page `title`/`meta_description`/`canonical` blocks, Open Graph tags, and JSON-LD structured data (`Organization`, `Product`, `BlogPosting`) on every relevant page; `noindex` on private account/checkout pages; single `<h1>` per page. |
| Accessibility WCAG AA | Skip link, visible `:focus-visible` rings, `.sr-only` utilities, 44px minimum tap targets, `prefers-reduced-motion`/`prefers-contrast` support, labeled form fields, `aria-*` on every icon-only control. |
| Core Web Vitals | Content-hashed/minified/split assets, explicit image `width`/`height` + `loading`/`fetchpriority` hints, click-to-load YouTube facade, `IntersectionObserver`-based carousel, no unused runtime framework shipped (7.4 KB JS / 55 KB CSS production bundle). |
| Clean architecture | Unidirectional SCSS layer dependency order, isolated JS core/utils/modules, explicit separation of Twilight *components* (merchant-configurable) vs. structural *partials*. |
| Real Salla APIs only | Every dynamic value comes from documented Twig variables/helpers or Web Components; every write action (`cart.addItem`, `profile.update`, `contact.send`, `comment.send`, wishlist toggle, logout) uses the documented `salla.*` JS SDK / `salla.form.onSubmit` contract. |

## 3. Technology stack

| Concern | Choice | Rationale |
|---|---|---|
| Template engine | Twig (via Twilight) | Required by the platform. |
| CSS | Dart Sass (`@use`/`@forward` module system) | No CSS framework dependency/lock-in; smallest possible shipped payload; full control over the cascade. |
| CSS post-processing | PostCSS (`autoprefixer`, `postcss-preset-env`) | Vendor prefixing and safe modern syntax based on `.browserslistrc`. |
| JavaScript | Vanilla ES modules, Babel-transpiled | No framework runtime tax on storefront pages; Salla's own storefront already ships a component runtime (`@salla.sa/twilight`). |
| Bundler | Webpack 5 | Required for `@salla.sa/twilight`'s live-preview watcher integration. |
| Linting/formatting | ESLint, Stylelint, Prettier | Enforced, consistent code quality; theme ships with zero lint errors. |

## 4. Directory structure

```
RKN-Premium-Theme/
├─ .browserslistrc
├─ .editorconfig
├─ .eslintrc.json
├─ .gitignore
├─ .nvmrc
├─ .prettierrc.json
├─ .stylelintrc.json
├─ babel.config.json
├─ postcss.config.js
├─ package.json
├─ webpack.config.js
├─ twilight.json
├─ README.md
├─ PROJECT_SPEC.md
└─ src/
   ├─ assets/
   │  ├─ images/ icons/ fonts/        # static assets → /public
   │  ├─ styles/                       # SCSS architecture (§6)
   │  │  ├─ abstracts/                 # tokens, functions, mixins (no CSS output)
   │  │  ├─ base/                      # reset, typography, direction, a11y, theme-mode (dark mode)
   │  │  ├─ layout/                    # header, footer
   │  │  ├─ components/                # one partial per UI component
   │  │  ├─ pages/                     # page-specific styles
   │  │  ├─ utilities/                 # single-purpose helper classes
   │  │  └─ app.scss                   # entry point
   │  └─ js/
   │     ├─ core/                      # config, dom, events primitives
   │     ├─ utils/                     # pure helper functions
   │     ├─ modules/                   # carousel, wishlist, header, theme-mode, back-to-top,
   │     │                             # clipboard, youtube-facade
   │     └─ app.js                     # single entry point (bundles the whole theme)
   ├─ locales/
   │  ├─ ar.json                       # 125 keys, 1:1 with en.json
   │  └─ en.json
   └─ views/
      ├─ layouts/
      │  ├─ master.twig                # single HTML shell every page extends
      │  └─ customer.twig              # account dashboard shell (sidebar + content)
      ├─ partials/
      │  ├─ accessibility/skip-link.twig
      │  ├─ product/{card,options}.twig
      │  ├─ navigation/menu-tree.twig
      │  └─ utility/{back-to-top,whatsapp-button}.twig
      ├─ components/
      │  ├─ header/header.twig         # sticky header, mega menu, mobile nav, dark-mode toggle
      │  ├─ footer/footer.twig
      │  ├─ comments.twig              # shared comments component (pages + blog)
      │  └─ home/                      # hero-banner, categories, featured-products, offers,
      │                                # brands, testimonials, store-features, rich-text,
      │                                # gallery, video (all merchant-configurable)
      └─ pages/                        # see §9.3 for the full page list
```

Every non-trivial folder ships its own `README.md` documenting the
conventions specific to it.

## 5. Configuration files

### 5.1 `twilight.json`

Root theme manifest consumed by the Salla Partners Portal and the Twilight
render engine:

- `name` / `description` — bilingual (ar/en) theme identity.
- `features` — `mega-menu`, `fonts`, `color`, `breadcrumb`, plus
  `component-testimonials`/`component-store-features` for the two homepage
  sections that are genuine built-in Twilight **Theme Features** (Salla
  injects real `items` data for these; they aren't configurable via custom
  field schemas).
- `settings` — merchant-facing Theme Settings, grouped by concern:
  - **Color/branding**: `color_preset` (§6.3b).
  - **Header/navigation**: `header_is_sticky`, `announcement_enabled`/
    `announcement_text`/`announcement_link`, `live_search_enabled`,
    `mega_menu_banner_image`/`_url`/`_title`, `header_layout` (§6.3c).
  - **Storefront features**: `dark_mode_enabled`, `back_to_top_enabled`,
    `whatsapp_enabled`/`whatsapp_number`, `product_360_enabled`/
    `product_360_min_frames`, `quick_view_enabled`, `compare_enabled`/
    `compare_max_items`, `sticky_atc_enabled`, `recently_viewed_enabled`,
    `smart_recommendations_enabled`.
  - **Design system** (§6.3c): `footer_layout`, `product_card_style`,
    `radius_style`, `shadow_style`, `spacing_density`, `font_scale`,
    `button_style`.
- `components` — custom homepage building blocks with full field schemas,
  each merchant-configurable independently of the Theme Features above:
  `hero-banner` (+ `layout` field, §6.3c), `categories`, `featured-products`,
  `offers`, `brands`, `rich-text`, `gallery`, `video`, `product-reels`,
  `banner-grid` (the Banner Builder, §6.3c). Field types used are all
  Salla-documented primitives (`text`, `textarea`, `boolean`, `collection`,
  `items`/`dropdown-list`, entity pickers for Products/Categories/Brands) —
  no speculative/unverified field formats (e.g. `wysiwyg`, which Salla does
  not support for custom components).

### 5.2 `package.json`

Declares the build/lint/format scripts (see `README.md` §Scripts) and pins
the toolchain: Webpack 5, Sass, Babel, PostCSS, `@salla.sa/twilight` (for
the live-preview watcher), ESLint, Stylelint, Prettier.

### 5.3 `webpack.config.js`

- **Entry**: a single `app` entry (`styles/app.scss` + `js/app.js`) — every
  page and homepage section shares one bundle; there is no per-page code
  splitting, keeping the request count minimal for Core Web Vitals.
- **Output**: `/public`, cleaned on every build, `[name].js`/`[name].css`
  for entries and content-hashed filenames for split chunks.
- **Loaders**: Babel for JS (excludes `node_modules`); `sass-loader` →
  `postcss-loader` → `css-loader` → `MiniCssExtractPlugin.loader` for SCSS.
- **Plugins**: `ThemeWatcher` from `@salla.sa/twilight` (live preview sync),
  `MiniCssExtractPlugin`, `CopyPlugin` (images/fonts/icons → `/public`).
- **Optimization**: `TerserPlugin` + `CssMinimizerPlugin` in production mode
  only; source maps enabled in development only. Production output: ~7.4 KB
  JS + ~55 KB CSS (minified, pre-gzip).

### 5.4 Code quality tooling

- `.eslintrc.json` — `eslint:recommended` baseline, `salla`/`Salla` declared
  as known globals (the storefront runtime Salla injects).
- `.stylelintrc.json` — `stylelint-config-standard-scss`, with a kebab-case
  BEM-ish class naming convention enforced (`selector-class-pattern`).
- `.prettierrc.json` — shared formatting rules for JS/SCSS.
- `.browserslistrc` — shared target matrix for Babel/PostCSS/Autoprefixer.

Theme-wide validation performed before every release: `npm run lint`
(zero errors) and `npm run build` (successful production compile), plus a
custom locale-key audit confirming every `trans('...')` call used across
all 38 Twig view files resolves in both `ar.json` and `en.json` (and that
neither locale file carries dead/unused keys).

## 6. SCSS architecture

Adapted 7-1 pattern:

```
abstracts → base → layout → components → pages → utilities
```

### 6.1 Layer responsibilities

| Layer | Responsibility |
|---|---|
| `abstracts` | Design tokens (`_variables.scss`), Sass functions, mixins, breakpoint map. Consumed via `@use '../abstracts' as *;`. Emits no CSS. |
| `base` | Element-level defaults: `_reset.scss`, `_typography.scss`, `_direction.scss` (RTL/LTR), `_accessibility.scss`, `_theme-mode.scss` (Dark Mode custom properties). |
| `layout` | Structural regions shared across pages: `_header.scss`, `_footer.scss`. |
| `components` | One partial per UI component, mirroring `views/components` and shared `views/partials`: hero banner, product card, carousel, buttons, comments, floating actions, rich-text/gallery/video blocks, etc. |
| `pages` | Page-specific styles: product single/listing, cart, brands, account/orders/notifications, thank-you, static-page, blog, landing-page. |
| `utilities` | Single-purpose helper classes (`.container`, `.sr-only`, ...). Highest specificity layer, loaded last. |

### 6.2 Module system

Dart Sass's `@use`/`@forward` is used exclusively — no `@import` anywhere.
Each layer exposes an `_index.scss` barrel that `@forward`s its siblings;
`app.scss` only ever `@use`s the layer barrels.

### 6.3 Design tokens & Dark Mode (`abstracts/_variables.scss`, `base/_theme-mode.scss`)

Structural tokens (spacing, z-index, radii, motion, container widths,
accessibility constants) plus a brand-neutral color scale. Two categories
of color variables exist, by design:

- **Adaptive content tokens** (`$surface-0/100/200`, `$text-heading/body/muted`,
  `$border-subtle`) are routed through CSS custom properties with light
  defaults, overridden under `[data-theme='dark']` in `_theme-mode.scss`.
  Every component built on these tokens gets Dark Mode support automatically.
- **Fixed "brand chrome" colors** (header, footer, hero banner, offers
  banner, carousel controls, ghost-button hover states, product badges) are
  intentionally hardcoded (`#fff`, `$ink-*`) because they sit on permanently
  dark backgrounds/photography regardless of site-wide theme mode — flipping
  them under Dark Mode would break contrast, not improve it.

Dark Mode is merchant-toggleable (`dark_mode_enabled` Theme Setting). When
enabled: an inline anti-FOUC script in `master.twig` applies the stored/
system-preferred theme before first paint; `js/modules/theme-mode.js`
handles the toggle button and persists the choice to `localStorage`.

Merchant-controlled color/font values (`theme.color.*`, `theme.font.*`) are
wired independently as CSS custom properties in `views/layouts/master.twig`.

### 6.3a Premium visual design system

A dedicated visual-design pass (post-functional-completion) layered a
richer, "flagship storefront" design language on top of the tokens above
without touching any Salla API/data binding:

- **Elevation** — layered, low-opacity shadows (`$shadow-xs` → `$shadow-xl`,
  each a soft ambient + tighter key shadow) replace single hard-edged
  shadows; `shadow-glow()` adds a primary-brand-tinted glow to CTA
  hover/focus states via `color-mix()` (not `rgba()` — a CSS custom property
  holding a full color can't be tinted with `rgba(var(--x), alpha)`, a
  real-world gotcha fixed in a few places during this pass, e.g.
  `.store-feature__icon`, `.notification-row__icon`,
  `.account-sidebar__link.is-active`).
- **Glassmorphism** — `glass-surface()` mixin (translucent + `backdrop-filter`
  blur, always with a solid fallback color and a `@supports` guard) powers
  the scrolled sticky header, the desktop mega menu/submenu panels, and the
  offers/landing-page countdown trays.
- **Typography** — tighter letter-spacing on large headings
  (`$letter-spacing-tight/-tighter`), a wider line-height scale
  (`$line-height-tight/snug/base/relaxed`), a new `$font-size-5xl` for hero
  moments, and `font-variant-numeric: tabular-nums` on prices/countdowns so
  digits don't jitter horizontally as they change.
- **Motion** — `$easing-emphasized` (a slight overshoot) drives
  button/card/icon micro-interactions; `card-hover()` now also transitions
  `box-shadow`/`border-color`, not just `transform`. All new animation is
  wrapped in `reduced-motion()` no-ops.
- **Loading skeletons** — `skeleton()` mixin (shimmer sweep, `.u-skeleton`
  utility, `.product-card-skeleton` component) plus a global rule giving
  any not-yet-upgraded Twilight list/loader web component
  (`salla-products-list:not(:defined)`, etc.) a fixed-height shimmering
  placeholder instead of a layout-shifting blank collapse; `.s-loading`/
  `.s-infinite-scroll-*` (Salla's documented customization hooks) are
  restyled to match the brand color and motion language.
- **Scroll-reveal** — `[data-reveal]` + `js/modules/scroll-reveal.js`
  fade-and-rise homepage sections/cards into view via `IntersectionObserver`.
  Scoped to `html.js` in the `reveal-on-scroll()` mixin so it never hides
  content when JavaScript is unavailable, and intentionally **not** applied
  to `partials/product/card.twig` instances that can be appended later by
  `salla-infinite-scroll` (category/search/landing-page listings) — only to
  the always-server-rendered-once homepage sections (`reveal: true` param).
- **Sticky add-to-cart** — the product page renders a second, independent
  `salla-add-product-button` in a fixed bottom bar
  (`pages/_product-single.scss` → `.sticky-add-to-cart`), revealed via
  `js/modules/sticky-add-to-cart.js` once the in-page button scrolls out of
  view. It shares the real component's add-to-cart behavior with zero custom
  cart logic of our own; the floating back-to-top/WhatsApp buttons lift
  themselves clear of it automatically (`html.has-sticky-atc`).
- **Forms** — `components/_forms.scss` centralizes `.form-field` (label +
  input/select/textarea), previously duplicated between the account and
  static/contact-form page styles: bordered inputs with a brand-colored
  focus ring (`color-mix()` glow, not just the default focus outline),
  `aria-invalid` error styling, and a custom `<select>` chevron.

### 6.3b Color Presets (`color_preset` Theme Setting)

A merchant-facing "نظام الألوان الجاهز" (Color Preset) dropdown — Theme
Settings, `twilight.json` → `settings[0]` — lets a merchant switch the
entire storefront's brand color from the Partners Portal, **no code edit or
rebuild required**. Resolution logic lives in
`views/partials/utility/theme-color-vars.twig` (included once from
`layouts/master.twig`):

- **10 curated palettes**, each defined as a primary/dark/light/text
  quartet and checked for WCAG AA contrast (white or near-black text,
  whichever the base color needs) before being wired up: **Professional
  Blue**, **Midnight Black**, **Emerald**, **Royal Purple**, **Orange**,
  **Red**, **Minimal White** (a soft-graphite accent on the theme's already-
  white canvas — a literal near-white *button* color would fail contrast
  for the many components that assume white text-on-primary), **Luxury
  Gold** (dark text — gold midtones don't clear AA with white text),
  **Navy**, and **Dark Mode** (a slate-charcoal accent color — distinct
  from, and independent of, the `dark_mode_enabled` light/dark *surface*
  toggle described in §6.3).
- **"Custom" (the default)** falls back to Salla's native "Theme Features →
  Color" single-color picker (`theme.color`) exactly as before — merchants
  who only want one hand-picked color are unaffected.
- Whichever source wins, the result is written to the same
  `--color-primary`/`-dark`/`-light`/`-text`/`-reverse` custom properties
  every component already consumes through the `color()` Sass function —
  so **zero component code branches on which preset is active**; presets
  are a pure data layer on top of the existing color system.
- The resolved primary color also drives `<meta name="theme-color">` (the
  mobile browser chrome tint), so switching presets re-themes the OS-level
  UI too, not just the page content.

### 6.3c Layout systems & the Design System Theme Settings

A second premium pass added *structural* choice on top of §6.3a's visual
polish — every option below is a presentation-only variant of the exact same
real markup/data, switched entirely from Theme Settings/the home builder
(no rebuild, no code edit):

- **8 header layouts** (`header_layout` Theme Setting) — `classic`,
  `centered_nav`, `nav_end`, `logo_center` (two-row), `split_actions`
  (icons split via `display: contents` + flex `order`, no markup
  duplication), `minimal` (nav collapses to the drawer at every breakpoint),
  `compact`, and `boxed` (floating rounded bar — deliberately never sets
  `overflow` so the mega menu can still spill outside it). Selector target:
  `.header[data-header-layout="…"]`, styles in
  `assets/styles/layout/_header-layouts.scss`.
- **8 footer layouts** (`footer_layout`) — `classic`, `centered`, `compact`,
  `columns_equal`, `stacked_bottom`, `boxed`, `minimal`, `inline_links`.
  Selector target: `.footer[data-footer-layout="…"]`, styles in
  `assets/styles/layout/_footer-layouts.scss`.
- **10 hero-banner layouts** — a `layout` field on the `home.hero-banner`
  component itself (not a global Theme Setting, since it's per-component):
  `fullwidth` (default), `fullscreen`, `split`/`split_reverse` (image
  confined to one half via CSS Grid, text switches to the adaptive
  `$surface-0`/`$text-*` tokens instead of on-image white), `boxed`,
  `centered_overlay`, `minimal_text`, `card_stack` (floating opaque text
  card), `side_stripe`, and `bottom_banner` (short promo-strip aspect
  ratio). Selector target: `.hero-banner[data-hero-layout="…"]`, styles in
  `assets/styles/components/_hero-layouts.scss`.
- **5 product card styles** (`product_card_style`) — `standard`, `minimal`,
  `overlay` (Noon-style gradient-scrim tile), `bordered`, `compact`.
  Selector target: `[data-product-card-style="…"]` on `<html>`, styles
  appended to `assets/styles/components/_product-card.scss`.
- **Banner Builder** (`home.banner-grid` component) — a `banners` collection
  field (`minLength: 1`, `maxLength: 24` — effectively unlimited within
  Salla's Partners Portal collection UI) where each banner picks its own
  `size` (`full`/`half`/`third`) against a shared 6-column grid, so
  merchants compose flexible promo layouts (one full-width banner, two
  halves, three thirds, any mix) with real images/links, no code involved.
- **Design system tokens** (`radius_style`, `shadow_style`,
  `spacing_density`, `font_scale`, `button_style`) — resolved once in
  `partials/utility/design-system-vars.twig` into `--radius-scale`/
  `--shadow-scale`/`--space-scale`/`--font-scale` custom properties (plus
  `data-btn-style`/`data-product-card-style` attributes on `<html>`).
  `abstracts/_variables.scss` multiplies every `$radius-*`/`$shadow-*`
  value and every `$spacers` step by the matching CSS variable via
  `calc()`, and `base/_typography.scss` applies `--font-scale` to the root
  `font-size` — so **every existing component gets the new scales for
  free**, with no per-component changes and no specificity wars. `$radius-
  pill` is intentionally excluded (a shape token, not a degree of
  rounding), and the header/footer/hero's permanently-dark brand chrome
  keeps its fixed literal colors as documented in §6.3, unaffected by
  `[data-theme]`.
- **Animation system additions** — `base/_page-transitions.scss` opts every
  same-origin navigation into the native `@view-transition { navigation:
  auto; }` cross-document transition (Chrome/Edge 126+; unsupported
  browsers simply ignore the at-rule and navigate exactly as before — zero
  JS, zero risk). `js/modules/ripple.js` adds a Material-style press
  ripple to `.btn`/`.s-infinite-scroll-btn` only (Salla web components are
  deliberately excluded so their internal shadow-DOM markup, e.g. a
  cart-count badge, is never clipped). `utilities/_helpers.scss` extends
  `[data-reveal]` with `="left"/"right"/"zoom"` directional variants (same
  `scroll-reveal.js`, CSS-only). `partials/product/card.twig` crossfades to
  a product's real second uploaded photo on hover when one exists (`(hover:
  hover)`-gated, silently skipped for single-image products).

### 6.4 RTL / LTR strategy

CSS logical properties (`margin-inline-start`, `padding-inline`,
`inset-inline-end`, `text-align: start`, ...) are used exclusively — a
single compiled stylesheet is correct in both `dir="rtl"` and `dir="ltr"`
contexts. Verified: zero occurrences of physical-direction properties
(`left`/`right`/`margin-left`/`margin-right`/`float`) anywhere in
`src/assets/styles/`. The `rtl()`/`ltr()` mixins exist only for the rare
cases logical properties cannot express (e.g. mirroring a directional icon).

### 6.5 Accessibility baseline (`base/_accessibility.scss`)

- `:focus-visible` outline on every interactive element by default.
- `.skip-link` — hidden until focused, then rendered above all content,
  present on every page via `master.twig`.
- `.sr-only`/`.sr-only-focusable` utilities for assistive-tech-only content
  (e.g. the homepage's screen-reader-only `<h1>`).
- `prefers-contrast: more` widens the focus ring automatically.
- `prefers-reduced-motion: reduce` is honored globally, plus explicitly in
  the carousel, back-to-top scroll behavior, and Dark Mode transitions.
- Every icon-only interactive control (search, cart, wishlist, theme
  toggle, back-to-top, mobile menu, copy-to-clipboard) has an `aria-label`
  or visually-hidden text.

## 7. JavaScript architecture

```
core/  →  utils/  →  modules/  →  app.js
```

| Folder | Contents |
|---|---|
| `core/` | `config.js` (reads `dir`/`lang`/preview-mode from the rendered document), `dom.js` (`qs`/`qsa`/`onReady`), `events.js` (internal pub/sub bus). |
| `utils/` | `debounce.js`, `breakpoints.js` (JS-side mirror of the SCSS breakpoint map). |
| `modules/` | `header.js` (sticky/announcement/mega-menu/mobile nav), `carousel.js` (`IntersectionObserver`-driven, used by hero/testimonials/blog sliders), `wishlist.js` (`salla.wishlist.toggle` + `salla.event.wishlist.onAdded`), `theme-mode.js` (Dark Mode toggle + persistence), `back-to-top.js`, `clipboard.js` (order reference copy), `youtube-facade.js` (click-to-load video embeds), `sticky-add-to-cart.js` (`IntersectionObserver` sentinel toggling the fixed mobile/desktop add-to-cart bar), `scroll-reveal.js` (`IntersectionObserver`-driven, staggered fade-in for `[data-reveal]` elements; no-op under `prefers-reduced-motion`). |
| `app.js` | Single entry point; imports and initializes every module above on `DOMContentLoaded`. There is no secondary per-page bundle — homepage-only behavior (e.g. carousels) is initialized unconditionally since the relevant DOM nodes are simply absent on other pages. |

No global namespace pollution: every file is an ES module, bundled by
Webpack/Babel per `.browserslistrc`.

## 8. Localization (`src/locales/`)

- `ar.json`/`en.json` hold **flat, dot-namespaced** translation keys
  (Salla's actual convention — keys like `"pages.cart.title"` are literal
  JSON keys, not nested objects), consumed in Twig via `trans('key')`.
- 125 keys total, exact 1:1 parity between both files — verified by an
  automated scan of every `trans()` call across all 38 `.twig` view files,
  checked in both directions (zero keys referenced-but-missing, zero keys
  defined-but-unused in either language).
- Keys are namespaced by area: `a11y.*`, `nav.*`, `header.*`, `common.*`
  (incl. Salla's own `common.elements.*`/`common.errors.*` convention),
  `carousel.*`, `home.*`, `product.*`, `footer.*`, `pages.*` (further
  namespaced per page: `products`, `categories`, `cart`, `brands`,
  `wishlist`, `account`, `profile`, `orders`, `thank_you`, `contact`,
  `blog`, `offer`, `loyalty`), `blocks.*`.

## 9. Views architecture

### 9.1 Layouts (`src/views/layouts/`)

- **`master.twig`** — the single HTML shell every page extends. Sets
  `<html lang>`/`<html dir>` from real store/theme data; applies the Dark
  Mode anti-FOUC bootstrap; exposes `theme.color.*`/`theme.font.*` as CSS
  custom properties; preserves all required head/body hooks
  (`head:start`, `head`, `head:end`, `body:start`, `body:end`); renders the
  skip link, header component, `<main>` content block, footer component,
  and the conditionally-enabled back-to-top/WhatsApp utilities. Exposes
  override blocks: `title`, `meta_description`, `canonical`, `head_scripts`,
  `styles`, `header`, `content`, `footer`, `scripts`.
- **`customer.twig`** — extends `master.twig`; wraps every
  `views/pages/customer/**` page with a consistent sidebar (avatar/name/
  email summary + profile/orders/wishlist/notifications/logout nav using
  `page()`/`is_page()` for links and active-state) and sets `noindex` on
  the whole account area via its own `head_scripts` block (private,
  no SEO value). Child pages only implement `{% block account_content %}`.

### 9.2 Partials vs. components — the dividing line

| | Partials (`views/partials`) | Components (`views/components`) |
|---|---|---|
| Rendered via | `{% include 'partials.a.b' %}` | `{% component 'a.b' %}` |
| Configurable by merchant in Partners Portal | No | Yes (via `twilight.json` `settings`/`fields`) |
| Examples | skip link, product card/options, nav menu-tree, back-to-top, WhatsApp button | header, footer, comments, every `home/*` homepage section |

### 9.3 Pages (`src/views/pages/`)

Salla's Twilight router uses a **fixed page-file convention** — filenames
and paths are not arbitrary. Every page below maps 1:1 to Salla's
documented page templates; there is intentionally **no** `search.twig`,
`offers.twig`, or `404.twig`, because Salla does not support them (see the
note at the end of this section).

| Page | File | Notes |
|---|---|---|
| Home | `pages/index.twig` | Renders every enabled Theme Feature/custom component in merchant-configured order; screen-reader-only `<h1>`; `Organization` JSON-LD. |
| Product (single) | `pages/product/single.twig` | Gallery, options, quantity, add-to-cart, size guide, reviews, related products; `Product` JSON-LD with `Offer`/`AggregateRating`. |
| Category / Search / Offers listing | `pages/product/index.twig` | One template serves all three per Salla's own convention; sort, sub-category chips, infinite scroll; search results marked `noindex`. |
| Cart | `pages/cart.twig` | Live item list, remove/quantity via `salla.cart.removeItem`, summary totals, checkout CTA; `noindex`. |
| Thank you | `pages/thank-you.twig` | Order confirmation, copy-to-clipboard reference, `salla.order.show()`, order summary; `noindex`. |
| Customer profile | `pages/customer/profile.twig` | `salla.form.onSubmit('profile.update', ...)`, `salla-verify-modal` for verification flows. |
| Customer orders | `pages/customer/orders/{index,single}.twig` | Infinite-scroll list; single order detail with `salla-order-totals-card`, reorder/cancel modals, pay-now for pending payment. |
| Customer wishlist | `pages/customer/wishlist.twig` | `<salla-products-list source="wishlist">`. |
| Customer notifications | `pages/customer/notifications.twig` | Infinite-scroll notification feed. |
| Brands | `pages/brands/{index,single}.twig` | A–Z grouped listing; single brand detail + its products via `<salla-products-list source="brands">`; canonical/OG. |
| Blog | `pages/blog/{index,single}.twig` | Optional featured slider, category chips, infinite scroll; single article with tags/related/comments; `BlogPosting` JSON-LD. |
| Static pages | `pages/page-single.twig` | About/FAQ/Terms/Privacy render raw CMS content; Contact (slug-detected) renders `salla-contacts`/`salla-social` + a real `contact.send` form; shared `comments` component. |
| Landing / campaign page | `pages/landing-page.twig` | Salla's dedicated offer/campaign template; implements the documented `{% if not landing %}` → 404 and `landing.is_expired` → "offer finished" branches, countdown via `salla-count-down`, included products, optional store-features/testimonials sections. |
| Loyalty program | `pages/loyalty.twig` | Points balance, ways-to-earn grid (share/rate/order/complete-profile actions), and a `salla-slider`-based redeemable-prizes carousel per prize group; `salla-loyalty` widget triggers the redeem modal; guarded with a `{% if not loyalty %}` empty state for stores without an active program. |

**Why there's no dedicated Search/Offers/404 page:** Salla's Twilight
router is a closed, fixed set of page files (confirmed against the
official Salla Twilight directory-structure documentation).
Search results and offer listings are backend-selected *data* fed into the
same `product/index.twig` template as category listings (differentiated at
render time via the `search_query`/`category` variables); "page not found"
states are handled inline per-template (`{% if not <entity> %}`) rather
than via a separate error page — `landing-page.twig` is the one official
example of this pattern, reused here.

## 10. Build & preview workflow

```bash
npm install
npm run watch          # webpack --mode development --watch
salla theme preview    # separate terminal — Salla CLI live preview
```

Production artifacts: `npm run production` (minified CSS/JS, no source
maps) — the command used prior to `salla theme push`/Partners Portal
publish flows.

## 11. Quality gates passed

- `npm run lint:js` — 0 errors (ESLint).
- `npm run lint:css` — 0 errors (Stylelint, `stylelint-config-standard-scss`).
- `npm run build` — clean production compile (Webpack 5).
- `npm audit` — 0 vulnerabilities (`copy-webpack-plugin`/
  `css-minimizer-webpack-plugin` upgraded off a transitive
  `serialize-javascript` advisory found during the production audit below).
- Locale audit — every `trans()` key referenced from Twig/JS resolves in both
  `ar.json` and `en.json`, with zero unused/dead keys in either file.
- Twig tag-balance audit — every `{% if/endif %}`, `{% for/endfor %}`,
  `{% block/endblock %}` pair (and `{{ }}`/`{# #}` delimiter) balanced across
  all 48 view files.
- Zero physical-direction CSS properties (`left`/`right`/`margin-left`/
  `margin-right`/`float`/`text-align: left|right`) anywhere in
  `src/assets/styles/` — 100% logical properties.
- `theme.settings.get()`/component-field audit — every key read from Twig
  exists in `twilight.json`, and every setting/field declared in
  `twilight.json` is read somewhere (no dead settings).
- XSS audit — every `|raw` use in Twig is either JSON-LD (`|json_encode|raw`)
  or merchant-authored CMS HTML (`page.content`, `article.body`,
  `product.description`, `order.instructions`) exactly as the official
  Twilight theme does; every `.innerHTML` write in JS (`compare.js`,
  `live-search.js`, `recently-viewed.js`) passes dynamic values through
  `escapeHtml()` first.

### 11.1 Full production audit (this pass)

A dedicated audit pass reviewed every file for Twilight compatibility, broken
Twig, missing settings/translations, performance, accessibility, RTL/LTR,
mobile responsiveness, SEO, security, duplicate/dead code, and unused assets.
Findings and fixes:

- **Stylelint** — fixed 13 pre-existing lint errors (`scss/comment-no-empty`
  stray `//` separator lines, `at-rule-empty-line-before`,
  `declaration-block-no-redundant-longhand-properties`,
  `double-slash-comment-empty-line-before`); `npm run lint` is now 0/0.
- **Security (dependencies)** — `npm audit` found a high-severity
  `serialize-javascript` RCE/DoS advisory via `copy-webpack-plugin`/
  `css-minimizer-webpack-plugin` (build-time only, never shipped to the
  browser). Upgraded both to their latest majors
  (`copy-webpack-plugin@14`, `css-minimizer-webpack-plugin@8`); build
  re-verified clean afterwards.
- **Accessibility** — the Thank You page's "copy order number" button had a
  bare icon + the order number as its only content (no explicit action
  label), unlike the equivalent, already-correct button on the Loyalty page.
  Added `pages.thank_you.copy_reference` to both locales and wired it as
  `aria-label` for parity.
- **SEO** — `pages/blog/index.twig` was the one listing page missing a
  `{% block canonical %}`; added `<link rel="canonical" href="{{ page('blog') }}">`.
  Added global `og:site_name`/`og:locale` tags to `layouts/master.twig` so
  every page carries them without every page needing to redeclare them.
- **Everything else checked clean, no changes needed**: Twig tag balance,
  settings/component-field cross-reference (twilight.json ⇄ templates in both
  directions), translation key cross-reference (both directions) and unused
  translation check, orphaned Twig/SCSS/JS file check (all "orphans" were
  false positives from Salla's `{% component 'x.y' %}` tag / webpack entry
  files, verified by hand), RTL/LTR logical-property usage, `target="_blank"`
  usage (none present), dead-code markers (`console.log`/`debugger`/
  `TODO`/`FIXME` — none found), heading hierarchy (the two pages that looked
  like they had >1 `<h1>` were a false positive from a code comment and
  mutually-exclusive `{% if/elseif/else %}` states, respectively), and
  breakpoint usage (every width-based media query goes through the
  `breakpoint-up`/`breakpoint-down` mixins; raw `@media` is used only for
  feature queries — `hover`, `prefers-reduced-motion`, `prefers-contrast`,
  `prefers-reduced-transparency`).

## 12. Explicitly out of scope

- Brand visual identity assets (logo, product photography, icon artwork) —
  supplied by the merchant at install time via the Partners Portal, never
  hardcoded into the theme.
- Anything requiring a live Salla store/API session to generate (real
  product/order/customer data) — all templates are written against Salla's
  documented Twig variable contracts and were validated statically, not
  against a live store, since this is a theme deliverable, not a store
  deployment.
