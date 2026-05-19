/**
 * CameraController.js
 * Manages desktop camera interaction using Three.js OrbitControls.
 * Features smooth damping, limits optimized for mathematical visualization,
 * and AR state awareness (disables controls when in WebXR mode).
 *
 * Mobile-optimized: higher damping, reduced touch sensitivity,
 * mobile-safe update frequency.
 */

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { isMobile } from '../core/MobileDetect.js';

export class CameraController {
  /**
   * @param {THREE.Camera} camera
   * @param {HTMLElement} domElement
   */
  constructor(camera, domElement) {
    this._camera = camera;
    this._controls = new OrbitControls(camera, domElement);
    this._isMobile = isMobile();
    
    this._configureControls();
  }

  /**
   * Configure OrbitControls with settings optimized for 3D math visualization.
   * Mobile: higher damping for smoother feel, reduced sensitivity.
   */
  _configureControls() {
    // Damping (smooth inertia) — higher on mobile for smoother feel
    this._controls.enableDamping = true;
    this._controls.dampingFactor = this._isMobile ? 0.12 : 0.05;

    // Speeds — reduced on mobile for precision touch control
    this._controls.rotateSpeed = this._isMobile ? 0.45 : 0.65;
    this._controls.zoomSpeed = this._isMobile ? 0.6 : 0.8;
    this._controls.panSpeed = this._isMobile ? 0.35 : 0.5;

    // Distance Limits
    this._controls.minDistance = this._isMobile ? 2.5 : 1.5;
    this._controls.maxDistance = this._isMobile ? 18 : 25;

    // Angle Limits (prevent going too far below the grid)
    this._controls.maxPolarAngle = Math.PI * 0.85;

    // Mobile: enable touch gestures explicitly
    if (this._isMobile) {
      this._controls.touches = {
        ONE: 0, // ROTATE
        TWO: 2, // DOLLY_PAN
      };
    }

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
   * Slower on mobile to reduce GPU load.
   * @param {boolean} enabled 
   */
  setAutoRotate(enabled) {
    this._controls.autoRotate = enabled;
    this._controls.autoRotateSpeed = this._isMobile ? 0.8 : 1.5;
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
