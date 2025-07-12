// ==UserScript==
// @name         Let Ctrl+W Close Pinned Tabs
// @version      2.0.0
// @author       aminomancer, updated by Gemini
// @homepageURL  https://github.com/aminomancer
// @description  Allows closing pinned tabs with the Ctrl+W/⌘+W shortcut.
// @downloadURL  https://cdn.jsdelivr.net/gh/aminomancer/uc.css.js@master/JS/letCtrlWClosePinnedTabs.uc.js
// @updateURL    https://cdn.jsdelivr.net/gh/aminomancer/uc.css.js@master/JS/letCtrlWClosePinnedTabs.uc.js
// @license      This Source Code Form is subject to the terms of the Creative Commons Attribution-NonCommercial-ShareAlike International License, v. 4.0. If a copy of the CC BY-NC-SA 4.0 was not distributed with this file, You can obtain one at http://creativecommons.org/licenses/by-nc-sa/4.0/ or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.
// ==/UserScript==

(function() {
  function init() {
    if (typeof BrowserCommands === 'undefined' || typeof gBrowser === 'undefined') {
      return;
    }

    const originalCloseTabOrWindow = BrowserCommands.closeTabOrWindow;

    BrowserCommands.closeTabOrWindow = function() {
      if (gBrowser.selectedTab) {
        // Temporarily unpin the tab to allow closing, then restore its state.
        const isPinned = gBrowser.selectedTab.pinned;
        if (isPinned) {
          gBrowser.unpinTab(gBrowser.selectedTab);
          gBrowser.removeCurrentTab({animate: true});
          // In most cases, the tab is gone, so no need to re-pin.
        } else {
          originalCloseTabOrWindow.apply(this, arguments);
        }
      } else {
        originalCloseTabOrWindow.apply(this, arguments);
      }
    };
  }

  // Ensuring the script runs after the browser has fully initialized.
  if (gBrowserInit.delayedStartupFinished) {
    init();
  } else {
    let delayedListener = (subject, topic) => {
      if (topic == "browser-delayed-startup-finished" && subject == window) {
        Services.obs.removeObserver(delayedListener, topic);
        init();
      }
    };
    Services.obs.addObserver(delayedListener, "browser-delayed-startup-finished");
  }
})();