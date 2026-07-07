# Icons

Inline-friendly SVG icons (UI glyphs, not photographic content). Copied
verbatim to `public/icons/` by the build.

## Conventions

- One icon per file, kebab-case name matching its purpose: `arrow-start.svg`,
  `cart.svg`, `search.svg`.
- Author icons on a square, unpadded viewBox (e.g. `0 0 24 24`) so they scale
  predictably from CSS.
- Strip editor metadata and hardcoded `fill`/`width`/`height` attributes where
  possible so color and size are controllable via CSS (`currentColor`).
- Icons that only ever appear decoratively must be marked `aria-hidden="true"`
  when inlined in markup; icons that convey meaning on their own need an
  accessible name (`role="img"` + `<title>`, or adjacent visible/`sr-only`
  text) to satisfy WCAG AA.
- Do not check in icon fonts (e.g. Font Awesome) — this theme uses discrete
  SVGs to keep unused-icon payload out of the critical path.
