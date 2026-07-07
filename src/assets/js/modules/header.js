/**
 * Header
 * ------
 * Sticky scroll state, the mobile off-canvas drawer, its nested-menu
 * accordion, and the dismissible announcement bar. Desktop mega-menu reveal
 * is handled entirely in CSS (`:hover`/`:focus-within`) — no JS needed there.
 */
const ANNOUNCEMENT_DISMISSED_KEY = 'rkn:announcement-dismissed';
const SCROLLED_CLASS = 'header--scrolled';
const DRAWER_OPEN_CLASS = 'is-open';

function initStickyHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;

  let ticking = false;

  const update = () => {
    header.classList.toggle(SCROLLED_CLASS, window.scrollY > 8);
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    },
    { passive: true }
  );

  update();
}

function initAnnouncementBar() {
  const bar = document.querySelector('[data-announcement-bar]');
  if (!bar) return;

  if (window.localStorage.getItem(ANNOUNCEMENT_DISMISSED_KEY) === '1') {
    bar.remove();
    return;
  }

  bar.querySelector('[data-announcement-dismiss]')?.addEventListener('click', () => {
    window.localStorage.setItem(ANNOUNCEMENT_DISMISSED_KEY, '1');
    bar.remove();
  });
}

function initMobileDrawer() {
  const drawer = document.querySelector('[data-mobile-menu]');
  const openBtn = document.querySelector('[data-mobile-menu-open]');
  if (!drawer || !openBtn) return;

  const closeTriggers = drawer.querySelectorAll('[data-mobile-menu-close]');
  const panel = drawer.querySelector('.mobile-menu__panel');

  const open = () => {
    drawer.hidden = false;
    requestAnimationFrame(() => drawer.classList.add(DRAWER_OPEN_CLASS));
    document.documentElement.classList.add('has-open-drawer');
    openBtn.setAttribute('aria-expanded', 'true');
    panel?.querySelector('a, button')?.focus();
    document.addEventListener('keydown', onKeydown);
  };

  const close = () => {
    drawer.classList.remove(DRAWER_OPEN_CLASS);
    document.documentElement.classList.remove('has-open-drawer');
    openBtn.setAttribute('aria-expanded', 'false');
    openBtn.focus();
    document.removeEventListener('keydown', onKeydown);
    window.setTimeout(() => {
      if (!drawer.classList.contains(DRAWER_OPEN_CLASS)) drawer.hidden = true;
    }, 300);
  };

  const onKeydown = event => {
    if (event.key === 'Escape') close();
  };

  openBtn.addEventListener('click', open);
  closeTriggers.forEach(trigger => trigger.addEventListener('click', close));

  initMobileAccordion(drawer);
}

function initMobileAccordion(drawer) {
  drawer
    .querySelectorAll(
      '.main-menu__item.has-children > .main-menu__link, .main-menu__item.has-mega > .main-menu__link'
    )
    .forEach(link => {
      link.addEventListener('click', event => {
        event.preventDefault();
        link.closest('.main-menu__item').classList.toggle(DRAWER_OPEN_CLASS);
      });
    });
}

export function initHeader() {
  initStickyHeader();
  initAnnouncementBar();
  initMobileDrawer();
}
