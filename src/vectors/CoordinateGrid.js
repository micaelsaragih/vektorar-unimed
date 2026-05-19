/**
 * CoordinateGrid.js
 * Creates a professional 3D grid on the XZ plane.
 * Features a clean, modern look with fading edges and subtle coloring.
 */

import * as THREE from 'three';
import { GRID, COLORS } from '../core/Constants.js';

export class CoordinateGrid {
  /**
   * @param {object} [options]
   * @param {number} [options.size] — Grid extent in each direction from origin
   * @param {number} [options.divisions] — Number of grid divisions
   */
  constructor(options = {}) {
    const size = options.size || GRID.size;
    const divisions = options.divisions || GRID.divisions;

    this.group = new THREE.Group();
    this.group.name = 'coordinate-grid';

    this._createGrid(size, divisions);
  }

  /**
   * Build the grid using individual line segments for precise control.
   */
  _createGrid(size, divisions) {
    const step = size / divisions;
    const halfSize = size / 2;

    // Use a BufferGeometry for all grid lines (high performance)
    const vertices = [];
    const colors = [];

    const primaryColor = new THREE.Color(COLORS.gridPrimary);
    const secondaryColor = new THREE.Color(COLORS.gridSecondary);
    const centerColor = new THREE.Color(COLORS.gridCenter);

    for (let i = -divisions; i <= divisions; i++) {
      const pos = i * step;
      const isCenter = i === 0;
      const isMajor = i % (divisions / 2) === 0 && !isCenter;

      let lineColor;
      let opacity;

      if (isCenter) {
        lineColor = centerColor;
        opacity = 0.4;
      } else if (isMajor) {
        lineColor = primaryColor;
        opacity = 0.3;
      } else {
        lineColor = secondaryColor;
        opacity = 0.15;
      }

      // Fade edges
      const distFromCenter = Math.abs(i) / divisions;
      const fadeFactor = 1.0 - distFromCenter * 0.6;
      opacity *= fadeFactor;

      // Lines parallel to Z axis (varying X)
      vertices.push(pos, 0, -halfSize);
      vertices.push(pos, 0, halfSize);
      colors.push(lineColor.r, lineColor.g, lineColor.b, opacity);
      colors.push(lineColor.r, lineColor.g, lineColor.b, opacity * 0.3);

      // Lines parallel to X axis (varying Z)
      vertices.push(-halfSize, 0, pos);
      vertices.push(halfSize, 0, pos);
      colors.push(lineColor.r, lineColor.g, lineColor.b, opacity * 0.3);
      colors.push(lineColor.r, lineColor.g, lineColor.b, opacity);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    geometry.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(colors, 4)
    );

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: GRID.opacity,
      depthWrite: false,
    });

    const gridMesh = new THREE.LineSegments(geometry, material);
    gridMesh.name = 'grid-lines';
    this.group.add(gridMesh);

    // Optional: subtle ground plane
    this._createGroundPlane(halfSize);
  }

  /**
   * Create a very subtle semi-transparent ground plane.
   */
  _createGroundPlane(halfSize) {
    const geometry = new THREE.PlaneGeometry(halfSize * 2, halfSize * 2);
    geometry.rotateX(-Math.PI / 2);

    const material = new THREE.MeshStandardMaterial({
      color: 0x111133,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const plane = new THREE.Mesh(geometry, material);
    plane.position.y = -0.005; // slightly below grid lines to avoid z-fighting
    plane.name = 'ground-plane';
    plane.receiveShadow = true;
    this.group.add(plane);
  }

  /**
   * Add the grid to a scene or group.
   * @param {THREE.Scene | THREE.Group} parent
   */
  addTo(parent) {
    parent.add(this.group);
  }

  /**
   * Remove from parent.
   */
  removeFrom(parent) {
    parent.remove(this.group);
  }

  /**
   * Set visibility.
   * @param {boolean} visible
   */
  setVisible(visible) {
    this.group.visible = visible;
  }
}
