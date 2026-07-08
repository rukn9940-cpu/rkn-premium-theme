/**
 * <rkn-mega-menu>
 *
 * Fully rebuilt replacement for the old Raed `<custom-main-menu>` /
 * `.main-menu`/`.sub-menu` markup. Renders a single flat `<ul>` mixing
 * mobile-flavored `<li>`s (picked up by the shared mmenu-light drawer via
 * `#mobile-menu`) and desktop-flavored `<li>`s (shown from `lg:` up) from
 * one `salla.api.component.getMenus()` call, same as before — only the
 * class names and the overflow/flyout-direction logic changed.
 */
class MegaMenu extends HTMLElement {
    connectedCallback() {
        // Skeleton shown until the menu data is fetched and render() replaces it.
        this.innerHTML = `
            <div class="rkn-menu-skel" aria-hidden="true">
                <span class="rkn-menu-skel__item" style="width:80px"></span>
                <span class="rkn-menu-skel__item" style="width:60px"></span>
                <span class="rkn-menu-skel__item" style="width:90px"></span>
                <span class="rkn-menu-skel__item" style="width:70px"></span>
                <span class="rkn-menu-skel__item" style="width:80px"></span>
            </div>`;

        salla.onReady()
            .then(() => salla.lang.onLoaded())
            .then(() => {
                this.menus = [];
                this.displayAllText = salla.lang.get('blocks.home.display_all');
                this.moreText = salla.lang.get('common.titles.more');
                this.overflowMenus = [];

                return salla.api.component.getMenus()
                    .then(({ data }) => {
                        this.menus = data;
                        return this.render();
                    }).then(() => {
                        this.initializeResponsiveMenu();
                        this.initFlyoutDirection();
                    }).catch((error) => salla.logger.error('rkn-mega-menu::Error fetching menus', error));
            });
    }

    hasChildren(menu) {
        return menu?.children?.length > 0;
    }

    hasProducts(menu) {
        return menu?.products?.length > 0;
    }

    getDesktopClasses(menu, isRootMenu) {
        return `!hidden lg:!flex ${isRootMenu ? 'rkn-menu__item lg:!inline-flex' : 'rkn-menu__panel-item relative'}`
            + `${menu.products ? ' rkn-menu__item--mega' : ''}`
            + `${this.hasChildren(menu) ? ' rkn-menu__item--has-children' : ''}`;
    }

    getMobileMenu(menu, displayAllText) {
        const menuImage = menu.image ? `<img src="${menu.image}" class="rounded-full" width="48" height="48" alt="${menu.title}" />` : '';

        return `
        <li class="lg:hidden text-sm font-bold" ${menu.attrs}>
            ${!this.hasChildren(menu) ? `
                <a href="${menu.url}" aria-label="${menu.title || 'category'}" class="text-gray-500 ${menu.image ? '!py-3' : ''}" ${menu.link_attrs}>
                    ${menuImage}
                    <span>${menu.title || ''}</span>
                </a>` :
                `
                <span class="${menu.image ? '!py-3' : ''}">
                    ${menuImage}
                    ${menu.title}
                </span>
                <ul>
                    <li class="text-sm font-bold">
                        <a href="${menu.url}" class="text-gray-500">${displayAllText}</a>
                    </li>
                    ${menu.children.map((subMenu) => this.getMobileMenu(subMenu, displayAllText)).join('')}
                </ul>
            `}
        </li>`;
    }

    getDesktopMenu(menu, isRootMenu) {
        return `
        <li class="${this.getDesktopClasses(menu, isRootMenu)}" ${menu.attrs} data-rkn-menu-item>
            <a class="rkn-menu__link" href="${menu.url}" aria-label="${menu.title || 'category'}" ${menu.link_attrs}>
                <span>${menu.title || ''}</span>
                ${this.hasChildren(menu) ? '<i class="rkn-menu__chev" aria-hidden="true"></i>' : ''}
            </a>
            ${this.hasChildren(menu) ? `
                <div class="rkn-menu__panel ${this.hasProducts(menu) ? 'rkn-menu__panel--mega' : ''}">
                    <ul class="rkn-menu__panel-list ${this.hasProducts(menu) ? 'rkn-menu__panel-list--aside' : ''}">
                        ${menu.children.map((subMenu) => this.getDesktopMenu(subMenu, false)).join('\n')}
                    </ul>
                    ${this.hasProducts(menu) ? `
                    <salla-products-list
                        source="selected"
                        shadow-on-hover
                        source-value="[${menu.products}]" />` : ''}
                </div>` : ''}
        </li>`;
    }

    getMenus() {
        return this.menus.map((menu) => `
            ${this.getMobileMenu(menu, this.displayAllText)}
            ${this.getDesktopMenu(menu, true)}
        `).join('\n');
    }

    createMoreDropdown() {
        if (this.overflowMenus.length === 0) return '';

        return `
        <li class="!hidden lg:!flex lg:!inline-flex rkn-menu__item rkn-menu__item--has-children relative rkn-menu__more" data-rkn-menu-more>
            <a class="rkn-menu__link" href="#">
                <span>${this.moreText}</span>
                <i class="rkn-menu__chev" aria-hidden="true"></i>
            </a>
            <div class="rkn-menu__panel">
                <ul class="rkn-menu__panel-list">
                    ${this.overflowMenus.map((menu) => this.getDesktopMenu(menu, false)).join('\n')}
                </ul>
            </div>
        </li>`;
    }

    initializeResponsiveMenu() {
        if (window.innerWidth < 1024) return; // Only for desktop

        const menu = this.querySelector('.rkn-menu');
        if (!menu) return;

        if (!window.enable_more_menu) return;

        this.checkMenuOverflow();

        const resizeHandler = this.debounce(() => this.checkMenuOverflow(), 250);
        window.addEventListener('resize', resizeHandler);
    }

    checkMenuOverflow() {
        const menu = this.querySelector('.rkn-menu');
        if (!menu) return;

        const container = menu.closest('.container');
        if (!container) return;

        this.overflowMenus = [];

        const existingMore = menu.querySelector('[data-rkn-menu-more]');
        if (existingMore) existingMore.remove();

        const menuItems = menu.querySelectorAll('[data-rkn-menu-item].rkn-menu__item');
        menuItems.forEach((item) => item.style.removeProperty('display'));

        const containerWidth = container.offsetWidth;
        const otherElements = container.querySelector('.flex')?.children || [];
        let usedWidth = 0;

        Array.from(otherElements).forEach((element) => {
            if (!element.contains(menu)) usedWidth += element.offsetWidth;
        });

        const availableWidth = containerWidth - usedWidth - 300; // buffer for "More"
        let currentWidth = 0;

        menuItems.forEach((item, index) => {
            const itemWidth = item.offsetWidth;

            if (currentWidth + itemWidth <= availableWidth && index < this.menus.length) {
                currentWidth += itemWidth;
            } else if (index < this.menus.length) {
                item.style.setProperty('display', 'none', 'important');
                this.overflowMenus.push(this.menus[index]);
            }
        });

        if (this.overflowMenus.length > 0) {
            menu.insertAdjacentHTML('beforeend', this.createMoreDropdown());
        }

        this.initFlyoutDirection();
    }

    /**
     * Flip a panel to open toward the inner side of the viewport when it
     * would otherwise overflow the left/right edge.
     */
    initFlyoutDirection() {
        this.querySelectorAll('.rkn-menu__panel').forEach((panel) => {
            const host = panel.parentElement;
            if (!host || host.dataset.rknFlipBound) return;
            host.dataset.rknFlipBound = '1';

            host.addEventListener('mouseenter', () => {
                panel.classList.remove('rkn-menu__panel--flip');
                if (panel.classList.contains('rkn-menu__panel--mega')) return;
                const rect = panel.getBoundingClientRect();
                if (rect.left < 8 || rect.right > window.innerWidth - 8) {
                    panel.classList.add('rkn-menu__panel--flip');
                }
            });
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    render() {
        this.innerHTML = `
        <nav id="mobile-menu" class="rkn-mobile-menu">
            <ul class="rkn-menu">${this.getMenus()}</ul>
            <button class="btn--close close-mobile-menu sicon-cancel lg:hidden"></button>
        </nav>
        <button class="btn--close-sm close-mobile-menu sicon-cancel hidden"></button>`;
    }
}

customElements.define('rkn-mega-menu', MegaMenu);
