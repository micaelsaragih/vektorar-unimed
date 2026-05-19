/**
 * CameraController.js
 * Manages desktop camera interaction using Three.js OrbitControls.
 * Features smooth damping, limits optimized for mathematical visualization,
 * and AR state awareness (disables controls when in WebXR mode).
 */

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class CameraController {
  /**
   * @param {THREE.Camera} camera
   * @param {HTMLElement} domElement
   */
  constructor(camera, domElement) {
    this._camera = camera;
    this._controls = new OrbitControls(camera, domElement);
    
    this._configureControls();
  }

  /**
   * Configure OrbitControls with settings optimized for 3D math visualization.
   */
  _configureControls() {
    // Damping (smooth inertia)
    this._controls.enableDamping = true;
    this._controls.dampingFactor = 0.05;

    // Speeds
    this._controls.rotateSpeed = 0.65;
    this._controls.zoomSpeed = 0.8;
    this._controls.panSpeed = 0.5;

    // Distance Limits
    this._controls.minDistance = 1.5;
    this._controls.maxDistance = 25;

    // Angle Limits (prevent going too far below the grid)
    this._controls.maxPolarAngle = Math.PI * 0.85;

    // Default target focused slightly above the origin
    this._controls.target.set(0, 0.5, 0);
    
    // Initial update to apply settings
    this._controls.update();
  }

  /**
   * Update controls. Must be called per-frame for damping to work.
   */
  update() {
    if (this._controls.enabled) {
      this._controls.update();
    }
  }

  /**
   * Enable or disable camera controls.
   * Useful for toggling interaction during AR sessions or UI overlays.
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this._controls.enabled = enabled;
  }

  /**
   * Enable cinematic auto-rotation for landing page/showcase.
   * @param {boolean} enabled 
   */
  setAutoRotate(enabled) {
    this._controls.autoRotate = enabled;
    this._controls.autoRotateSpeed = 1.5;
  }

  /**
   * Reset camera to default position and look at target.
   */
  reset(position = { x: 4, y: 3, z: 5 }, target = { x: 0, y: 0.5, z: 0 }) {
    this._camera.position.set(position.x, position.y, position.z);
    this._controls.target.set(target.x, target.y, target.z);
    this._controls.update();
  }
}
