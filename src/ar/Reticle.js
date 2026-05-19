/**
 * Reticle.js
 * The AR hit-test reticle — a ring mesh that appears on
 * detected surfaces to indicate valid placement positions.
 */

import * as THREE from 'three';
import { AR } from '../core/Constants.js';

export class Reticle {
  constructor() {
    const geometry = new THREE.RingGeometry(
      AR.reticle.innerRadius,
      AR.reticle.outerRadius,
      AR.reticle.segments
    ).rotateX(-Math.PI / 2);

    const material = new THREE.MeshStandardMaterial({
      color: AR.reticle.color,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.name = 'ar-reticle';
    this.mesh.visible = false;
    this.mesh.matrixAutoUpdate = false;
  }

  /**
   * Add the reticle to a scene.
   * @param {THREE.Scene} scene
   */
  addTo(scene) {
    scene.add(this.mesh);
  }

  /**
   * Update the reticle from hit-test results.
   * @param {Float32Array | null} hitMatrix — from HitTestManager.getHitMatrix()
   */
  update(hitMatrix) {
    if (hitMatrix) {
      this.mesh.visible = true;
      this.mesh.matrix.fromArray(hitMatrix);
    } else {
      this.mesh.visible = false;
    }
  }

  /**
   * Whether the reticle is currently visible (surface detected).
   * @returns {boolean}
   */
  isVisible() {
    return this.mesh.visible;
  }

  /**
   * Get the world position of the reticle.
   * @returns {THREE.Vector3}
   */
  getPosition() {
    const pos = new THREE.Vector3();
    pos.setFromMatrixPosition(this.mesh.matrix);
    return pos;
  }
}
