/**
 * RKN Premium Theme — Webpack build configuration.
 *
 * Responsible for compiling the theme's SCSS architecture and JavaScript
 * architecture (see src/assets) into the `/public` directory consumed by
 * Twilight at render time, and for syncing changes to Salla's live preview
 * via the official `@salla.sa/twilight` watcher during development.
 *
 * Design goals:
 *  - Predictable, cache-friendly output (contenthash) for Core Web Vitals.
 *  - Small, explicit entry graph — new entries are added deliberately as
 *    pages/components are built, never generated implicitly.
 *  - No framework lock-in: plain CSS/JS output, no runtime UI framework.
 */

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ThemeWatcher = require('@salla.sa/twilight/watcher.js');

const asset = (file = '') => path.resolve(__dirname, 'src/assets', file);
const publicPath = (file = '') => path.resolve(__dirname, 'public', file);

module.exports = (_env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: {
      app: [asset('styles/app.scss'), asset('js/app.js')],
    },

    output: {
      path: publicPath(),
      publicPath: '/',
      filename: '[name].js',
      chunkFilename: 'js/chunks/[name].[contenthash].js',
      clean: true,
    },

    devtool: isProduction ? false : 'source-map',

    stats: {
      modules: false,
      assetsSort: 'size',
      assetsSpace: 50,
    },

    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.s?css$/,
          use: [
            MiniCssExtractPlugin.loader,
            { loader: 'css-loader', options: { url: false, sourceMap: !isProduction } },
            { loader: 'postcss-loader', options: { sourceMap: !isProduction } },
            { loader: 'sass-loader', options: { sourceMap: !isProduction } },
          ],
        },
      ],
    },

    plugins: [
      new ThemeWatcher(),
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: 'styles/chunks/[name].[contenthash].css',
      }),
      new CopyPlugin({
        patterns: [
          { from: asset('images'), to: publicPath('images'), noErrorOnMissing: true },
          { from: asset('fonts'), to: publicPath('fonts'), noErrorOnMissing: true },
          { from: asset('icons'), to: publicPath('icons'), noErrorOnMissing: true },
        ],
      }),
    ],

    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: { comments: false },
          },
          extractComments: false,
        }),
        new CssMinimizerPlugin(),
      ],
    },

    performance: {
      hints: isProduction ? 'warning' : false,
    },
  };
};
