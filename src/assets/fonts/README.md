# Fonts

Self-hosted webfont files (`.woff2` first, `.woff` fallback only if a target
audience genuinely requires it). Copied verbatim to `public/fonts/` by the
build and declared via `@font-face` in
`src/assets/styles/base/_typography.scss`.

## Conventions

- `.woff2` only unless analytics justify a legacy fallback format — it is
  smaller and universally supported by current browsers.
- Name files `{family}-{weight}-{style}.woff2`, e.g. `brand-sans-700.woff2`.
- Every `@font-face` declaration must set `font-display: swap` (or `optional`
  for above-the-fold brand fonts) to avoid blocking text rendering (CLS/LCP).
- Subset fonts to the scripts actually used (Arabic + Latin) to minimize
  transfer size.
- Merchants may also opt into Salla's predefined fonts via the `fonts`
  feature in `twilight.json` (`theme.font.name` / `theme.font.url`) instead
  of a custom self-hosted family — prefer that path unless brand guidelines
  require a bespoke typeface.
