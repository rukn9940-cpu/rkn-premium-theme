# Components

Twilight components: merchant-configurable UI blocks rendered with
`{% component 'folder.name' %}` and (for custom, non-built-in components)
declared under the `components` array in `twilight.json`, where each entry's
`path` maps directly to a file here (`"path": "home.rich-text"` →
`src/views/components/home/rich-text.twig`).

## Structure

- `header/header.twig` — sticky header: announcement bar, logo, mega menu,
  search trigger, dark-mode toggle, wishlist/cart/account icons, mobile
  off-canvas menu.
- `footer/footer.twig` — quick links, contact info, social links, payment
  method badges, newsletter/app links.
- `comments.twig` — shared comment form + list, included by both static
  pages (`{% component 'comments' with { type: 'page', id: page.id } %}`)
  and blog articles (`type: 'article'`).
- `home/` — homepage sections. Split into two kinds:
  - **Theme Features** (real Salla data — testimonials from customer
    feedback, store features from Partners Portal settings; no bundled demo
    content): `testimonials`, `store-features`.
  - **Salla catalog pickers** (merchant selects real categories/products/brands):
    `hero-banner`, `categories`, `featured-products`, `offers`, `brands`.
  - **Custom components** (merchant-authored content via `twilight.json`
    field schemas): `rich-text`, `gallery`, `video`, `product-reels`,
    `banner-grid` (the Banner Builder — unlimited full/half/third-width
    promo banners).

  `hero-banner` additionally exposes a `layout` field (10 options, e.g.
  `split`/`boxed`/`card_stack`) resolved as `data-hero-layout` and styled in
  `assets/styles/components/_hero-layouts.scss` — same real slide data in
  every layout, presentation only.

Product-card markup lives in `views/partials/product/card.twig` instead of
`views/components/` — it's a structural fragment reused verbatim across
listing/search/wishlist/related-products/landing-page contexts, not a
merchant-configurable block, so it follows the partials convention (see
`views/partials/README.md`).

## Conventions

- One component = one `.twig` file = one `<name>` entry in `twilight.json`
  (for custom components) or one Twilight Theme Feature (for built-in ones).
- Components receive their configured field values from `twilight.json`
  (custom components) or Salla-injected `items`/data (Theme Features) and
  must not fetch unrelated data themselves.
- Every component has a matching SCSS partial in
  `assets/styles/components/_<name>.scss`.
- Image fields always render `width`/`height` and a `loading` hint to
  prevent layout shift (CLS) and avoid blocking the critical render path.
- Every component wraps its output in `{% if <data> is not empty %}` so a
  merchant who hasn't configured it yet renders nothing rather than an
  empty shell.
