/**
 * YouTube facade
 * ---------------
 * Wires up `[data-youtube-facade]` (the `home.video` custom component): sets
 * a thumbnail poster when the merchant didn't upload a custom one, and only
 * injects the real (heavy) YouTube iframe after the visitor clicks play —
 * keeps the initial page weight/Core Web Vitals unaffected by an unwatched
 * video embed.
 */
const SELECTOR = '[data-youtube-facade]';

function extractVideoId(url) {
  const match = url.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  return match ? match[1] : null;
}

function mount(container) {
  const url = container.dataset.youtubeUrl;
  const videoId = url && extractVideoId(url);
  if (!videoId) return;

  const poster = container.querySelector('.video-block__poster');
  if (!poster) {
    const img = document.createElement('img');
    img.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    img.alt = '';
    img.loading = 'lazy';
    img.width = 1280;
    img.height = 720;
    img.className = 'video-block__poster';
    container.prepend(img);
  }

  container.addEventListener(
    'click',
    () => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
      iframe.title = 'YouTube video player';
      iframe.setAttribute(
        'allow',
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
      );
      iframe.setAttribute('allowfullscreen', '');
      iframe.className = 'video-block__iframe';
      container.replaceChildren(iframe);
    },
    { once: true }
  );
}

export function initYoutubeFacade(root = document) {
  root.querySelectorAll(SELECTOR).forEach(mount);
}
