/**
 * VectorScene.js
 * Main scene orchestrator — composes the coordinate system,
 * grid, vectors, operations, animations, AR, and UI.
 * Phase 4: Adds OrbitControls, ControlPanel, improved lighting.
 */

import * as THREE from 'three';
import { CoordinateSystem } from '../math/CoordinateSystem.js';
import { CoordinateGrid } from '../vectors/CoordinateGrid.js';
import { VectorFactory } from '../vectors/VectorFactory.js';
import { OperationManager } from '../math/OperationManager.js';
import { TutorialManager } from '../education/TutorialManager.js';
import { ControlPanel } from '../ui/ControlPanel.js';
import { CameraController } from '../interaction/CameraController.js';
import { ARSessionManager } from '../ar/ARSessionManager.js';
import { HitTestManager } from '../ar/HitTestManager.js';
import { Reticle } from '../ar/Reticle.js';
import { COLORS } from '../core/Constants.js';

export class VectorScene {
  /**
   * @param {import('../core/Engine.js').Engine} engine
   */
  constructor(engine) {
    this._engine = engine;
    this._scene = engine.getScene();
    this._renderer = engine.getRenderer();
    this._camera = engine.getCamera();

    // Sub-systems
    this._arRoot = new THREE.Group();
    this._scene.add(this._arRoot);
    
    this._coordinateSystem = null;
    this._grid = null;
    this._vectorFactory = new VectorFactory();
    this._operationManager = null;
    this._controlPanel = null;
    this._cameraController = null;
    this._arSession = null;
    this._hitTestManager = null;
    this._reticle = null;

    // State
    this._isARMode = false;
  }

  /**
   * Initialize all visual components.
   */
  init() {
    this._setupCameraInteraction();
    this._setupCoordinateSystem();
    this._setupGrid();
    this._setupExampleVectors();
    this._setupOperations();
    this._setupAR();
    this._setupEnhancedLighting();
    this._registerUpdateLoop();
  }

  // ─── Setup Methods ─────────────────────────────────────

  _setupCameraInteraction() {
    this._cameraController = new CameraController(this._camera, this._renderer.domElement);
  }

  _setupCoordinateSystem() {
    this._coordinateSystem = new CoordinateSystem({ axisLength: 5 });
    this._coordinateSystem.addTo(this._arRoot);
  }

  _setupGrid() {
    this._grid = new CoordinateGrid({ size: 10, divisions: 10 });
    this._grid.addTo(this._arRoot);
  }

  _setupExampleVectors() {
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
  }

  _setupOperations() {
    this._operationManager = new OperationManager(this._arRoot, this._vectorFactory);
    this._tutorialManager = new TutorialManager(this._operationManager);
    this._controlPanel = new ControlPanel(this._operationManager, this._vectorFactory, this._tutorialManager);
  }

  _setupAR() {
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
    if (this._reticle.isVisible() && this._isARMode) {
      this._arRoot.position.setFromMatrixPosition(this._reticle.mesh.matrix);
      // Optional: align rotation with reticle
      // this._arRoot.quaternion.setFromRotationMatrix(this._reticle.mesh.matrix);
      this._arRoot.visible = true;
    }
  }

  /**
   * Cinematic lighting rig for futuristic lab atmosphere.
   */
  _setupEnhancedLighting() {
    // Warm key fill — main depth light
    const keyFill = new THREE.PointLight(0xffffff, 0.6, 25);
    keyFill.position.set(-3, 2, 4);
    this._scene.add(keyFill);

    // Cool rim light — edge separation
    const rimLight = new THREE.PointLight(0xe2e8f0, 0.4, 18);
    rimLight.position.set(3, 5, -4);
    this._scene.add(rimLight);

    // Subtle backlight — prevents flat rear faces
    const backLight = new THREE.PointLight(0xedf2f7, 0.3, 20);
    backLight.position.set(0, -2, -5);
    this._scene.add(backLight);

    // Low accent spot — highlights origin area
    const spotLight = new THREE.SpotLight(0xffffff, 0.2, 15, Math.PI / 6, 0.8);
    spotLight.position.set(0, 8, 0);
    spotLight.target.position.set(0, 0, 0);
    this._scene.add(spotLight);
    this._scene.add(spotLight.target);
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
    if (frame) {
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

  getVectorFactory() { return this._vectorFactory; }
  getOperationManager() { return this._operationManager; }
  getCoordinateSystem() { return this._coordinateSystem; }
  getGrid() { return this._grid; }
  getCameraController() { return this._cameraController; }
}
