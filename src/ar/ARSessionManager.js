/**
 * ARSessionManager.js
 * Encapsulates WebXR session initialization, ARButton creation,
 * and session lifecycle events.
 */

import { ARButton } from 'three/examples/jsm/webxr/ARButton';
import { AR } from '../core/Constants.js';

export class ARSessionManager {
  /**
   * @param {THREE.WebGLRenderer} renderer
   * @param {object} options
   * @param {HTMLElement} [options.overlayElement] — DOM overlay root element
   * @param {Function} [options.onSessionStart]
   * @param {Function} [options.onSessionEnd]
   */
  constructor(renderer, options = {}) {
    this._renderer = renderer;
    this._overlayElement = options.overlayElement || null;
    this._onSessionStart = options.onSessionStart || null;
    this._onSessionEnd = options.onSessionEnd || null;
  }

  /**
   * Create and append the AR button to the DOM.
   * @param {HTMLElement} [container=document.body]
   * @returns {HTMLElement} The AR button element
   */
  createARButton(container = document.body) {
    const sessionInit = {
      requiredFeatures: AR.requiredFeatures,
      optionalFeatures: [...AR.optionalFeatures],
    };

    // If we have an overlay element, attach it
    if (this._overlayElement) {
      sessionInit.optionalFeatures.push('dom-overlay');
      sessionInit.domOverlay = { root: this._overlayElement };
    }

    const button = ARButton.createButton(this._renderer, sessionInit);
    container.appendChild(button);

    // Localize and style ARButton text dynamically
    const observer = new MutationObserver(() => {
      const text = button.textContent;
      // Clear previous custom classes
      button.classList.remove('ar-badge-desktop', 'ar-badge-unsupported', 'ar-badge-supported');

      const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

      if (text.includes('AR NOT SUPPORTED') || text.includes('AR TIDAK DIDUKUNG')) {
        if (!isMobile) {
          button.textContent = 'MODE DESKTOP';
          button.classList.add('ar-badge-desktop');
        } else {
          button.textContent = 'AR TIDAK TERSEDIA';
          button.classList.add('ar-badge-unsupported');
        }
      } else if (text.includes('START AR') || text.includes('MULAI AR')) {
        button.textContent = 'MULAI AR';
        button.classList.add('ar-badge-supported');
      } else if (text.includes('AR NOT ALLOWED') || text.includes('AR TIDAK DIIZINKAN')) {
        button.textContent = 'AR TIDAK DIIZINKAN';
        button.classList.add('ar-badge-unsupported');
      }
    });
    observer.observe(button, { childList: true, characterData: true, subtree: true });

    // Initial trigger just in case
    const text = button.textContent;
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    if (text.includes('AR NOT SUPPORTED') || text.includes('AR TIDAK DIDUKUNG')) {
      if (!isMobile) {
        button.textContent = 'MODE DESKTOP';
        button.classList.add('ar-badge-desktop');
      } else {
        button.textContent = 'AR TIDAK TERSEDIA';
        button.classList.add('ar-badge-unsupported');
      }
    }

    return button;
  }

  /**
   * Get the XR controller at a given index.
   * @param {number} index
   * @returns {THREE.Group}
   */
  getController(index = 0) {
    return this._renderer.xr.getController(index);
  }

  /**
   * Check if WebXR immersive-ar is supported.
   * @returns {Promise<boolean>}
   */
  async isSupported() {
    if (!navigator.xr) return false;
    try {
      return await navigator.xr.isSessionSupported('immersive-ar');
    } catch {
      return false;
    }
  }
}
