/**
 * Engine.js
 * Core rendering engine. Owns the renderer, camera, scene,
 * lighting, resize handling, and animation loop.
 *
 * Other modules plug in via `onUpdate(callback)`.
 *
 * Mobile-optimized: adapts renderer quality based on device capabilities.
 */

import * as THREE from 'three';
import { RENDERER, CAMERA, LIGHTING, COLORS, ATMOSPHERE } from './Constants.js';
import { isMobile, isAndroid, getOptimalPixelRatio } from './MobileDetect.js';

export class Engine {
  /**
   * @param {HTMLElement} container — DOM element to append the canvas to
   */
  constructor(container = document.body) {
    this._container = container;
    this._updateCallbacks = [];
    this._clock = new THREE.Clock();
    this._xrEnabled = false;
    this._isRunning = false;

    this._initScene();
    this._initCamera();
    this._initRenderer();
    this._initLighting();
    this._initResize();

    console.log('[Engine] ✓ renderer initialized', {
      mobile: isMobile(),
      android: isAndroid(),
      pixelRatio: this.renderer.getPixelRatio(),
      antialias: !isMobile(),
    });
  }

  // ─── Initialization ──────────────────────────────────

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparent to show CSS background

    // Lighter fog on mobile to reduce per-fragment work
    const fogFar = isMobile() ? ATMOSPHERE.fog.far * 1.3 : ATMOSPHERE.fog.far;
    this.scene.fog = new THREE.Fog(
      ATMOSPHERE.fog.color,
      ATMOSPHERE.fog.near,
      fogFar
    );
  }

  _initCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(
      CAMERA.fov, aspect, CAMERA.near, CAMERA.far
    );
    this.camera.position.set(CAMERA.position.x, CAMERA.position.y, CAMERA.position.z);
    this.camera.lookAt(new THREE.Vector3(CAMERA.lookAt.x, CAMERA.lookAt.y, CAMERA.lookAt.z));
    this.scene.add(this.camera);
  }

  _initRenderer() {
    // Mobile: disable antialias to reduce GPU fill-rate pressure
    const useAntialias = isMobile() ? false : RENDERER.antialias;
    const optimalDPR = getOptimalPixelRatio();

    this.renderer = new THREE.WebGLRenderer({
      antialias: useAntialias,
      alpha: RENDERER.alpha,
      powerPreference: isMobile() ? 'low-power' : 'high-performance',
      // Reduce precision on Android to ease shader compilation
      precision: isAndroid() ? 'mediump' : 'highp',
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(optimalDPR);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = ATMOSPHERE.toneMappingExposure;

    this._container.appendChild(this.renderer.domElement);
  }

  _initLighting() {
    const ambient = new THREE.AmbientLight(
      LIGHTING.ambient.color, LIGHTING.ambient.intensity
    );
    this.scene.add(ambient);

    const directional = new THREE.DirectionalLight(
      LIGHTING.directional.color, LIGHTING.directional.intensity
    );
    directional.position.set(
      LIGHTING.directional.position.x,
      LIGHTING.directional.position.y,
      LIGHTING.directional.position.z
    );
    this.scene.add(directional);

    // Skip hemisphere light on mobile — ambient + directional is sufficient
    if (!isMobile()) {
      const hemisphere = new THREE.HemisphereLight(
        LIGHTING.hemisphere.skyColor,
        LIGHTING.hemisphere.groundColor,
        LIGHTING.hemisphere.intensity
      );
      this.scene.add(hemisphere);
    }
  }

  _initResize() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      // Debounce resize to prevent excessive GPU reconfiguration on mobile
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(getOptimalPixelRatio());
      }, isMobile() ? 200 : 50);
    });
  }

  // ─── Public API ──────────────────────────────────────

  /**
   * Register a per-frame update callback.
   * @param {(delta: number, elapsed: number, frame?: XRFrame) => void} callback
   */
  onUpdate(callback) {
    this._updateCallbacks.push(callback);
  }

  /**
   * Remove an update callback.
   * @param {Function} callback
   */
  offUpdate(callback) {
    this._updateCallbacks = this._updateCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Start the animation loop.
   */
  start() {
    if (this._isRunning) return;
    this._isRunning = true;

    this.renderer.setAnimationLoop((timestamp, frame) => {
      const delta = this._clock.getDelta();
      const elapsed = this._clock.getElapsedTime();

      for (const cb of this._updateCallbacks) {
        try {
          cb(delta, elapsed, frame);
        } catch (err) {
          console.error('[Engine] Update callback error:', err);
        }
      }

      this.renderer.render(this.scene, this.camera);
    });

    console.log('[Engine] ✓ animation loop started');
  }

  /**
   * Stop the animation loop.
   */
  stop() {
    this._isRunning = false;
    this.renderer.setAnimationLoop(null);
  }

  /**
   * Enable WebXR on the renderer.
   * Sets scene background to dark on desktop, null only during XR sessions.
   */
  enableXR() {
    this._xrEnabled = true;
    this.renderer.xr.enabled = true;

    // Keep desktop background transparent; VectorScene handles AR ↔ desktop transitions
    this.scene.background = null;
  }

  /** @returns {boolean} */
  get isRunning() { return this._isRunning; }

  getScene() { return this.scene; }
  getCamera() { return this.camera; }
  getRenderer() { return this.renderer; }
}
