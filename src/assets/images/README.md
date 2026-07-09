# Images

Static raster/vector imagery consumed directly by Twig views (merchant-uploaded
assets referenced via Theme Settings, or structural UI only). Copied verbatim to
`public/images/` by `webpack.config.js` — this folder is **not** processed by
loaders.

## Conventions

- Use kebab-case file names.
- Prefer `.svg` for icons/illustrations and `.webp`/`.avif` for photographic
  assets to protect Core Web Vitals (LCP/CLS).
- Never commit unoptimized exports — run assets through an optimizer
  (e.g. SVGO, Squoosh) before adding them.
- Do not hardcode dimensions in file names; set `width`/`height` (or
  `aspect-ratio`) at the markup/CSS level to avoid layout shift.
- **No demo or stock imagery** belongs in this repository. All product, banner,
  hero, gallery, and promotional photography is supplied by the merchant via
  Theme Settings or Salla's own media manager. Missing blog covers render a
  neutral CSS surface (`blog-card__media-fallback`) — never a bundled image.
