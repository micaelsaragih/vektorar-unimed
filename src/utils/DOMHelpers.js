/**
 * DOMHelpers.js
 * Utility functions for DOM manipulation.
 */

/**
 * Create an HTML element with attributes and children.
 * @param {string} tag
 * @param {object} [attrs] — Attribute key-value pairs
 * @param {(string | HTMLElement)[]} [children] — Child elements or text
 * @returns {HTMLElement}
 */
export function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      el.setAttribute(key, value);
    }
  }

  for (const child of children) {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof HTMLElement) {
      el.appendChild(child);
    }
  }

  return el;
}

/**
 * Query a single element, throwing if not found.
 * @param {string} selector
 * @param {HTMLElement} [parent=document]
 * @returns {HTMLElement}
 */
export function $(selector, parent = document) {
  const el = parent.querySelector(selector);
  if (!el) throw new Error(`DOM element not found: ${selector}`);
  return el;
}

/**
 * Query all matching elements.
 * @param {string} selector
 * @param {HTMLElement} [parent=document]
 * @returns {HTMLElement[]}
 */
export function $$(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}
