/**
 * VectorAnimator.js
 * Provides animated transitions for Vector3D instances:
 * - Grow-in from origin (vector "draws itself")
 * - Fade-in opacity
 * - Morph from one direction to another
 * - Translate origin smoothly
 */

import { Tween, TweenGroup, Easing } from './Tween.js';
import { ANIM } from '../core/Constants.js';

export class VectorAnimator {
  constructor() {
    this._tweenGroup = new TweenGroup();
  }

  /**
   * Update all active animations. Call once per frame.
   * @param {number} delta — Seconds since last frame
   */
  update(delta) {
    this._tweenGroup.update(delta);
  }

  /**
   * Animate a vector "growing" from zero to its full direction.
   * The vector visually draws itself from the origin outward.
   *
   * @param {import('../vectors/Vector3D.js').Vector3D} vector
   * @param {object} [options]
   * @param {number} [options.duration]
   * @param {number} [options.delay]
   * @param {Function} [options.onComplete]
   * @returns {Tween}
   */
  growIn(vector, options = {}) {
    const duration = options.duration ?? ANIM.vectorGrowDuration;
    const delay = options.delay ?? 0;

    const target = vector.getDirection();
    const finalX = target.x;
    const finalY = target.y;
    const finalZ = target.z;

    // Start from zero
    vector.setDirection(0.001, 0.001, 0.001);
    vector.setVisible(true);

    const proxy = { t: 0 };

    return this._tweenGroup.create(proxy, { t: 1 }, {
      duration,
      delay,
      easing: 'easeOutCubic',
      onUpdate: () => {
        const t = proxy.t;
        vector.setDirection(
          finalX * t,
          finalY * t,
          finalZ * t
        );
      },
      onComplete: options.onComplete || null,
    });
  }

  /**
   * Animate a vector fading in (opacity 0 → 1).
   * Uses material opacity on all meshes in the vector group.
   *
   * @param {import('../vectors/Vector3D.js').Vector3D} vector
   * @param {object} [options]
   * @param {number} [options.duration]
   * @param {number} [options.delay]
   * @returns {Tween}
   */
  fadeIn(vector, options = {}) {
    const duration = options.duration ?? ANIM.vectorFadeDuration;
    const delay = options.delay ?? 0;

    // Set initial opacity to 0
    this._setGroupOpacity(vector.group, 0);
    vector.setVisible(true);

    const proxy = { opacity: 0 };

    return this._tweenGroup.create(proxy, { opacity: 1 }, {
      duration,
      delay,
      easing: 'easeOutQuad',
      onUpdate: () => {
        this._setGroupOpacity(vector.group, proxy.opacity);
      },
    });
  }

  /**
   * Animate a vector fading out (opacity → 0), then optionally hide it.
   *
   * @param {import('../vectors/Vector3D.js').Vector3D} vector
   * @param {object} [options]
   * @param {number} [options.duration]
   * @param {number} [options.delay]
   * @param {boolean} [options.hideOnComplete=true]
   * @returns {Tween}
   */
  fadeOut(vector, options = {}) {
    const duration = options.duration ?? ANIM.vectorFadeDuration;
    const delay = options.delay ?? 0;
    const hideOnComplete = options.hideOnComplete !== false;

    const proxy = { opacity: 1 };

    return this._tweenGroup.create(proxy, { opacity: 0 }, {
      duration,
      delay,
      easing: 'easeInQuad',
      onUpdate: () => {
        this._setGroupOpacity(vector.group, proxy.opacity);
      },
      onComplete: () => {
        if (hideOnComplete) vector.setVisible(false);
      },
    });
  }

  /**
   * Animate a vector morphing from its current direction to a new one.
   *
   * @param {import('../vectors/Vector3D.js').Vector3D} vector
   * @param {{ x: number, y: number, z: number }} targetDir
   * @param {object} [options]
   * @param {number} [options.duration]
   * @param {number} [options.delay]
   * @param {Function} [options.onComplete]
   * @returns {Tween}
   */
  morphTo(vector, targetDir, options = {}) {
    const duration = options.duration ?? ANIM.vectorGrowDuration;
    const delay = options.delay ?? 0;
    const current = vector.getDirection();

    const proxy = { t: 0 };

    return this._tweenGroup.create(proxy, { t: 1 }, {
      duration,
      delay,
      easing: 'easeInOutCubic',
      onUpdate: () => {
        const t = proxy.t;
        vector.setDirection(
          current.x + (targetDir.x - current.x) * t,
          current.y + (targetDir.y - current.y) * t,
          current.z + (targetDir.z - current.z) * t
        );
      },
      onComplete: options.onComplete || null,
    });
  }

  /**
   * Animate a vector's origin moving to a new position.
   *
   * @param {import('../vectors/Vector3D.js').Vector3D} vector
   * @param {{ x: number, y: number, z: number }} targetOrigin
   * @param {object} [options]
   * @param {number} [options.duration]
   * @param {number} [options.delay]
   * @returns {Tween}
   */
  moveOrigin(vector, targetOrigin, options = {}) {
    const duration = options.duration ?? ANIM.vectorGrowDuration;
    const delay = options.delay ?? 0;

    // Read current origin from the group position
    const currentOrigin = {
      x: vector.group.position.x,
      y: vector.group.position.y,
      z: vector.group.position.z,
    };

    const proxy = { t: 0 };

    return this._tweenGroup.create(proxy, { t: 1 }, {
      duration,
      delay,
      easing: 'easeInOutCubic',
      onUpdate: () => {
        const t = proxy.t;
        vector.setOrigin(
          currentOrigin.x + (targetOrigin.x - currentOrigin.x) * t,
          currentOrigin.y + (targetOrigin.y - currentOrigin.y) * t,
          currentOrigin.z + (targetOrigin.z - currentOrigin.z) * t
        );
      },
    });
  }

  /**
   * Animate a THREE.Group's opacity (used for dashed lines, etc).
   *
   * @param {THREE.Group} group
   * @param {number} fromOpacity
   * @param {number} toOpacity
   * @param {object} [options]
   * @returns {Tween}
   */
  animateGroupOpacity(group, fromOpacity, toOpacity, options = {}) {
    const duration = options.duration ?? ANIM.constructionLineDuration;
    const delay = options.delay ?? 0;

    this._setGroupOpacity(group, fromOpacity);

    const proxy = { opacity: fromOpacity };

    return this._tweenGroup.create(proxy, { opacity: toOpacity }, {
      duration,
      delay,
      easing: 'easeOutQuad',
      onUpdate: () => {
        this._setGroupOpacity(group, proxy.opacity);
      },
    });
  }

  /**
   * Set opacity for all materials in a group recursively.
   * @private
   */
  _setGroupOpacity(group, opacity) {
    group.traverse((child) => {
      if (child.material) {
        child.material.transparent = true;
        child.material.opacity = opacity;
        child.material.needsUpdate = true;
      }
    });
  }

  /**
   * Clear all active animations.
   */
  clear() {
    this._tweenGroup.clear();
  }

  /**
   * Number of active animations.
   */
  get activeCount() {
    return this._tweenGroup.activeCount;
  }
}
