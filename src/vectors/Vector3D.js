/**
 * Vector3D.js
 * Reusable 3D vector visualization class.
 *
 * Renders a vector as:
 * - Cylinder shaft
 * - Cone arrowhead
 * - Small sphere endpoint marker
 * - Text label at the tip
 *
 * Supports dynamic updates (changing direction, color, visibility).
 */

import * as THREE from 'three';
import { VECTOR } from '../core/Constants.js';
import { createVectorInfoSprite } from './VectorLabel.js';

export class Vector3D {
  /**
   * @param {object} config
   * @param {string} config.name — Display name (e.g., "p", "q")
   * @param {number} config.x — X component
   * @param {number} config.y — Y component
   * @param {number} config.z — Z component
   * @param {number} config.color — Hex color (e.g., 0x00e5ff)
   * @param {object} [config.origin] — Start point {x, y, z}, defaults to (0,0,0)
   * @param {boolean} [config.showLabel=true] — Whether to show the label
   * @param {boolean} [config.showEndpoint=true] — Whether to show endpoint sphere
   */
  constructor(config) {
    this.name = config.name;
    this.color = config.color;
    this.showLabel = config.showLabel !== false;
    this.showEndpoint = config.showEndpoint !== false;

    // Vector components
    this._origin = config.origin
      ? new THREE.Vector3(config.origin.x, config.origin.y, config.origin.z)
      : new THREE.Vector3(0, 0, 0);
    this._direction = new THREE.Vector3(config.x, config.y, config.z);
    this._length = this._direction.length();

    // The root group
    this.group = new THREE.Group();
    this.group.name = `vector-${this.name}`;

    // Build the visual components
    this._buildShaft();
    this._buildArrowhead();
    this._buildEndpoint();
    this._buildLabel();

    // Position and orient
    this._updateTransform();
  }

  // ─── Build Methods ─────────────────────────────────────

  _buildShaft() {
    const shaftLength = Math.max(0, this._length - VECTOR.headLength);

    if (shaftLength <= VECTOR.minLength) {
      this._shaft = null;
      return;
    }

    const geometry = new THREE.CylinderGeometry(
      VECTOR.shaftRadius,
      VECTOR.shaftRadius,
      shaftLength,
      VECTOR.shaftSegments
    );

    const material = new THREE.MeshStandardMaterial({
      color: this.color,
      emissive: this.color,
      emissiveIntensity: VECTOR.emissiveIntensity,
      metalness: 0.4,
      roughness: 0.4,
    });

    this._shaft = new THREE.Mesh(geometry, material);
    this._shaft.position.y = shaftLength / 2;
    this._shaft.name = `${this.name}-shaft`;
    this.group.add(this._shaft);
  }

  _buildArrowhead() {
    const geometry = new THREE.ConeGeometry(
      VECTOR.headRadius,
      VECTOR.headLength,
      VECTOR.headSegments
    );

    const material = new THREE.MeshStandardMaterial({
      color: this.color,
      emissive: this.color,
      emissiveIntensity: VECTOR.emissiveIntensity + 0.1,
      metalness: 0.4,
      roughness: 0.3,
    });

    this._arrowhead = new THREE.Mesh(geometry, material);
    const shaftLength = Math.max(0, this._length - VECTOR.headLength);
    this._arrowhead.position.y = shaftLength + VECTOR.headLength / 2;
    this._arrowhead.name = `${this.name}-head`;
    this.group.add(this._arrowhead);
  }

  _buildEndpoint() {
    if (!this.showEndpoint) return;

    const geometry = new THREE.SphereGeometry(
      VECTOR.endpointRadius,
      VECTOR.endpointSegments,
      VECTOR.endpointSegments
    );

    const material = new THREE.MeshStandardMaterial({
      color: this.color,
      emissive: this.color,
      emissiveIntensity: 0.5,
      metalness: 0.5,
      roughness: 0.2,
    });

    this._endpoint = new THREE.Mesh(geometry, material);
    this._endpoint.position.y = this._length;
    this._endpoint.name = `${this.name}-endpoint`;
    this.group.add(this._endpoint);
  }

  _buildLabel() {
    if (!this.showLabel) return;

    const cssColor = '#' + new THREE.Color(this.color).getHexString();
    const vecData = {
      x: parseFloat(this._direction.x.toFixed(1)),
      y: parseFloat(this._direction.y.toFixed(1)),
      z: parseFloat(this._direction.z.toFixed(1)),
    };

    this._label = createVectorInfoSprite(this.name, vecData, cssColor);
    this._label.position.y = this._length + VECTOR.labelOffsetY;
    this._label.scale.set(VECTOR.labelSize * 1.6, VECTOR.labelSize, 1);
    this._label.name = `${this.name}-label`;
    this.group.add(this._label);
  }

  // ─── Transform ─────────────────────────────────────────

  /**
   * Orient the group so that Y-axis-aligned children point
   * in the actual vector direction.
   */
  _updateTransform() {
    // Position at origin
    this.group.position.copy(this._origin);

    // Calculate rotation to align Y-up with vector direction
    if (this._length > VECTOR.minLength) {
      const dir = this._direction.clone().normalize();
      const quaternion = new THREE.Quaternion();
      quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      this.group.quaternion.copy(quaternion);
    }
  }

  // ─── Public API ────────────────────────────────────────

  /**
   * Add the vector visualization to a scene or group.
   * @param {THREE.Scene | THREE.Group} parent
   */
  addTo(parent) {
    parent.add(this.group);
  }

  /**
   * Remove from parent.
   * @param {THREE.Scene | THREE.Group} parent
   */
  removeFrom(parent) {
    parent.remove(this.group);
  }

  /**
   * Update the vector's direction and rebuild visuals.
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  setDirection(x, y, z) {
    this._direction.set(x, y, z);
    this._length = this._direction.length();
    this._rebuild();
  }

  /**
   * Update the vector's origin point.
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  setOrigin(x, y, z) {
    this._origin.set(x, y, z);
    this._updateTransform();
  }

  /**
   * Update the vector's color.
   * @param {number} color — Hex color
   */
  setColor(color) {
    this.color = color;
    this._rebuild();
  }

  /**
   * Set visibility.
   * @param {boolean} visible
   */
  setVisible(visible) {
    this.group.visible = visible;
  }

  /**
   * Get the world-space endpoint position of the vector.
   * @returns {THREE.Vector3}
   */
  getEndpoint() {
    return this._origin.clone().add(this._direction);
  }

  /**
   * Get the direction as a plain object.
   * @returns {{ x: number, y: number, z: number }}
   */
  getDirection() {
    return { x: this._direction.x, y: this._direction.y, z: this._direction.z };
  }

  /**
   * Get the magnitude of the vector.
   * @returns {number}
   */
  getMagnitude() {
    return this._length;
  }

  /**
   * Clean up and rebuild all child meshes.
   */
  _rebuild() {
    // Remove all children
    while (this.group.children.length > 0) {
      const child = this.group.children[0];
      this.group.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
    }

    this._buildShaft();
    this._buildArrowhead();
    this._buildEndpoint();
    this._buildLabel();
    this._updateTransform();
  }

  /**
   * Dispose of all GPU resources.
   */
  dispose() {
    this._rebuild(); // clears children
    while (this.group.children.length > 0) {
      const child = this.group.children[0];
      this.group.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
    }
  }
}
