/**
 * VectorFactory.js
 * Factory for creating and managing multiple Vector3D instances.
 * Provides a registry so vectors can be looked up by name.
 */

import { Vector3D } from './Vector3D.js';
import { COLORS } from '../core/Constants.js';

export class VectorFactory {
  constructor() {
    /** @type {Map<string, Vector3D>} */
    this._vectors = new Map();
  }

  /**
   * Create a named vector and register it.
   *
   * @param {object} config
   * @param {string} config.name
   * @param {number} config.x
   * @param {number} config.y
   * @param {number} config.z
   * @param {number} [config.color] — Hex color, auto-assigned if omitted
   * @param {object} [config.origin] — {x, y, z}, defaults to origin
   * @param {boolean} [config.showLabel=true]
   * @param {boolean} [config.showEndpoint=true]
   * @returns {Vector3D}
   */
  create(config) {
    if (this._vectors.has(config.name)) {
      console.warn(`VectorFactory: vector "${config.name}" already exists. Replacing.`);
      this.remove(config.name);
    }

    const color = config.color || this._autoColor(this._vectors.size);

    const vector = new Vector3D({
      ...config,
      color,
    });

    this._vectors.set(config.name, vector);
    return vector;
  }

  /**
   * Get a vector by name.
   * @param {string} name
   * @returns {Vector3D | undefined}
   */
  get(name) {
    return this._vectors.get(name);
  }

  /**
   * Remove a vector by name and dispose its resources.
   * @param {string} name
   * @param {THREE.Scene | THREE.Group} [parent] — If provided, also removes from parent
   */
  remove(name, parent) {
    const vector = this._vectors.get(name);
    if (!vector) return;

    if (parent) {
      vector.removeFrom(parent);
    }
    vector.dispose();
    this._vectors.delete(name);
  }

  /**
   * Get all registered vectors.
   * @returns {Vector3D[]}
   */
  getAll() {
    return Array.from(this._vectors.values());
  }

  /**
   * Get all vector names.
   * @returns {string[]}
   */
  getNames() {
    return Array.from(this._vectors.keys());
  }

  /**
   * Add all vectors to a parent scene/group.
   * @param {THREE.Scene | THREE.Group} parent
   */
  addAllTo(parent) {
    for (const vector of this._vectors.values()) {
      vector.addTo(parent);
    }
  }

  /**
   * Remove all vectors.
   * @param {THREE.Scene | THREE.Group} [parent]
   */
  removeAll(parent) {
    for (const [name] of this._vectors) {
      this.remove(name, parent);
    }
  }

  /**
   * Auto-assign a color based on index for vectors without explicit color.
   * @private
   */
  _autoColor(index) {
    const palette = [
      COLORS.vectorP,     // 0x00e5ff cyan
      COLORS.vectorQ,     // 0xff6b35 orange
      0xbb86fc,           // purple
      0x03dac6,           // teal
      0xcf6679,           // pink
      0xffde03,           // yellow
      0x66bb6a,           // green
      0xff7043,           // deep orange
    ];
    return palette[index % palette.length];
  }
}
