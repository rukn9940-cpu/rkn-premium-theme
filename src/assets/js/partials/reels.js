/**
 * Homepage Reels section — click-to-play modal.
 *
 * Supports:
 *  - Direct video files (.mp4/.webm/.ogg) → native <video>
 *  - YouTube / Vimeo urls → embedded iframe
 *  - Any other url → best-effort iframe embed
 */
class ReelsPlayer {
    constructor() {
        this.modal = null;
        this.bindCards();
    }

    bindCards() {
        document.querySelectorAll('[data-rkn-reel]').forEach((card) => {
            card.addEventListener('click', () => this.open(card.dataset));
        });
    }

    youtubeId(url) {
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
        return match ? match[1] : null;
    }

    vimeoId(url) {
        const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
        return match ? match[1] : null;
    }

    isDirectVideo(url) {
        return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
    }

    buildMedia(videoUrl) {
        if (this.isDirectVideo(videoUrl)) {
            return `<video src="${videoUrl}" controls autoplay playsinline class="rkn-reel-modal__video"></video>`;
        }

        const ytId = this.youtubeId(videoUrl);
        if (ytId) {
            return `<iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1&playsinline=1" title="reel" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen class="rkn-reel-modal__iframe"></iframe>`;
        }

        const vimeoId = this.vimeoId(videoUrl);
        if (vimeoId) {
            return `<iframe src="https://player.vimeo.com/video/${vimeoId}?autoplay=1" title="reel" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen class="rkn-reel-modal__iframe"></iframe>`;
        }

        return `<iframe src="${videoUrl}" title="reel" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen class="rkn-reel-modal__iframe"></iframe>`;
    }

    ensureModal() {
        if (this.modal) return this.modal;

        const modal = document.createElement('div');
        modal.className = 'rkn-reel-modal';
        modal.innerHTML = `
            <div class="rkn-reel-modal__backdrop" data-rkn-reel-close></div>
            <div class="rkn-reel-modal__box">
                <button type="button" class="rkn-reel-modal__close" data-rkn-reel-close aria-label="${salla.lang.get('blocks.reels.close')}">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 6l12 12M18 6L6 18"></path></svg>
                </button>
                <div class="rkn-reel-modal__media"></div>
                <div class="rkn-reel-modal__footer"></div>
            </div>`;
        document.body.appendChild(modal);

        modal.querySelectorAll('[data-rkn-reel-close]').forEach((el) => {
            el.addEventListener('click', () => this.close());
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') this.close();
        });

        this.modal = modal;
        return modal;
    }

    open({ videoUrl, title, link }) {
        if (!videoUrl) return;
        const modal = this.ensureModal();

        modal.querySelector('.rkn-reel-modal__media').innerHTML = this.buildMedia(videoUrl);

        const footer = modal.querySelector('.rkn-reel-modal__footer');
        footer.innerHTML = '';
        if (link) {
            const a = document.createElement('a');
            a.href = link;
            a.className = 'rkn-reel-modal__cta';
            a.textContent = title || '';
            footer.appendChild(a);
        }

        modal.classList.add('is-open');
        document.body.classList.add('rkn-reel-open');
    }

    close() {
        if (!this.modal) return;
        this.modal.classList.remove('is-open');
        document.body.classList.remove('rkn-reel-open');
        // stop playback by clearing the media container
        this.modal.querySelector('.rkn-reel-modal__media').innerHTML = '';
    }
}

salla.onReady(() => {
    if (window.enable_reels === false) return;
    new ReelsPlayer();
});
