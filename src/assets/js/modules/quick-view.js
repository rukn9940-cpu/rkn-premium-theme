/**
 * Quick View
 * ----------
 * Every product card (`partials/product/card.twig`) ships a hidden
 * `<template data-quick-view-template="ID">` built server-side from the
 * exact same real product data/options/add-to-cart form as the single
 * product page — no client-side fetch needed, so it works identically for
 * every product type (variants, notes, uploads, donations...) without
 * re-implementing that logic in JS. Clicking a card's quick-view button
 * clones its template into the shared `partials/utility/quick-view.twig`
 * modal shell.
 */
import { qs, qsa } from '../core/dom.js';

const OPEN_CLASS = 'is-open';

class QuickView {
  constructor(root) {
    this.root = root;
    this.body = qs('[data-quick-view-body]', root);
    if (!this.body) return;

    this.lastTrigger = null;

    document.addEventListener('click', event => {
      const opener = event.target.closest('[data-quick-view-open]');
      if (opener) {
        event.preventDefault();
        this.lastTrigger = opener;
        this.open(opener.dataset.quickViewId);
        return;
      }

      if (event.target.closest('[data-quick-view-close]')) this.close();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && this.isOpen()) this.close();
    });
  }

  isOpen() {
    return !this.root.hidden;
  }

  open(productId) {
    const template = qsa('template[data-quick-view-template]').find(
      node => node.dataset.quickViewTemplate === String(productId)
    );
    if (!template) return;

    this.body.replaceChildren(template.content.cloneNode(true));
    this.root.hidden = false;
    document.documentElement.classList.add('has-open-drawer');
    requestAnimationFrame(() => {
      this.root.classList.add(OPEN_CLASS);
      qs('.quick-view__close', this.root)?.focus();
    });
  }

  close() {
    this.root.classList.remove(OPEN_CLASS);
    document.documentElement.classList.remove('has-open-drawer');
    // Return focus to whatever card opened the modal so keyboard/screen
    // reader users land back where they were instead of at the top of the
    // document (the default when a focused element is hidden).
    this.lastTrigger?.focus();
    window.setTimeout(() => {
      if (!this.root.classList.contains(OPEN_CLASS)) {
        this.root.hidden = true;
        this.body.replaceChildren();
      }
    }, 200);
  }
}

export function initQuickView(root = document) {
  const el = qs('[data-quick-view]', root);
  if (el) new QuickView(el);
}
