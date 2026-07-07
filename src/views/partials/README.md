# Partials

Small, non-themeable Twig fragments included with `{% include %}` — as
opposed to `views/components`, which are Twilight **components** registered
in `twilight.json` and rendered with `{% component %}` (configurable by
merchants from the Partners Portal).

Rule of thumb: if a merchant should never see it as a configurable "block"
(structural HTML, accessibility scaffolding, shared page fragments), it's a
partial. If it's a visual, merchant-configurable homepage/section block,
it's a component.

## Structure

- `accessibility/` — compliance scaffolding (skip link).
- `product/` — `card.twig` (shared product tile across listing/search/
  wishlist/related-products/landing-page) and `options.twig` (variant
  selectors on the single product page).
- `navigation/` — `menu-tree.twig` (recursive mega-menu/mobile-menu item
  renderer).
- `utility/` — `back-to-top.twig` and `whatsapp-button.twig`, both
  conditionally included from `layouts/master.twig` behind Theme Settings;
  `theme-color-vars.twig`, which resolves the active Color Preset (or
  Salla's native color picker) into the `--color-primary*` custom
  properties every component reads.

SEO metadata (canonical links, Open Graph tags, JSON-LD structured data) is
implemented **inline**, per page, inside each template's `head_scripts`
block rather than as shared partials — the JSON-LD shape differs
meaningfully per page type (`Organization` on the homepage, `Product` with
`Offer`/`AggregateRating` on the product page, `BlogPosting` on articles),
so a shared fragment would need as many conditional branches as there are
page types, adding indirection without reducing duplication.

## Conventions

- Name files for what they render, in kebab-case: `skip-link.twig`,
  `back-to-top.twig`.
- Referenced as `{% include 'partials.<folder>.<file>' %}` (dot notation
  mirrors the folder path, matching Twilight's component path convention).
- Partials must not fetch their own data — they render what's passed to
  them, keeping them trivially testable and reusable. Reading the
  always-available Twilight globals (`theme`, `store`, `trans()`) is fine
  and used throughout (e.g. `theme-color-vars.twig`, `back-to-top.twig`'s
  `aria-label`) — the rule is about not reaching for entity/API data a
  partial wasn't given.
