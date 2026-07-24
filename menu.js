(() => {
    'use strict';

    const tabList = document.querySelector('.menu-category-tabs');
    const tabs = Array.from(tabList?.querySelectorAll('[role="tab"]') ?? []);
    const panels = Array.from(document.querySelectorAll('.menu-section'));

    const activateTab = (index, { focus = false } = {}) => {
        const activeTab = tabs[index];
        if (!activeTab) return;

        const category = activeTab.dataset.category;

        tabs.forEach((tab, tabIndex) => {
            const isSelected = tabIndex === index;
            tab.classList.toggle('active', isSelected);
            tab.setAttribute('aria-selected', String(isSelected));
            tab.tabIndex = isSelected ? 0 : -1;
        });

        panels.forEach((panel) => {
            const isSelected = panel.dataset.category === category;
            panel.classList.toggle('active', isSelected);
            panel.hidden = !isSelected;
        });

        if (focus) activeTab.focus();
    };

    tabs.forEach((tab, index) => {
        const category = tab.dataset.category;
        const panel = panels.find((item) => item.dataset.category === category);
        if (!category || !panel) return;

        const tabId = `menu-tab-${category}`;
        const panelId = `menu-panel-${category}`;
        tab.id = tabId;
        tab.setAttribute('aria-controls', panelId);
        panel.id = panelId;
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', tabId);

        tab.addEventListener('click', () => activateTab(index));
        tab.addEventListener('keydown', (event) => {
            const keyActions = {
                ArrowRight: () => (index + 1) % tabs.length,
                ArrowLeft: () => (index - 1 + tabs.length) % tabs.length,
                Home: () => 0,
                End: () => tabs.length - 1,
            };
            const getNextIndex = keyActions[event.key];
            if (!getNextIndex) return;

            event.preventDefault();
            activateTab(getNextIndex(), { focus: true });
        });
    });

    const initialTabIndex = Math.max(0, tabs.findIndex((tab) => tab.classList.contains('active')));
    activateTab(initialTabIndex);

    const menuCheckbox = document.getElementById('menu-toggle-checkbox');
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('main-navigation');
    if (!menuCheckbox || !menuToggle || !mainNav) return;

    let previousFocus = null;
    let trapHandler = null;

    const getFocusableElements = () => Array.from(
        mainNav.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])'),
    ).filter((element) => !element.hasAttribute('disabled'));

    const closeMenu = () => {
        if (!menuCheckbox.checked) return;
        menuCheckbox.checked = false;
        menuCheckbox.dispatchEvent(new Event('change'));
    };

    const updateMenu = () => {
        const isOpen = menuCheckbox.checked;
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        menuToggle.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');

        if (!isOpen) {
            if (trapHandler) document.removeEventListener('keydown', trapHandler);
            trapHandler = null;
            previousFocus?.focus();
            previousFocus = null;
            return;
        }

        previousFocus = document.activeElement;
        const focusableElements = getFocusableElements();
        focusableElements[0]?.focus();

        trapHandler = (event) => {
            if (event.key !== 'Tab' || !focusableElements.length) return;
            const first = focusableElements[0];
            const last = focusableElements[focusableElements.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };
        document.addEventListener('keydown', trapHandler);
    };

    menuCheckbox.addEventListener('change', updateMenu);
    menuToggle.addEventListener('click', () => {
        menuCheckbox.checked = !menuCheckbox.checked;
        menuCheckbox.dispatchEvent(new Event('change'));
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
    });
    document.addEventListener('click', (event) => {
        if (menuCheckbox.checked && !mainNav.contains(event.target) && !menuToggle.contains(event.target)) {
            closeMenu();
        }
    });
})();
