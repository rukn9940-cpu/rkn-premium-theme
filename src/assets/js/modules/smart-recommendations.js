/**
 * Smart Recommendations
 * ----------------------
 * On the single product page this feature is served directly by Salla's own
 * related-products system, keyed off the current product — see
 * `views/pages/product/single.twig`, no JS involved.
 *
 * Everywhere else (`[data-smart-recommendations]` in cart/home, see
 * `partials/utility/smart-recommendations.twig`) there's no "current
 * product" to key off, so this reads the most recent entry from
 * `js/modules/recently-viewed.js`'s history and mounts the same, real
 * `<salla-products-list source="related">` Twilight component against it —
 * still Salla's own recommendation data, just re-targeted client-side.
 */
import { qs } from '../core/dom.js';
import { getMostRecentId } from './recently-viewed.js';

export function initSmartRecommendations(root = document) {
  const section = qs('[data-smart-recommendations]', root);
  const listEl = section && qs('[data-smart-recommendations-list]', section);
  if (!listEl) return;

  const productId = getMostRecentId();
  if (!productId) return;

  const list = document.createElement('salla-products-list');
  list.setAttribute('source', 'related');
  list.setAttribute('source-value', String(productId));
  list.setAttribute('limit', '8');
  listEl.replaceChildren(list);
  section.hidden = false;
}
