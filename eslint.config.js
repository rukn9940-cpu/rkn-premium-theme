const js = require('@eslint/js');

const browserGlobals = {
    window: 'readonly',
    document: 'readonly',
    navigator: 'readonly',
    location: 'readonly',
    history: 'readonly',
    console: 'readonly',
    fetch: 'readonly',
    URL: 'readonly',
    URLSearchParams: 'readonly',
    Blob: 'readonly',
    Image: 'readonly',
    FormData: 'readonly',
    CustomEvent: 'readonly',
    Event: 'readonly',
    HTMLElement: 'readonly',
    customElements: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    setInterval: 'readonly',
    clearInterval: 'readonly',
    requestAnimationFrame: 'readonly',
    IntersectionObserver: 'readonly',
    DecompressionStream: 'readonly',
    atob: 'readonly',
    btoa: 'readonly',
    localStorage: 'readonly',
    sessionStorage: 'readonly',
    MutationObserver: 'readonly',
    // Set on `window` by src/assets/js/partials/anime.js as a side effect of
    // importing animejs; app.js (which always loads first) pulls that
    // module in, so `anime` is a real global by the time other bundles run.
    anime: 'readonly',
};

// Globals injected by Salla's platform / master.twig inline scripts.
const sallaGlobals = {
    salla: 'readonly',
    app: 'writable',
    imageZoom: 'readonly',
    fslightbox: 'writable',
    can_access_wallet: 'readonly',
    enable_more_menu: 'readonly',
    enable_add_product_toast: 'readonly',
    notify_when_available_in_card: 'readonly',
    enable_reels: 'readonly',
    enable_product_videos: 'readonly',
    enable_product_360: 'readonly',
    product_360_min_images: 'readonly',
};

module.exports = [
    {
        ignores: ['public/**', 'node_modules/**', 'src/assets/js/twilight.js'],
    },
    js.configs.recommended,
    {
        files: ['src/assets/js/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: { ...browserGlobals, ...sallaGlobals },
        },
        rules: {
            'no-unused-vars': ['warn', { args: 'none' }],
        },
    },
    {
        files: ['webpack.config.js', 'postcss.config.js', 'tailwind.config.js', 'eslint.config.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: {
                module: 'readonly',
                require: 'readonly',
                __dirname: 'readonly',
                process: 'readonly',
            },
        },
    },
];
