# Vendor

Small, hand-modified third-party scripts that aren't published to npm (and
therefore can't live in `package.json` dependencies). Anything installable
via npm belongs there instead so it stays versioned and auditable.

Currently empty — the theme has not needed any hand-modified third-party
script; every JS dependency used is either a published npm package (see
`package.json`) or one of Salla's own `salla-*` Web Components/JS SDK,
loaded by the platform itself.
