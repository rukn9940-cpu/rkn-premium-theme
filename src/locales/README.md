# Locales

Translation strings used in Twig views via the `trans()`/`{{ 'key' | trans }}`
helpers. Salla renders `ar.json` for Arabic-language storefronts and
`en.json` for English-language storefronts; add further locale files here
only when the merchant enables additional storefront languages.

## Conventions

- Keys are namespaced by feature/scope with dot notation:
  `"<area>.<key>": "..."`, e.g. `"cart.empty_title"`, `"product.add_to_cart"`.
- Every key must exist in **every** locale file — an English fallback with a
  missing Arabic key (or vice versa) is treated as a bug.
- No copy is added speculatively: a key is introduced in the same change
  that adds the markup using it, so this file never accumulates unused or
  placeholder strings.
- Interpolation placeholders use Twilight's `:placeholder` (colon-prefixed)
  syntax, matching `trans(key, {'placeholder': value})`, e.g.
  `"cart.items_count": ":count عناصر"` / `"cart.items_count": ":count items"`.
