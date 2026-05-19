/**
 * Tween.js
 * Lightweight custom tween engine — no external dependencies.
 * Supports multiple easing functions and chainable tweens.
 */

// ─── Easing Functions ────────────────────────────────────

export const Easing = {
  linear: (t) => t,

  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => --t * t * t + 1,
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  easeInQuart: (t) => t * t * t * t,
  easeOutQuart: (t) => 1 - --t * t * t * t,
  easeInOutQuart: (t) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,

  easeOutElastic: (t) => {
    const p = 0.3;
    return Math.pow(2, -10 * t) * Math.sin(((t - p / 4) * (2 * Math.PI)) / p) + 1;
  },

  easeOutBack: (t) => {
    const s = 1.70158;
    return --t * t * ((s + 1) * t + s) + 1;
  },

  easeOutBounce: (t) => {
    if (t < 1 / 2.75) return 7.5625 * t * t;
    if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  },
};

// ─── Tween Class ─────────────────────────────────────────

export class Tween {
  /**
   * @param {object} target — The object to tween properties on
   * @param {object} to — Target property values { x: 5, opacity: 1 }
   * @param {object} [options]
   * @param {number} [options.duration=1] — Duration in seconds
   * @param {string|Function} [options.easing='easeInOutCubic']
   * @param {number} [options.delay=0] — Delay before starting (seconds)
   * @param {Function} [options.onUpdate] — Called each frame with progress (0..1)
   * @param {Function} [options.onComplete] — Called when tween finishes
   */
  constructor(target, to, options = {}) {
    this._target = target;
    this._to = to;
    this._from = {};
    this._duration = options.duration ?? 1;
    this._delay = options.delay ?? 0;
    this._onUpdate = options.onUpdate || null;
    this._onComplete = options.onComplete || null;

    // Resolve easing function
    if (typeof options.easing === 'function') {
      this._easing = options.easing;
    } else {
      this._easing = Easing[options.easing] || Easing.easeInOutCubic;
    }

    this._elapsed = 0;
    this._started = false;
    this._complete = false;

    // Snapshot starting values
    for (const key of Object.keys(this._to)) {
      this._from[key] = this._target[key] ?? 0;
    }
  }

  /**
   * Update the tween. Called once per frame.
   * @param {number} delta — Time since last frame (seconds)
   * @returns {boolean} True if the tween is complete
   */
  update(delta) {
    if (this._complete) return true;

    this._elapsed += delta;

    // Handle delay
    if (this._elapsed < this._delay) return false;

    const activeTime = this._elapsed - this._delay;
    const rawProgress = this._duration > 0 ? Math.min(activeTime / this._duration, 1) : 1;
    const easedProgress = this._easing(rawProgress);

    // Interpolate each property
    for (const key of Object.keys(this._to)) {
      const from = this._from[key];
      const to = this._to[key];
      this._target[key] = from + (to - from) * easedProgress;
    }

    if (this._onUpdate) {
      this._onUpdate(easedProgress);
    }

    if (rawProgress >= 1) {
      this._complete = true;
      if (this._onComplete) this._onComplete();
      return true;
    }

    return false;
  }

  /**
   * Whether the tween has finished.
   */
  get isComplete() {
    return this._complete;
  }

  /**
   * Reset the tween to the beginning.
   */
  reset() {
    this._elapsed = 0;
    this._complete = false;
    for (const key of Object.keys(this._from)) {
      this._target[key] = this._from[key];
    }
  }
}

// ─── TweenGroup ──────────────────────────────────────────

/**
 * Manages multiple concurrent tweens.
 */
export class TweenGroup {
  constructor() {
    /** @type {Tween[]} */
    this._tweens = [];
  }

  /**
   * Add a tween to the group.
   * @param {Tween} tween
   * @returns {Tween}
   */
  add(tween) {
    this._tweens.push(tween);
    return tween;
  }

  /**
   * Convenience: create a tween and add it.
   * @param {object} target
   * @param {object} to
   * @param {object} [options]
   * @returns {Tween}
   */
  create(target, to, options = {}) {
    const tween = new Tween(target, to, options);
    this._tweens.push(tween);
    return tween;
  }

  /**
   * Update all tweens. Call once per frame.
   * @param {number} delta
   */
  update(delta) {
    this._tweens = this._tweens.filter((t) => !t.update(delta));
  }

  /**
   * Clear all tweens.
   */
  clear() {
    this._tweens = [];
  }

  /**
   * Number of active tweens.
   */
  get activeCount() {
    return this._tweens.length;
  }
}
