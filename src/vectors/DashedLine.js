/**
 * DashedLine.js
 * Creates dashed construction lines between two 3D points.
 * Used to visualize the parallelogram rule for vector addition/subtraction.
 */

import * as THREE from 'three';
import { DASHED_LINE, COLORS } from '../core/Constants.js';

export class DashedLine {
  /**
   * @param {object} from — Start point {x, y, z}
   * @param {object} to — End point {x, y, z}
   * @param {object} [options]
   * @param {number} [options.color]
   * @param {number} [options.opacity]
   * @param {number} [options.dashSize]
   * @param {number} [options.gapSize]
   */
  constructor(from, to, options = {}) {
    const color = options.color ?? COLORS.constructionLine;
    const opacity = options.opacity ?? DASHED_LINE.opacity;
    const dashSize = options.dashSize ?? DASHED_LINE.dashSize;
    const gapSize = options.gapSize ?? DASHED_LINE.gapSize;

    const points = [
      new THREE.Vector3(from.x, from.y, from.z),
      new THREE.Vector3(to.x, to.y, to.z),
    ];

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineDashedMaterial({
      color,
      transparent: true,
      opacity,
      dashSize,
      gapSize,
      depthWrite: false,
    });

    this.line = new THREE.Line(geometry, material);
    this.line.computeLineDistances(); // Required for dashed lines
    this.line.name = 'construction-line';
  }

  /**
   * Add to a parent.
   * @param {THREE.Scene | THREE.Group} parent
   */
  addTo(parent) {
    parent.add(this.line);
  }

  /**
   * Remove from parent.
   * @param {THREE.Scene | THREE.Group} parent
   */
  removeFrom(parent) {
    parent.remove(this.line);
  }

  /**
   * Update endpoints dynamically.
   * @param {object} from — {x, y, z}
   * @param {object} to — {x, y, z}
   */
  setPoints(from, to) {
    const positions = this.line.geometry.attributes.position.array;
    positions[0] = from.x;
    positions[1] = from.y;
    positions[2] = from.z;
    positions[3] = to.x;
    positions[4] = to.y;
    positions[5] = to.z;
    this.line.geometry.attributes.position.needsUpdate = true;
    this.line.computeLineDistances();
  }

  /**
   * Set visibility.
   * @param {boolean} visible
   */
  setVisible(visible) {
    this.line.visible = visible;
  }

  /**
   * Set opacity.
   * @param {number} opacity — 0..1
   */
  setOpacity(opacity) {
    this.line.material.opacity = opacity;
  }

  /**
   * Dispose of GPU resources.
   */
  dispose() {
    this.line.geometry.dispose();
    this.line.material.dispose();
  }
}

/**
 * Create parallelogram construction lines for vector addition.
 * Shows the parallelogram rule: p + q = result,
 * drawing dashed lines from p's tip to result and q's tip to result.
 *
 * @param {object} p — Vector p direction {x, y, z}
 * @param {object} q — Vector q direction {x, y, z}
 * @param {object} [options]
 * @param {number} [options.colorP] — Color matching vector p
 * @param {number} [options.colorQ] — Color matching vector q
 * @returns {{ lineFromP: DashedLine, lineFromQ: DashedLine }}
 */
export function createParallelogramLines(p, q, options = {}) {
  const colorP = options.colorP ?? COLORS.vectorP;
  const colorQ = options.colorQ ?? COLORS.vectorQ;

  const result = { x: p.x + q.x, y: p.y + q.y, z: p.z + q.z };

  // Dashed line from tip of p to tip of result (parallel to q)
  const lineFromP = new DashedLine(
    { x: p.x, y: p.y, z: p.z },
    result,
    { color: colorQ, opacity: 0.35 }
  );

  // Dashed line from tip of q to tip of result (parallel to p)
  const lineFromQ = new DashedLine(
    { x: q.x, y: q.y, z: q.z },
    result,
    { color: colorP, opacity: 0.35 }
  );

  return { lineFromP, lineFromQ };
}
