/**
 * VectorScene.js
 * Main scene orchestrator — composes the coordinate system,
 * grid, vectors, operations, animations, AR, and UI.
 *
 * Phase 5: Progressive async initialization for mobile stability.
 * Systems are initialized in stages with yield points to prevent
 * main thread blocking on Android devices.
 */

import * as THREE from 'three';
import { COLORS } from '../core/Constants.js';
import { isMobile, yieldToMain } from '../core/MobileDetect.js';

export class VectorScene {
  /**
   * @param {import('../core/Engine.js').Engine} engine
   */
  constructor(engine) {
    this._engine = engine;
    this._scene = engine.getScene();
    this._renderer = engine.getRenderer();
    this._camera = engine.getCamera();

    // Sub-systems (lazily initialized)
    this._arRoot = new THREE.Group();
    this._scene.add(this._arRoot);
    
    this._coordinateSystem = null;
    this._grid = null;
    this._vectorFactory = null;
    this._operationManager = null;
    this._controlPanel = null;
    this._cameraController = null;
    this._arSession = null;
    this._hitTestManager = null;
    this._reticle = null;
    this._tutorialManager = null;

    // State
    this._isARMode = false;
    this._isInitialized = false;
    this._initPromise = null;
  }

  /**
   * Progressive async initialization — yields to main thread between
   * each subsystem to prevent Android freeze.
   * 
   * @param {(progress: number, message: string) => void} [onProgress] 
   * @returns {Promise<void>}
   */
  async initProgressive(onProgress) {
    if (this._isInitialized) return;
    if (this._initPromise) return this._initPromise;

    this._initPromise = this._doProgressiveInit(onProgress);
    await this._initPromise;
  }

  /** @private */
  async _doProgressiveInit(onProgress) {
    const report = (pct, msg) => {
      console.log(`[VectorScene] ${msg} (${pct}%)`);
      if (onProgress) onProgress(pct, msg);
    };

    try {
      // Phase 1: Camera controls (lightweight)
      report(10, 'Menginisialisasi kamera...');
      await this._setupCameraInteraction();
      await yieldToMain(16); // one frame

      // Phase 2: Coordinate system
      report(25, 'Membangun sistem koordinat...');
      await this._setupCoordinateSystem();
      await yieldToMain(16);

      // Phase 3: Grid
      report(40, 'Membuat grid...');
      await this._setupGrid();
      await yieldToMain(16);

      // Phase 4: Vectors
      report(55, 'Membuat vektor...');
      await this._setupExampleVectors();
      await yieldToMain(16);

      // Phase 5: Operations + UI (heavier — builds DOM)
      report(70, 'Menyiapkan operasi...');
      await this._setupOperations();
      await yieldToMain(32); // extra breathing room after DOM work

      // Phase 6: Enhanced lighting (lighter on mobile)
      report(85, 'Menyiapkan pencahayaan...');
      this._setupEnhancedLighting();
      await yieldToMain(16);

      // Phase 7: Register update loop
      report(95, 'Memulai render loop...');
      this._registerUpdateLoop();

      this._isInitialized = true;
      report(100, '✓ Visualisasi siap');
      console.log('[VectorScene] ✓ all systems initialized');

    } catch (err) {
      console.error('[VectorScene] Initialization error:', err);
      // Even if some subsystem fails, mark as initialized to prevent retries
      this._isInitialized = true;
      throw err;
    }
  }

  /**
   * Legacy synchronous init (kept for backward compatibility if needed).
   * NOT recommended on mobile — use initProgressive() instead.
   */
  init() {
    console.warn('[VectorScene] Using synchronous init — prefer initProgressive() for mobile');
    this._setupCameraInteraction();
    this._setupCoordinateSystem();
    this._setupGrid();
    this._setupExampleVectors();
    this._setupOperations();
    this._setupEnhancedLighting();
    this._registerUpdateLoop();
    this._isInitialized = true;
  }

  // ─── Setup Methods ─────────────────────────────────────

  async _setupCameraInteraction() {
    const { CameraController } = await import('../interaction/CameraController.js');
    this._cameraController = new CameraController(this._camera, this._renderer.domElement);
    console.log('[VectorScene] ✓ controls initialized');
  }

  async _setupCoordinateSystem() {
    const { CoordinateSystem } = await import('../math/CoordinateSystem.js');
    this._coordinateSystem = new CoordinateSystem({ axisLength: 5 });
    this._coordinateSystem.addTo(this._arRoot);
    console.log('[VectorScene] ✓ coordinate system initialized');
  }

  async _setupGrid() {
    const { CoordinateGrid } = await import('../vectors/CoordinateGrid.js');
    this._grid = new CoordinateGrid({ size: 10, divisions: 10 });
    this._grid.addTo(this._arRoot);
    console.log('[VectorScene] ✓ grid initialized');
  }

  async _setupExampleVectors() {
    const { VectorFactory } = await import('../vectors/VectorFactory.js');
    this._vectorFactory = new VectorFactory();

    this._vectorFactory.create({
      name: 'p',
      x: 2, y: 1, z: 3,
      color: COLORS.vectorP,
    });

    this._vectorFactory.create({
      name: 'q',
      x: -1, y: 2, z: 1,
      color: COLORS.vectorQ,
    });

    this._vectorFactory.addAllTo(this._arRoot);
    console.log('[VectorScene] ✓ vectors initialized');
  }

  async _setupOperations() {
    const { OperationManager } = await import('../math/OperationManager.js');
    const { TutorialManager } = await import('../education/TutorialManager.js');
    const { ControlPanel } = await import('../ui/ControlPanel.js');

    this._operationManager = new OperationManager(this._arRoot, this._vectorFactory);
    this._tutorialManager = new TutorialManager(this._operationManager);
    this._controlPanel = new ControlPanel(this._operationManager, this._vectorFactory, this._tutorialManager);
    console.log('[VectorScene] ✓ operations + UI initialized');
  }

  async initializeARSafe() {
    try {
      if (!('xr' in navigator)) {
        console.warn('[WebXR] navigator.xr not found, skipping AR init.');
        return;
      }
      
      // Defensively check for immersive-ar support with timeout to prevent Android freeze
      const supportPromise = navigator.xr.isSessionSupported('immersive-ar');
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000));
      
      let supported = false;
      try {
        supported = await Promise.race([supportPromise, timeoutPromise]);
      } catch (e) {
        console.warn('[WebXR] Support check timed out or failed:', e);
      }
      
      if (!supported) {
        console.warn('[WebXR] immersive-ar not supported or rejected.');
        // Even if not supported, we can initialize the button to show "AR NOT SUPPORTED"
      }

      await this._setupAR();
      
      // Finally enable renderer xr AFTER it's safe
      this._engine.enableXR();
      console.log('[WebXR] ✓ AR initialized');
      
    } catch (e) {
      console.error('[WebXR] Fatal error during AR initialization:', e);
    }
  }

  async _setupAR() {
    const { ARSessionManager } = await import('../ar/ARSessionManager.js');
    const { HitTestManager } = await import('../ar/HitTestManager.js');
    const { Reticle } = await import('../ar/Reticle.js');

    const overlayElement = document.getElementById('overlay-content');
    this._arSession = new ARSessionManager(this._renderer, { overlayElement });
    this._hitTestManager = new HitTestManager();
    this._reticle = new Reticle();
    this._reticle.addTo(this._scene);
    this._arSession.createARButton(document.body);

    const controller = this._arSession.getController(0);
    controller.addEventListener('select', this._onSelect.bind(this));
    this._scene.add(controller);
  }

  _onSelect() {
    if (this._reticle && this._reticle.isVisible() && this._isARMode) {
      this._arRoot.position.setFromMatrixPosition(this._reticle.mesh.matrix);
      // Optional: align rotation with reticle
      // this._arRoot.quaternion.setFromRotationMatrix(this._reticle.mesh.matrix);
      this._arRoot.visible = true;
    }
  }

  /**
   * Cinematic lighting rig for futuristic lab atmosphere.
   * Reduced on mobile: fewer point lights, no spot light.
   */
  _setupEnhancedLighting() {
    // Warm key fill — main depth light
    const keyFill = new THREE.PointLight(0xffffff, 0.6, 25);
    keyFill.position.set(-3, 2, 4);
    this._scene.add(keyFill);

    if (isMobile()) {
      // Mobile: single additional light is sufficient with ambient from Engine
      const rimLight = new THREE.PointLight(0xe2e8f0, 0.3, 18);
      rimLight.position.set(3, 5, -4);
      this._scene.add(rimLight);
      console.log('[VectorScene] ✓ lighting initialized (mobile-optimized: 2 lights)');
    } else {
      // Desktop: full cinematic rig
      const rimLight = new THREE.PointLight(0xe2e8f0, 0.4, 18);
      rimLight.position.set(3, 5, -4);
      this._scene.add(rimLight);

      const backLight = new THREE.PointLight(0xedf2f7, 0.3, 20);
      backLight.position.set(0, -2, -5);
      this._scene.add(backLight);

      const spotLight = new THREE.SpotLight(0xffffff, 0.2, 15, Math.PI / 6, 0.8);
      spotLight.position.set(0, 8, 0);
      spotLight.target.position.set(0, 0, 0);
      this._scene.add(spotLight);
      this._scene.add(spotLight.target);
      console.log('[VectorScene] ✓ lighting initialized (desktop: 4 lights)');
    }
  }

  _registerUpdateLoop() {
    this._engine.onUpdate((delta, elapsed, frame) => {
      this._update(delta, elapsed, frame);
    });
  }

  // ─── Per-Frame Update ──────────────────────────────────

  _update(delta, elapsed, frame) {
    // Update orbit controls (disabled in AR)
    if (this._cameraController && !frame) {
      this._cameraController.update();
    }

    // Update operation animations
    if (this._operationManager) {
      this._operationManager.update(delta);
    }

    // Update AR hit-test
    if (frame && this._hitTestManager && this._reticle) {
      this._hitTestManager.update(this._renderer, frame);
      this._reticle.update(this._hitTestManager.getHitMatrix());

      if (!this._isARMode) {
        this._isARMode = true;
        this._onEnterAR();
      }
    } else if (this._isARMode) {
      this._isARMode = false;
      this._onExitAR();
    }
  }

  _onEnterAR() {
    this._scene.background = null;
    if (this._cameraController) this._cameraController.setEnabled(false);
    this._arRoot.visible = false;
    this._arRoot.scale.set(0.1, 0.1, 0.1); // Scale down for mobile AR
    const infoPanel = document.getElementById('ar-info-panel');
    if (infoPanel) infoPanel.style.display = 'block';
  }

  _onExitAR() {
    this._scene.background = null; // Transparent to show CSS background
    if (this._cameraController) this._cameraController.setEnabled(true);
    this._arRoot.visible = true;
    this._arRoot.position.set(0, 0, 0);
    this._arRoot.quaternion.identity();
    this._arRoot.scale.set(1, 1, 1);
    const infoPanel = document.getElementById('ar-info-panel');
    if (infoPanel) infoPanel.style.display = 'none';
  }

  // ─── Public API ────────────────────────────────────────

  /** @returns {boolean} Whether progressive init is complete */
  get isInitialized() { return this._isInitialized; }

  getVectorFactory() { return this._vectorFactory; }
  getOperationManager() { return this._operationManager; }
  getCoordinateSystem() { return this._coordinateSystem; }
  getGrid() { return this._grid; }
  getCameraController() { return this._cameraController; }
}
