/**
 * Engine.js
 * Core rendering engine. Owns the renderer, camera, scene,
 * lighting, resize handling, and animation loop.
 *
 * Other modules plug in via `onUpdate(callback)`.
 */

import * as THREE from 'three';
import { RENDERER, CAMERA, LIGHTING, COLORS, ATMOSPHERE } from './Constants.js';

export class Engine {
  /**
   * @param {HTMLElement} container — DOM element to append the canvas to
   */
  constructor(container = document.body) {
    this._container = container;
    this._updateCallbacks = [];
    this._clock = new THREE.Clock();
    this._xrEnabled = false;

    this._initScene();
    this._initCamera();
    this._initRenderer();
    this._initLighting();
    this._initResize();
  }

  // ─── Initialization ──────────────────────────────────

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparent to show CSS background
    this.scene.fog = new THREE.Fog(
      ATMOSPHERE.fog.color,
      ATMOSPHERE.fog.near,
      ATMOSPHERE.fog.far
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
    this.renderer = new THREE.WebGLRenderer({
      antialias: RENDERER.antialias,
      alpha: RENDERER.alpha,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, RENDERER.pixelRatioClamp));
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

    const hemisphere = new THREE.HemisphereLight(
      LIGHTING.hemisphere.skyColor,
      LIGHTING.hemisphere.groundColor,
      LIGHTING.hemisphere.intensity
    );
    this.scene.add(hemisphere);
  }

  _initResize() {
    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, RENDERER.pixelRatioClamp));
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
    this.renderer.setAnimationLoop((timestamp, frame) => {
      const delta = this._clock.getDelta();
      const elapsed = this._clock.getElapsedTime();

      for (const cb of this._updateCallbacks) {
        cb(delta, elapsed, frame);
      }

      this.renderer.render(this.scene, this.camera);
    });
  }

  /**
   * Stop the animation loop.
   */
  stop() {
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

  getScene() { return this.scene; }
  getCamera() { return this.camera; }
  getRenderer() { return this.renderer; }
}
