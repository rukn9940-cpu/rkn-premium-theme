/**
 * <rkn-category-menu variant="sidebar|dropdown">
 *
 * Reusable "all categories" list backed by the same
 * `salla.api.component.getMenus()` call the stock `<custom-main-menu>`
 * uses. Two presentations share one data source:
 *  - variant="sidebar"  → homepage panel next to the hero slider.
 *  - variant="dropdown" → header "all categories" toggle panel.
 */

let menusPromise = null;

function fetchMenus() {
    if (!menusPromise) {
        menusPromise = salla.onReady()
            .then(() => salla.api.component.getMenus())
            .then(({ data }) => data || [])
            .catch((error) => {
                salla.logger.error('rkn-category-menu::Error fetching menus', error);
                return [];
            });
    }
    return menusPromise;
}

class CategoryMenu extends HTMLElement {
    connectedCallback() {
        this.variant = this.getAttribute('variant') || 'sidebar';
        this.classList.add('rkn-catmenu-host');
        this.innerHTML = '';

        fetchMenus().then((menus) => {
            this.menus = menus;
            this.render();
            if (this.variant === 'dropdown') {
                this.bindDropdownToggle();
            }
        });
    }

    rowIcon(menu) {
        if (menu.image) {
            return `<img src="${menu.image}" alt="${menu.title || ''}" />`;
        }
        return `<span class="rkn-catmenu__row__icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
                <circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="3.2"></circle>
            </svg>
        </span>`;
    }

    getFlyout(menu) {
        if (!menu.children || !menu.children.length) return '';
        return `
        <div class="rkn-catmenu__flyout">
            <h6>${menu.title || ''}</h6>
            <div class="rkn-catmenu__fly-links">
                ${menu.children.map((sub) => `<a href="${sub.url}">${sub.title || ''}</a>`).join('')}
            </div>
        </div>`;
    }

    getRows() {
        return this.menus.map((menu) => `
            <a href="${menu.url}" class="rkn-catmenu__row" ${menu.attrs || ''}>
                ${this.rowIcon(menu)}
                <span class="rkn-catmenu__row__name">${menu.title || ''}</span>
                <span class="rkn-catmenu__row__chev">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 18l-6-6 6-6"></path>
                    </svg>
                </span>
                ${this.getFlyout(menu)}
            </a>
        `).join('');
    }

    render() {
        const isSidebar = this.variant === 'sidebar';
        this.innerHTML = `
        <div class="rkn-catmenu ${isSidebar ? 'rkn-catmenu--sidebar' : ''}">
            <div class="rkn-catmenu__head">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M3 12h18M3 18h18"></path>
                </svg>
                ${salla.lang.get('blocks.header.all_categories')}
            </div>
            <ul class="rkn-catmenu__list">${this.getRows()}</ul>
        </div>`;
    }

    bindDropdownToggle() {
        const toggles = document.querySelectorAll('[data-rkn-allcats-toggle]');
        const close = () => {
            this.classList.remove('is-open');
            toggles.forEach((btn) => btn.setAttribute('aria-expanded', 'false'));
        };
        const open = () => {
            this.classList.add('is-open');
            toggles.forEach((btn) => btn.setAttribute('aria-expanded', 'true'));
        };

        toggles.forEach((btn) => {
            btn.addEventListener('click', (event) => {
                event.stopPropagation();
                this.classList.contains('is-open') ? close() : open();
            });
        });

        document.addEventListener('click', (event) => {
            if (!this.classList.contains('is-open')) return;
            if (this.contains(event.target)) return;
            close();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') close();
        });
    }
}

customElements.define('rkn-category-menu', CategoryMenu);
