/**
 * AnimationManager.js
 * Top-level animation coordinator.
 * Delegates to VectorAnimator and manages the frame update loop.
 */

import { VectorAnimator } from './VectorAnimator.js';

export class AnimationManager {
  constructor() {
    this._animator = new VectorAnimator();
  }

  /**
   * Get the vector animator for direct use.
   * @returns {VectorAnimator}
   */
  getAnimator() {
    return this._animator;
  }

  /**
   * Update all animations. Call once per frame.
   * @param {number} delta
   */
  update(delta) {
    this._animator.update(delta);
  }

  /**
   * Clear all animations.
   */
  clear() {
    this._animator.clear();
  }

  /**
   * Number of active animations.
   * @returns {number}
   */
  get activeCount() {
    return this._animator.activeCount;
  }
}
