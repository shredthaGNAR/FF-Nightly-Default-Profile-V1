// ==UserScript==
// @name             Fluent Reveal Tabs
// @version          1.1.4
// @author           aminomancer
// @homepage         https://github.com/aminomancer/uc.css.js
// @description      Adds a visual effect to tabs similar to the spotlight gradient effect on Windows 10's start menu tiles. When hovering a tab, a subtle radial gradient is applied under the mouse. Inspired by this [proof of concept](https://www.reddit.com/r/FirefoxCSS/comments/ng5lnt/proof_of_concept_legacy_edge_like_interaction/) by black7375.
// @downloadURL      https://cdn.jsdelivr.net/gh/aminomancer/uc.css.js@master/JS/fluentRevealTabs.uc.js
// @updateURL        https://cdn.jsdelivr.net/gh/aminomancer/uc.css.js@master/JS/fluentRevealTabs.uc.js
// @license          This Source Code Form is subject to the terms of the Creative Commons Attribution-NonCommercial-ShareAlike International License, v. 4.0. If a copy of the CC BY-NC-SA 4.0 was not distributed with this file, You can obtain one at http://creativecommons.org/licenses/by-nc-sa/4.0/ or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.
// ==/UserScript==

(function () {
  class FluentRevealEffect {
    // User configuration
    static options = {
      showOnSelectedTab: true,
      showOnPinnedTab: true,
      lightColor: "hsla(0, 0%, 100%, 0.75)",
      gradientSize: 30,
      clickEffect: true,
    };

    constructor() {
      this._options = FluentRevealEffect.options;
      gBrowser.tabContainer.addEventListener("TabOpen", e =>
        this.applyEffect(e.target.querySelector(".tab-content"), true)
      );
      gBrowser.tabs.forEach(tab =>
        this.applyEffect(tab.querySelector(".tab-content"), true)
      );
    }

    handleEvent(e) {
      const { currentTarget } = e;
      const { fluentRevealState } = currentTarget;
      if (!fluentRevealState) return;

      const { gradientSize, lightColor, clickEffect } = fluentRevealState;
      const rect = currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // A more pronounced gradient for the click effect
      const cssLightEffect = `radial-gradient(circle ${gradientSize}px at ${x}px ${y}px, ${lightColor}, rgba(255,255,255,0)), radial-gradient(circle ${
        gradientSize + 20
      }px at ${x}px ${y}px, rgba(255,255,255,0), ${lightColor}, rgba(255,255,255,0))`;

      switch (e.type) {
        case "mousemove":
          if (this.shouldClear(currentTarget)) {
            return this.clearEffect(currentTarget);
          }
          this.drawEffect(
            currentTarget,
            x,
            y,
            lightColor,
            gradientSize,
            clickEffect && fluentRevealState.is_pressed ? cssLightEffect : null
          );
          break;

        case "mouseleave":
          this.clearEffect(currentTarget);
          break;

        case "mousedown":
          if (this.shouldClear(currentTarget)) {
            return this.clearEffect(currentTarget);
          }
          fluentRevealState.is_pressed = true;
          this.drawEffect(
            currentTarget,
            x,
            y,
            lightColor,
            gradientSize,
            cssLightEffect
          );
          break;

        case "mouseup":
          if (this.shouldClear(currentTarget)) {
            return this.clearEffect(currentTarget);
          }
          fluentRevealState.is_pressed = false;
          this.drawEffect(currentTarget, x, y, lightColor, gradientSize);
          break;
      }
    }
    
    /**
     * Reveal Effect
     * https://github.com/d2phap/fluent-reveal-effect
     *
     * MIT License
     * Copyright (c) 2018 Duong Dieu Phap
     * (License details omitted for brevity)
     */

    applyEffect(element, isTab = false, options = {}) {
      if (!element) return;

      // Combine default and user-provided options efficiently
      const finalOptions = { ...this._options, ...options };

      element.fluentRevealState = {
        ...finalOptions,
        isTab,
        is_pressed: false,
      };

      if (!element.getAttribute("fluent-reveal-hover")) {
        element.setAttribute("fluent-reveal-hover", true);
        element.addEventListener("mousemove", this);
        element.addEventListener("mouseleave", this);
      }

      if (finalOptions.clickEffect && !element.getAttribute("fluent-reveal-click")) {
        element.setAttribute("fluent-reveal-click", true);
        element.addEventListener("mousedown", this);
        element.addEventListener("mouseup", this);
      }
    }

    revertElement(element) {
      if (!element) return;
      try {
        delete element.fluentRevealState;
      } catch (e) {
        element.fluentRevealState = null;
      }

      if (element.getAttribute("fluent-reveal-hover")) {
        element.removeAttribute("fluent-reveal-hover");
        element.removeEventListener("mousemove", this);
        element.removeEventListener("mouseleave", this);
      }

      if (element.getAttribute("fluent-reveal-click")) {
        element.removeAttribute("fluent-reveal-click");
        element.removeEventListener("mousedown", this);
        element.removeEventListener("mouseup", this);
      }
    }

    clearEffect(element) {
        if (element && element.fluentRevealState) {
            element.fluentRevealState.is_pressed = false;
            element.style.removeProperty("background-image");
        }
    }

    shouldClear(element) {
      if (!element.fluentRevealState.isTab) return false;
      const tab = element.tab || element.closest(".tabbrowser-tab");
      return (
        tab &&
        ((!this._options.showOnSelectedTab && tab.selected) ||
          (!this._options.showOnPinnedTab && tab.pinned))
      );
    }

    drawEffect(element, x, y, lightColor, gradientSize, cssLightEffect = null) {
      if (!element) return;
      element.style.backgroundImage =
        cssLightEffect ??
        `radial-gradient(circle ${gradientSize}px at ${x}px ${y}px, ${lightColor}, rgba(255,255,255,0))`;
    }
  }

  function init() {
    window.fluentRevealFx = new FluentRevealEffect();
  }

  if (gBrowserInit.delayedStartupFinished) {
    init();
  } else {
    let delayedListener = (subject, topic) => {
      if (topic === "browser-delayed-startup-finished" && subject === window) {
        Services.obs.removeObserver(delayedListener, topic);
        init();
      }
    };
    Services.obs.addObserver(delayedListener, "browser-delayed-startup-finished");
  }
})();