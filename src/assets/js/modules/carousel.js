/**
 * Carousel
 * --------
 * Lightweight, dependency-free scroll-snap carousel controller.
 *
 * The markup's `.carousel__track` is a real scrollable element (native
 * momentum scrolling + keyboard/trackpad/touch support for free); this class
 * only layers optional prev/next buttons, dot pagination, and autoplay on
 * top, using IntersectionObserver to know which slide is active instead of
 * computing pixel math by hand.
 *
 * Markup contract (see styles/components/_carousel.scss):
 *   <div class="carousel" data-carousel data-autoplay="5000">
 *     <div class="carousel__viewport">
 *       <ul class="carousel__track">
 *         <li class="carousel__slide">…</li>
 *       </ul>
 *     </div>
 *     <button data-carousel-prev>…</button>
 *     <button data-carousel-next>…</button>
 *     <div data-carousel-dots></div>
 *   </div>
 */
export class Carousel {
  /** @param {HTMLElement} root */
  constructor(root) {
    this.root = root;
    this.track = root.querySelector('.carousel__track');
    this.slides = this.track ? Array.from(this.track.children) : [];
    this.prevBtn = root.querySelector('[data-carousel-prev]');
    this.nextBtn = root.querySelector('[data-carousel-next]');
    this.dotsHost = root.querySelector('[data-carousel-dots]');
    this.autoplayDelay = Number(root.dataset.autoplay) || 0;
    this.activeIndex = 0;
    this.autoplayTimer = null;

    if (!this.track || this.slides.length < 2) {
      this.prevBtn?.setAttribute('disabled', '');
      this.nextBtn?.setAttribute('disabled', '');
      return;
    }

    this._buildDots();
    this._bindControls();
    this._observeSlides();

    if (this.autoplayDelay > 0) {
      this._bindAutoplayPause();
      this._startAutoplay();
    }
  }

  goTo(index) {
    const slide = this.slides[Math.max(0, Math.min(index, this.slides.length - 1))];
    slide?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  }

  next() {
    this.goTo(this.activeIndex + 1 >= this.slides.length ? 0 : this.activeIndex + 1);
  }

  prev() {
    this.goTo(this.activeIndex - 1 < 0 ? this.slides.length - 1 : this.activeIndex - 1);
  }

  _buildDots() {
    if (!this.dotsHost) return;

    this.dots = this.slides.map((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel__dot';
      dot.setAttribute('aria-label', `${index + 1}`);
      dot.addEventListener('click', () => this.goTo(index));
      this.dotsHost.append(dot);
      return dot;
    });
  }

  _bindControls() {
    this.prevBtn?.addEventListener('click', () => this.prev());
    this.nextBtn?.addEventListener('click', () => this.next());
  }

  _observeSlides() {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const index = this.slides.indexOf(entry.target);
          if (index === -1) return;
          this._setActive(index);
        });
      },
      { root: this.track, threshold: 0.6 }
    );

    this.slides.forEach(slide => observer.observe(slide));
    this._observer = observer;
  }

  _setActive(index) {
    this.activeIndex = index;
    this.dots?.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === index));
  }

  _startAutoplay() {
    this._stopAutoplay();
    this.autoplayTimer = window.setInterval(() => this.next(), this.autoplayDelay);
  }

  _stopAutoplay() {
    if (this.autoplayTimer) {
      window.clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  _bindAutoplayPause() {
    ['pointerenter', 'focusin'].forEach(eventName =>
      this.root.addEventListener(eventName, () => this._stopAutoplay())
    );
    ['pointerleave', 'focusout'].forEach(eventName =>
      this.root.addEventListener(eventName, () => this._startAutoplay())
    );

    if (typeof document.hidden === 'boolean') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this._stopAutoplay();
        } else {
          this._startAutoplay();
        }
      });
    }
  }
}

/** Instantiate a `Carousel` for every `[data-carousel]` element found in `root`. */
export function initCarousels(root = document) {
  root.querySelectorAll('[data-carousel]').forEach(el => new Carousel(el));
}
