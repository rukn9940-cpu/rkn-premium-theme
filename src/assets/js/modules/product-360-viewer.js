/**
 * Interactive 360° Product Viewer
 * --------------------------------
 * Progressive enhancement for `[data-product-360]`: turns an ordered
 * sequence of real, merchant-uploaded product photos (Salla's own product
 * image gallery, shot in a full turn around the item — see
 * `product_360_enabled`/`product_360_min_frames` in Theme Settings, and the
 * eligibility check in `views/pages/product/single.twig`) into a
 * drag/touch/gyroscope-controlled spin viewer with pinch/wheel zoom and
 * fullscreen. The first frame is already rendered server-side as a plain
 * `<img>`, so visitors without JS — or before this module finishes loading —
 * simply see a normal product photo.
 *
 * Pointer Events unify mouse, touch, and pen input in a single code path.
 * Frames are preloaded up front (they're already merchant-optimized product
 * photos, typically small) so spinning never waits on the network.
 */
import { qs, qsa } from '../core/dom.js';

const ROOT_SELECTOR = '[data-product-360]';
const PX_PER_FRAME = 6;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const HINT_AUTO_HIDE_MS = 4000;

class Product360Viewer {
  constructor(root) {
    this.root = root;
    this.frames = this.#parseFrames(root.dataset.frames);
    this.frameEl = qs('[data-product-360-frame]', root);

    if (this.frames.length < 2 || !this.frameEl) return;

    this.hintEl = qs('[data-product-360-hint]', root);
    this.progressEl = qs('[data-product-360-progress]', root);
    this.gyroButton = qs('[data-product-360-gyro]', root);
    this.fullscreenButton = qs('[data-product-360-fullscreen]', root);
    this.zoomInButton = qs('[data-product-360-zoom-in]', root);
    this.zoomOutButton = qs('[data-product-360-zoom-out]', root);

    this.currentIndex = 0;
    this.zoom = 1;
    this.pan = { x: 0, y: 0 };
    this.loadedCount = 0;
    this.isDragging = false;
    this.dragStart = null;
    this.pointers = new Map();
    this.pinchStartDistance = null;
    this.pinchStartZoom = 1;
    this.gyroActive = false;
    this.gyroBaseline = null;

    this.frameEl.draggable = false;

    this.#preload();
    this.#bindPointerEvents();
    this.#bindWheelZoom();
    this.#bindControls();

    if (this.hintEl) {
      window.setTimeout(() => this.#hideHint(), HINT_AUTO_HIDE_MS);
    }
  }

  #parseFrames(raw) {
    try {
      const parsed = JSON.parse(raw || '[]');
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  #preload() {
    this.frames.forEach(src => {
      const img = new Image();
      img.decoding = 'async';
      img.addEventListener('load', () => this.#trackLoaded(), { once: true });
      img.addEventListener('error', () => this.#trackLoaded(), { once: true });
      img.src = src;
    });
  }

  #trackLoaded() {
    this.loadedCount += 1;
    const percent = Math.round((this.loadedCount / this.frames.length) * 100);
    this.progressEl?.style.setProperty('--product-360-progress', `${percent}%`);
    if (this.loadedCount === this.frames.length) {
      this.root.classList.add('is-ready');
    }
  }

  #setFrame(index) {
    const total = this.frames.length;
    this.currentIndex = ((index % total) + total) % total;
    this.frameEl.src = this.frames[this.currentIndex];
  }

  #applyTransform() {
    this.frameEl.style.transform = `scale(${this.zoom}) translate(${this.pan.x}px, ${this.pan.y}px)`;
  }

  #hideHint() {
    this.hintEl?.classList.add('is-hidden');
  }

  #bindPointerEvents() {
    this.root.style.touchAction = 'pan-y';

    this.root.addEventListener('pointerdown', event => {
      this.pointers.set(event.pointerId, event);
      this.root.setPointerCapture?.(event.pointerId);

      if (this.pointers.size === 2) {
        this.isDragging = false;
        this.pinchStartDistance = this.#getPinchDistance();
        this.pinchStartZoom = this.zoom;
        return;
      }

      this.isDragging = true;
      this.#hideHint();
      this.dragStart = {
        x: event.clientX,
        y: event.clientY,
        index: this.currentIndex,
        pan: { ...this.pan },
      };
    });

    this.root.addEventListener('pointermove', event => {
      if (!this.pointers.has(event.pointerId)) return;
      this.pointers.set(event.pointerId, event);

      if (this.pointers.size === 2) {
        this.#handlePinch();
        return;
      }

      if (!this.isDragging || !this.dragStart) return;

      const deltaX = event.clientX - this.dragStart.x;

      if (this.zoom > 1) {
        const deltaY = event.clientY - this.dragStart.y;
        this.pan = {
          x: this.dragStart.pan.x + deltaX / this.zoom,
          y: this.dragStart.pan.y + deltaY / this.zoom,
        };
        this.#applyTransform();
        return;
      }

      // Dragging right rewinds the turntable (mirrors real-world "spin the
      // object toward me" intuition) — direction is identical in RTL/LTR
      // since it's driven by pointer coordinates, not text direction.
      const frameOffset = -Math.trunc(deltaX / PX_PER_FRAME);
      this.#setFrame(this.dragStart.index + frameOffset);
    });

    const endPointer = event => {
      this.pointers.delete(event.pointerId);
      if (this.pointers.size < 2) this.pinchStartDistance = null;
      if (this.pointers.size === 0) {
        this.isDragging = false;
        this.dragStart = null;
      }
    };

    this.root.addEventListener('pointerup', endPointer);
    this.root.addEventListener('pointercancel', endPointer);
    this.root.addEventListener('pointerleave', endPointer);
  }

  #getPinchDistance() {
    const [a, b] = Array.from(this.pointers.values());
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }

  #handlePinch() {
    if (this.pinchStartDistance == null) return;
    const ratio = this.#getPinchDistance() / this.pinchStartDistance;
    this.#setZoom(this.pinchStartZoom * ratio);
  }

  #bindWheelZoom() {
    this.root.addEventListener(
      'wheel',
      event => {
        event.preventDefault();
        this.#setZoom(this.zoom - event.deltaY * 0.0015);
      },
      { passive: false }
    );
  }

  #setZoom(value) {
    this.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
    if (this.zoom === 1) this.pan = { x: 0, y: 0 };
    this.#applyTransform();
    this.root.classList.toggle('is-zoomed', this.zoom > 1);
  }

  #bindControls() {
    this.zoomInButton?.addEventListener('click', () => this.#setZoom(this.zoom + 0.5));
    this.zoomOutButton?.addEventListener('click', () => this.#setZoom(this.zoom - 0.5));

    this.fullscreenButton?.addEventListener('click', () => this.#toggleFullscreen());
    document.addEventListener('fullscreenchange', () => {
      const isFullscreen = document.fullscreenElement === this.root;
      this.root.classList.toggle('is-fullscreen', isFullscreen);
      this.fullscreenButton?.setAttribute('aria-pressed', String(isFullscreen));
    });

    this.#bindGyro();
  }

  #toggleFullscreen() {
    if (document.fullscreenElement === this.root) {
      document.exitFullscreen?.();
      return;
    }

    const request = this.root.requestFullscreen || this.root.webkitRequestFullscreen;
    request?.call(this.root);
  }

  #bindGyro() {
    if (!this.gyroButton || typeof DeviceOrientationEvent === 'undefined') return;

    this.gyroButton.hidden = false;

    this.gyroButton.addEventListener('click', async () => {
      if (this.gyroActive) {
        this.#disableGyro();
        return;
      }

      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission !== 'granted') return;
        } catch {
          return;
        }
      }

      this.#enableGyro();
    });
  }

  #enableGyro() {
    this.gyroActive = true;
    this.gyroBaseline = null;
    this.gyroButton?.setAttribute('aria-pressed', 'true');
    this.#hideHint();
    window.addEventListener('deviceorientation', this.#handleGyro);
  }

  #disableGyro() {
    this.gyroActive = false;
    this.gyroButton?.setAttribute('aria-pressed', 'false');
    window.removeEventListener('deviceorientation', this.#handleGyro);
  }

  #handleGyro = event => {
    if (event.gamma == null) return;

    if (this.gyroBaseline == null) {
      this.gyroBaseline = event.gamma;
      return;
    }

    const delta = event.gamma - this.gyroBaseline;
    this.#setFrame(Math.trunc(delta / 2));
  };
}

export function initProduct360Viewer(root = document) {
  qsa(ROOT_SELECTOR, root).forEach(el => new Product360Viewer(el));
}

/**
 * Fullscreen toggle for the native 3D model viewer
 * (`[data-product-viewer-3d]`, Google `<model-viewer>`). Kept separate from
 * `Product360Viewer` since the 3D model already ships its own drag/zoom
 * (`camera-controls`) — this module only adds the one thing it's missing.
 */
const MODEL_VIEWER_ROOT_SELECTOR = '[data-product-viewer-3d]';

export function initProductViewer3d(root = document) {
  qsa(MODEL_VIEWER_ROOT_SELECTOR, root).forEach(container => {
    const button = qs('[data-viewer-fullscreen]', container);
    if (!button) return;

    button.addEventListener('click', () => {
      if (document.fullscreenElement === container) {
        document.exitFullscreen?.();
        return;
      }

      const request = container.requestFullscreen || container.webkitRequestFullscreen;
      request?.call(container);
    });

    document.addEventListener('fullscreenchange', () => {
      const isFullscreen = document.fullscreenElement === container;
      container.classList.toggle('is-fullscreen', isFullscreen);
      button.setAttribute('aria-pressed', String(isFullscreen));
    });
  });
}
