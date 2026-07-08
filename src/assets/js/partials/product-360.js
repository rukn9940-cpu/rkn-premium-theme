/**
 * Product 360° viewer.
 *
 * Renders next to the gallery when the merchant enabled the feature and the
 * product has enough images (see `enable_product_360` /
 * `product_360_min_images` theme settings). Frames are the product's own
 * image sequence — the merchant is expected to upload a 24-36 shot rotation
 * set for a convincing spin.
 */
class Product360 {
    constructor(root) {
        this.root = root;
        this.stage = root.querySelector('[data-rkn-360-stage]');
        this.frameEl = root.querySelector('[data-rkn-360-frame]');
        const framesScript = root.querySelector('[data-rkn-360-frames]');

        try {
            this.frames = JSON.parse(framesScript?.textContent || '[]');
        } catch {
            this.frames = [];
        }

        if (!this.frames.length) return;

        this.index = 0;
        this.dragging = false;
        this.startX = 0;
        this.startIndex = 0;
        this.pxPerFrame = 6;

        this.bindToggle();
        this.bindDrag();
    }

    bindToggle() {
        this.root.querySelector('[data-rkn-360-toggle]')?.addEventListener('click', () => this.open());
        this.root.querySelector('[data-rkn-360-close]')?.addEventListener('click', () => this.close());
    }

    open() {
        this.stage.hidden = false;
        this.preload();
    }

    close() {
        this.stage.hidden = true;
    }

    preload() {
        this.frames.forEach((src) => {
            const img = new Image();
            img.src = src;
        });
    }

    setFrame(index) {
        const total = this.frames.length;
        this.index = ((index % total) + total) % total;
        this.frameEl.src = this.frames[this.index];
    }

    bindDrag() {
        const onDown = (event) => {
            this.dragging = true;
            this.startX = event.clientX ?? event.touches?.[0]?.clientX ?? 0;
            this.startIndex = this.index;
            this.stage.classList.add('is-dragging');
        };

        const onMove = (event) => {
            if (!this.dragging) return;
            const x = event.clientX ?? event.touches?.[0]?.clientX ?? 0;
            const delta = x - this.startX;
            const framesMoved = Math.trunc(delta / this.pxPerFrame);
            this.setFrame(this.startIndex - framesMoved);
        };

        const onUp = () => {
            this.dragging = false;
            this.stage.classList.remove('is-dragging');
        };

        this.frameEl.addEventListener('pointerdown', onDown);
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    }
}

salla.onReady(() => {
    if (window.enable_product_360 === false) return;
    document.querySelectorAll('.rkn-360').forEach((root) => new Product360(root));
});
