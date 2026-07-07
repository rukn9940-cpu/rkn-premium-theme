# Partials

Scripts that hydrate a single Twig partial/component 1:1 (mirrors
`views/partials` and `views/components`). Kept separate from `modules/`
because these are tightly coupled to one markup fragment rather than a
cross-cutting feature.

Currently empty: every component/partial built so far only needed
cross-cutting, feature-scoped behavior, which lives in `../modules/`
instead (e.g. `carousel.js` serves the hero banner, testimonials, and blog
sliders alike). Add a file here only when a component's behavior is truly
one-off and doesn't belong in a shared module.
