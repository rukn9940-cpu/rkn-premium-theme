/**
 * Product Reels
 * -------------
 * Vertical, swipeable short-video feed (`home.product-reels` custom
 * component). Two independent `IntersectionObserver`s drive the experience:
 *
 *  - `loadObserver` (generous `rootMargin`) lazily assigns the real
 *    video/iframe `src` only once a slide is about to be scrolled into
 *    view, so unwatched reels never cost any network weight.
 *  - `playObserver` (tight `threshold`) starts playback only while a slide
 *    is substantially on-screen and immediately pauses it otherwise, so at
 *    most one reel is ever decoding video at a time.
 *
 * Respects `prefers-reduced-motion`: autoplay is skipped entirely and the
 * visitor can still start playback with a tap (handled by the generic
 * click-to-toggle listener below, which works with or without autoplay).
 */
const TRACK_SELECTOR = '[data-product-reels]';
const ITEM_SELECTOR = '[data-product-reel]';
const VIDEO_SELECTOR = '[data-product-reel-video]';
const SOUND_SELECTOR = '[data-product-reel-sound]';
const VISIBILITY_THRESHOLD = 0.6;

function extractYoutubeId(url) {
  const match = url.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  return match ? match[1] : null;
}

function loadSource(item) {
  if (item.dataset.reelLoaded) return;
  item.dataset.reelLoaded = 'true';

  const url = item.dataset.videoSrc;
  if (!url) return;

  const youtubeId = extractYoutubeId(url);

  if (youtubeId) {
    const video = item.querySelector(VIDEO_SELECTOR);
    const iframe = document.createElement('iframe');
    iframe.className = 'rkn-reels__iframe product-reels__iframe';
    iframe.dataset.youtubeId = youtubeId;
    iframe.title = '';
    iframe.setAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
    );
    video?.replaceWith(iframe);
    item.dataset.reelKind = 'youtube';
    return;
  }

  const video = item.querySelector(VIDEO_SELECTOR);
  if (video) {
    video.src = url;
    item.dataset.reelKind = 'video';
  }
}

function play(item) {
  if (item.dataset.reelKind === 'video') {
    item.querySelector(VIDEO_SELECTOR)?.play().catch(() => {});
    return;
  }

  if (item.dataset.reelKind === 'youtube') {
    const iframe = item.querySelector('.rkn-reels__iframe, .product-reels__iframe');
    const id = iframe?.dataset.youtubeId;
    if (iframe && id && !iframe.src) {
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&controls=0&playsinline=1&playlist=${id}`;
    }
  }
}

function pause(item) {
  if (item.dataset.reelKind === 'video') {
    item.querySelector(VIDEO_SELECTOR)?.pause();
    return;
  }

  if (item.dataset.reelKind === 'youtube') {
    const iframe = item.querySelector('.rkn-reels__iframe, .product-reels__iframe');
    if (iframe) iframe.src = '';
  }
}

function toggleSound(button) {
  const item = button.closest(ITEM_SELECTOR);
  const video = item?.querySelector(VIDEO_SELECTOR);
  if (!video) return;

  video.muted = !video.muted;
  button.setAttribute('aria-pressed', String(!video.muted));
  button.classList.toggle('is-unmuted', !video.muted);
}

function toggleManualPlayback(item) {
  loadSource(item);

  const video = item.querySelector(VIDEO_SELECTOR);
  if (video && video.src) {
    video.paused ? play(item) : pause(item);
    return;
  }

  play(item);
}

export function initProductReels(root = document) {
  const track = root.querySelector(TRACK_SELECTOR);
  if (!track) return;

  const items = Array.from(track.querySelectorAll(ITEM_SELECTOR));
  if (!items.length) return;

  track.addEventListener('click', event => {
    const soundButton = event.target.closest(SOUND_SELECTOR);
    if (soundButton) {
      toggleSound(soundButton);
      return;
    }

    if (event.target.closest('a, salla-add-product-button')) return;

    const item = event.target.closest(ITEM_SELECTOR);
    if (item) toggleManualPlayback(item);
  });

  if (!('IntersectionObserver' in window)) {
    items.forEach(loadSource);
    return;
  }

  const loadObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) loadSource(entry.target);
      });
    },
    { root: track, rootMargin: '150% 0px', threshold: 0.01 }
  );
  items.forEach(item => loadObserver.observe(item));

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const playObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= VISIBILITY_THRESHOLD) {
          play(entry.target);
        } else {
          pause(entry.target);
        }
      });
    },
    { root: track, threshold: [0, VISIBILITY_THRESHOLD, 1] }
  );
  items.forEach(item => playObserver.observe(item));
}
