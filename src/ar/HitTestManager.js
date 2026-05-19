/**
 * HitTestManager.js
 * Manages WebXR hit-test source lifecycle.
 * Extracted from the duplicated logic across xr-hit-cube.js,
 * xr-hit-models.js, and xr-domOverlay.js.
 */

export class HitTestManager {
  constructor() {
    this._hitTestSource = null;
    this._hitTestSourceRequested = false;
    this._hitResult = null;
  }

  /**
   * Call once per frame inside the render loop.
   * Manages hit-test source request and result extraction.
   *
   * @param {THREE.WebGLRenderer} renderer
   * @param {XRFrame} frame — The current XR frame
   */
  update(renderer, frame) {
    if (!frame) {
      this._hitResult = null;
      return;
    }

    const referenceSpace = renderer.xr.getReferenceSpace();
    const session = renderer.xr.getSession();

    // Request hit-test source once per session
    if (!this._hitTestSourceRequested) {
      session
        .requestReferenceSpace('viewer')
        .then((viewerSpace) => {
          session
            .requestHitTestSource({ space: viewerSpace })
            .then((source) => {
              this._hitTestSource = source;
            });
        });

      this._hitTestSourceRequested = true;

      session.addEventListener('end', () => {
        this._hitTestSourceRequested = false;
        this._hitTestSource = null;
        this._hitResult = null;
      });
    }

    // Process hit-test results
    if (this._hitTestSource) {
      const results = frame.getHitTestResults(this._hitTestSource);
      if (results.length > 0) {
        const hit = results[0];
        const pose = hit.getPose(referenceSpace);
        this._hitResult = pose ? pose.transform.matrix : null;
      } else {
        this._hitResult = null;
      }
    }
  }

  /**
   * Whether a hit was detected this frame.
   * @returns {boolean}
   */
  hasHit() {
    return this._hitResult !== null;
  }

  /**
   * Get the hit result matrix (Float32Array).
   * @returns {Float32Array | null}
   */
  getHitMatrix() {
    return this._hitResult;
  }
}
