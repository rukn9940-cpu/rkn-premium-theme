# Layouts

Root HTML shells that page templates extend.

- `master.twig` — the shell every page ultimately extends (directly or via
  another layout). Owns the document skeleton, head/body hooks, Dark Mode
  bootstrap, and the header/footer components.
- `customer.twig` — extends `master.twig`; adds the account-area sidebar
  (profile summary + nav) shared by every `views/pages/customer/**` page and
  marks the whole area `noindex`. Child pages implement
  `{% block account_content %}` instead of `{% block content %}`.

## Conventions

- Only add a new layout when a page genuinely needs a structurally
  different, *reused* shell (as `customer.twig` does for the account area)
  — not for one-off styling differences, which belong in
  `assets/styles/pages/`.
- Layouts define **structure and extension points** (`{% block %}`), never
  final visual content. Leave copy/markup decisions to the pages and
  components that fill each block.
- Always preserve the three head hooks (`head:start`, `head`, `head:end`)
  and the two body hooks (`body:start`, `body:end`) — Salla apps and
  merchant customizations rely on them being present on every page.
- Keep `<html lang>` / `<html dir>` driven by `store.language` / `theme.is_rtl`
  — never hardcode a direction or locale.
