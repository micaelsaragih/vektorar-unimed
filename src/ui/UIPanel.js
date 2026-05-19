/**
 * UIPanel.js
 * Base UI panel class — placeholder for future educational UI.
 * Will support glassmorphic floating panels with vector controls,
 * operation selectors, and step-by-step visualization.
 */

import { createElement } from '../utils/DOMHelpers.js';

export class UIPanel {
  /**
   * @param {object} options
   * @param {string} options.id — Unique panel ID
   * @param {string} [options.title] — Panel title
   * @param {string} [options.position='top-right'] — Position preset
   */
  constructor(options = {}) {
    this.id = options.id || 'ui-panel';
    this.title = options.title || '';
    this.position = options.position || 'top-right';

    this.element = null;
    this._isVisible = false;
  }

  /**
   * Create the DOM element. Override in subclasses for custom content.
   * @returns {HTMLElement}
   */
  build() {
    this.element = createElement('div', {
      id: this.id,
      className: `ui-panel ui-panel--${this.position}`,
    });

    if (this.title) {
      const header = createElement('div', { className: 'ui-panel__header' }, [
        createElement('h3', { className: 'ui-panel__title' }, [this.title]),
      ]);
      this.element.appendChild(header);
    }

    return this.element;
  }

  /**
   * Show the panel.
   */
  show() {
    if (this.element) {
      this.element.style.display = 'block';
      this._isVisible = true;
    }
  }

  /**
   * Hide the panel.
   */
  hide() {
    if (this.element) {
      this.element.style.display = 'none';
      this._isVisible = false;
    }
  }

  /**
   * Toggle visibility.
   */
  toggle() {
    this._isVisible ? this.hide() : this.show();
  }
}
