// ==UserScript==
// @name           Focus-tab-on-hover.uc.js
// @namespace      https://github.com/Izheil/Quantum-Nox-Firefox-Dark-Full-Theme
// @description    Switches to tabs on hover with configurable delay
// @include        main
// @compatibility  Firefox 73+
// @author         Izheil
// @version        3.0
// @license        MIT
// ==/UserScript==

(function() {
    // Set delay in milliseconds (1000ms = 1 second)
    const delayBeforeSwitch = 2800;
    let hoverTimeout = null;
    let currentTab = null;

    function switchToHoveredTab() {
        if (!currentTab || currentTab.selected || !currentTab.closest('#tabbrowser-tabs')) return;
        try {
            gBrowser.selectedTab = currentTab;
        } catch(e) {
            console.error('Tab switch error:', e);
        }
    }

    function handleMouseOver(e) {
        const tab = e.target.closest('.tabbrowser-tab');
        if (!tab || tab.selected) return;
        
        // Clear any existing timeout
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            hoverTimeout = null;
        }
        
        currentTab = tab;
        
        if (delayBeforeSwitch <= 0) {
            switchToHoveredTab();
        } else {
            hoverTimeout = setTimeout(switchToHoveredTab, delayBeforeSwitch);
        }
    }

    function handleMouseOut(e) {
        // Only clear if leaving the tab element itself
        if (e.relatedTarget && !e.relatedTarget.closest('.tabbrowser-tab')) {
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
                hoverTimeout = null;
            }
            currentTab = null;
        }
    }

    // Initialize
    window.addEventListener('load', function() {
        if (gBrowser && gBrowser.tabContainer) {
            gBrowser.tabContainer.addEventListener('mouseover', handleMouseOver);
            gBrowser.tabContainer.addEventListener('mouseout', handleMouseOut);
            
            // Clean up when window closes
            window.addEventListener('unload', function() {
                gBrowser.tabContainer.removeEventListener('mouseover', handleMouseOver);
                gBrowser.tabContainer.removeEventListener('mouseout', handleMouseOut);
            }, { once: true });
        }
    }, { once: true });
})();