# Images

Static raster/vector imagery consumed directly by Twig views (logos, placeholders,
backgrounds). Copied verbatim to `public/images/` by `webpack.config.js` — this
folder is **not** processed by loaders.

## Conventions

- Use kebab-case file names: `store-placeholder.png`, `empty-cart.svg`.
- Prefer `.svg` for icons/illustrations and `.webp`/`.avif` for photographic
  assets to protect Core Web Vitals (LCP/CLS); keep a `.jpg`/`.png` fallback
  only when browser support requires it.
- Never commit unoptimized exports — run assets through an optimizer
  (e.g. SVGO, Squoosh) before adding them.
- Do not hardcode dimensions in file names; set `width`/`height` (or
  `aspect-ratio`) at the markup/CSS level to avoid layout shift.
- No demo/sample product photography belongs in this repository — brand
  imagery is supplied by the merchant. The one exception is
  `placeholder.svg`, a real UI fallback (not fake content) rendered by
  `pages/blog/{index,single}.twig` in place of an article's cover image
  when the merchant hasn't uploaded one — the exact pattern documented by
  Salla itself for the Blog Listing/Single Article templates.
