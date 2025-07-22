// ==UserScript==
// @name            Private Window Homepage
// @version         2.0.0
// @author          aminomancer (updated for Firefox 115+ by Gemini)
// @homepage        https://github.com/aminomancer/uc.css.js
// @description     By default, private windows open to about:privateBrowse. This script changes that behavior, causing new private windows to open to your designated homepage instead, just like normal windows.
// @downloadURL     https://cdn.jsdelivr.net/gh/aminomancer/uc.css.js@master/JS/privateWindowHomepage.uc.js
// @updateURL       https://cdn.jsdelivr.net/gh/aminomancer/uc.css.js@master/JS/privateWindowHomepage.uc.js
// @license         This Source Code Form is subject to the terms of the Creative Commons Attribution-NonCommercial-ShareAlike International License, v. 4.0. If a copy of the CC BY-NC-SA 4.0 was not distributed with this file, You can obtain one at http://creativecommons.org/licenses/by-nc-sa/4.0/ or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.
// ==/UserScript==

(function () {
  // Prevent the script from running multiple times
  if (window.privateWindowHomepageInitialized) {
    return;
  }
  window.privateWindowHomepageInitialized = true;

  const lazy = {};

  // Lazily import necessary Mozilla modules
  ChromeUtils.defineESModuleGetters(lazy, {
    HomePage: "resource:///modules/HomePage.sys.mjs",
    PrivateBrowseUtils: "resource://gre/modules/PrivateBrowseUtils.sys.mjs",
  });

  const PrivateWindowHomepage = {
    /**
     * Observer method called when a new window is opened.
     * @param {object} win - The window object that was opened.
     * @param {string} topic - The observer topic, should be "domwindowopened".
     */
    observe(win, topic) {
      if (topic === "domwindowopened") {
        // Wait for the window's content to fully load before proceeding.
        win.addEventListener("load", () => this.onWindowLoad(win), { once: true });
      }
    },

    /**
     * Handles the window's load event.
     * @param {object} win - The window object.
     */
    onWindowLoad(win) {
      // 1. Ensure it's a main browser window, not a popup or devtools window.
      if (win.document.documentElement.windowtype !== "navigator:browser") {
        return;
      }

      // 2. Check if the window is private and we are not in permanent private Browse mode.
      if (
        !lazy.PrivateBrowseUtils.isWindowPrivate(win) ||
        lazy.PrivateBrowseUtils.permanentPrivateBrowse
      ) {
        return;
      }
      
      // 3. Check if the initial page being loaded is the default private Browse page.
      const browser = win.gBrowser.selectedBrowser;
      if (browser.currentURI.spec === "about:privateBrowse") {
        // Get the user's homepage URL(s).
        const homePage = lazy.HomePage.get(win);
        
        // Load the homepage. Using win.BrowserHome.load() is the correct method
        // as it properly handles homepages with multiple URLs.
        win.BrowserHome.load(homePage);
      }
    },

    /**
     * Initializes the script by registering the observer.
     */
    init() {
      Services.obs.addObserver(this, "domwindowopened");
    },
  };

  // Wait for the browser to finish its startup process before initializing our script.
  if (gBrowserInit.delayedStartupFinished) {
    PrivateWindowHomepage.init();
  } else {
    const delayedListener = (subject, topic) => {
      if (topic === "browser-delayed-startup-finished" && subject === window) {
        Services.obs.removeObserver(delayedListener, topic);
        PrivateWindowHomepage.init();
      }
    };
    Services.obs.addObserver(delayedListener, "browser-delayed-startup-finished");
  }
})();