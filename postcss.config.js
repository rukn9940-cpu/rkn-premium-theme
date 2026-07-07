/**
 * PostCSS pipeline applied to the compiled SCSS output.
 * - autoprefixer: adds vendor prefixes based on `.browserslistrc`.
 * - postcss-preset-env: enables modern, spec-track CSS features safely.
 */
module.exports = {
  plugins: {
    'postcss-preset-env': {
      stage: 3,
      features: {
        'nesting-rules': false, // handled natively by Dart Sass
      },
    },
    autoprefixer: {},
  },
};
