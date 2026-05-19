/**
 * OperationManager.js
 * Central orchestrator for vector operation visualization.
 * Executes operation step sequences produced by VectorOperations.js,
 * creating animated vectors, construction lines, and labels.
 */

import * as THREE from 'three';
import * as VectorOps from './VectorOperations.js';
import { VectorAnimator } from '../animations/VectorAnimator.js';
import { DashedLine, createParallelogramLines } from '../vectors/DashedLine.js';
import { COLORS, ANIM } from '../core/Constants.js';

export class OperationManager {
  /**
   * @param {THREE.Scene} scene
   * @param {import('../vectors/VectorFactory.js').VectorFactory} vectorFactory
   */
  constructor(scene, vectorFactory) {
    this._scene = scene;
    this._factory = vectorFactory;
    this._animator = new VectorAnimator();

    // Track operation artifacts for cleanup
    /** @type {string[]} */
    this._operationVectorNames = [];
    /** @type {DashedLine[]} */
    this._constructionLines = [];
    /** @type {THREE.Group[]} */
    this._helperGroups = [];

    // Step sequencing state
    this._currentSteps = [];
    this._currentStepIndex = 0;
    this._isPlaying = false;
    this._isPaused = false;
    this._stepTimer = null;
    this._currentOpName = '';

    // Callbacks
    this._onStepChange = null;
    this._onComplete = null;
    this._onStatusChange = null;

    // Tutorial Mode
    this._isTutorialMode = false;
    this._currentOp = null;
  }

  // ─── Public API ──────────────────────────────────────────

  /**
   * Update animations. Call once per frame.
   * @param {number} delta
   */
  update(delta) {
    this._animator.update(delta);
  }

  runAddition(nameA, nameB) {
    const a = this._getVectorDir(nameA);
    const b = this._getVectorDir(nameB);
    if (!a || !b) return;

    const op = VectorOps.addition(nameA, a, nameB, b, COLORS.resultAdd);
    this._currentOpName = `${nameA} + ${nameB}`;
    this._currentOp = op;
    if (!this._isTutorialMode) this._executeOperation(op);
  }

  runSubtraction(nameA, nameB) {
    const a = this._getVectorDir(nameA);
    const b = this._getVectorDir(nameB);
    if (!a || !b) return;

    const op = VectorOps.subtraction(nameA, a, nameB, b, COLORS.resultSubtract);
    this._currentOpName = `${nameA} - ${nameB}`;
    this._currentOp = op;
    if (!this._isTutorialMode) this._executeOperation(op);
  }

  runScalarMultiply(scalar, nameV) {
    const v = this._getVectorDir(nameV);
    if (!v) return;

    const op = VectorOps.scalarMultiply(scalar, nameV, v, COLORS.resultScalar);
    this._currentOpName = `${scalar}${nameV}`;
    this._currentOp = op;
    if (!this._isTutorialMode) this._executeOperation(op);
  }

  runScalarThenSubtract(scalar, nameA, nameB) {
    const a = this._getVectorDir(nameA);
    const b = this._getVectorDir(nameB);
    if (!a || !b) return;

    const op = VectorOps.scalarMultiplyThenSubtract(scalar, nameA, a, nameB, b, COLORS.resultCross);
    this._currentOpName = `${scalar}${nameA} - ${nameB}`;
    this._currentOp = op;
    if (!this._isTutorialMode) this._executeOperation(op);
  }

  runDotProduct(nameA, nameB) {
    const a = this._getVectorDir(nameA);
    const b = this._getVectorDir(nameB);
    if (!a || !b) return;

    const op = VectorOps.dotProduct(nameA, a, nameB, b, COLORS.projection);
    this._currentOpName = `${nameA} · ${nameB}`;
    this._currentOp = op;
    if (!this._isTutorialMode) this._executeOperation(op);
  }

  runCrossProduct(nameA, nameB) {
    const a = this._getVectorDir(nameA);
    const b = this._getVectorDir(nameB);
    if (!a || !b) return;

    const op = VectorOps.crossProduct(nameA, a, nameB, b, COLORS.resultCross);
    this._currentOpName = `${nameA} × ${nameB}`;
    this._currentOp = op;
    if (!this._isTutorialMode) this._executeOperation(op);
  }

  runRotateZ(nameV, angleDeg) {
    const v = this._getVectorDir(nameV);
    if (!v) return;

    const op = VectorOps.rotateZ(nameV, v, angleDeg, COLORS.resultScalar);
    this._currentOpName = `Rotasi Z ${angleDeg}°`;
    this._currentOp = op;
    if (!this._isTutorialMode) this._executeOperation(op);
  }

  /**
   * Reset: clear all operation artifacts and restore original vectors.
   */
  reset() {
    // Stop any running sequence
    this._stopSequence();

    // Clear animations
    this._animator.clear();

    // Remove operation vectors
    for (const name of this._operationVectorNames) {
      const vec = this._factory.get(name);
      if (vec) {
        vec.removeFrom(this._scene);
        this._factory.remove(name);
      }
    }
    this._operationVectorNames = [];

    // Remove construction lines
    for (const line of this._constructionLines) {
      line.removeFrom(this._scene);
      line.dispose();
    }
    this._constructionLines = [];

    // Remove helper groups
    for (const group of this._helperGroups) {
      this._scene.remove(group);
      group.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    }
    this._helperGroups = [];

    // Restore original vector visibility and opacity
    for (const vec of this._factory.getAll()) {
      vec.setVisible(true);
      this._setGroupOpacity(vec.group, 1);
    }

    this._currentOpName = '';
    this._notifyStatus('reset', 'Siap');
  }

  /**
   * Whether an operation sequence is currently playing.
   * @returns {boolean}
   */
  get isPlaying() {
    return this._isPlaying;
  }

  /**
   * Current operation name.
   * @returns {string}
   */
  get currentOperation() {
    return this._currentOpName;
  }

  /**
   * Set callback for step changes.
   * @param {(stepIndex: number, totalSteps: number, description: string) => void} callback
   */
  onStepChange(callback) {
    this._onStepChange = callback;
  }

  /**
   * Set callback for operation completion.
   * @param {() => void} callback
   */
  onComplete(callback) {
    this._onComplete = callback;
  }

  /**
   * Set callback for status changes.
   * @param {(status: string, message: string) => void} callback
   */
  onStatusChange(callback) {
    this._onStatusChange = callback;
  }

  // ─── Tutorial API ────────────────────────────────────────

  setTutorialMode(enabled) {
    this._isTutorialMode = enabled;
  }

  getTotalSteps() {
    return this._currentOp ? this._currentOp.steps.length : 0;
  }

  getStepData(index) {
    if (!this._currentOp || !this._currentOp.steps[index]) return null;
    return this._currentOp.steps[index];
  }

  /**
   * In tutorial mode, jump to a specific step instantly, then animate that step.
   */
  executeToStep(stepIndex) {
    if (!this._currentOp) return;
    this.reset(); // clear everything
    this._currentSteps = this._currentOp.steps;
    
    // Fast-forward previous steps instantly
    for (let i = 0; i < stepIndex; i++) {
      this._executeStepInstant(this._currentSteps[i]);
    }
    
    // Animate the current step
    this._currentStepIndex = stepIndex;
    const step = this._currentSteps[stepIndex];
    if (step) {
      if (this._onStepChange) {
        this._onStepChange(stepIndex + 1, this._currentSteps.length, step.description || '');
      }
      this._executeSingleStepAnimated(step);
    }
  }

  // ─── Internal Execution ──────────────────────────────────

  /**
   * Execute an operation by stepping through its steps with animation.
   */
  _executeOperation(op) {
    // Clear previous operation first
    this.reset();

    this._currentSteps = op.steps;
    this._currentStepIndex = 0;
    this._isPlaying = true;

    this._notifyStatus('playing', `Memvisualisasikan ${this._currentOpName}...`);
    this._executeNextStep();
  }

  /**
   * Execute the next step in the current sequence.
   */
  _executeNextStep() {
    if (this._currentStepIndex >= this._currentSteps.length) {
      this._isPlaying = false;
      this._notifyStatus('complete', `${this._currentOpName} — Selesai`);
      if (this._onComplete) this._onComplete();
      return;
    }

    const step = this._currentSteps[this._currentStepIndex];
    const stepNum = this._currentStepIndex + 1;
    const totalSteps = this._currentSteps.length;

    // Notify step change
    if (this._onStepChange) {
      this._onStepChange(stepNum, totalSteps, step.description || '');
    }

    // Execute based on step type
    this._executeSingleStepAnimated(step);

    // Schedule next step if NOT in tutorial mode
    this._currentStepIndex++;
    if (!this._isTutorialMode) {
      this._stepTimer = setTimeout(() => {
        this._executeNextStep();
      }, ANIM.stepDelayMs + (step.type === 'create' ? ANIM.vectorGrowDuration * 1000 : 0));
    }
  }

  _executeSingleStepAnimated(step) {
    switch (step.type) {
      case 'highlight':
        this._executeHighlight(step);
        break;
      case 'create':
        this._executeCreate(step);
        break;
      case 'construction':
        this._executeConstruction(step, true);
        break;
      case 'label':
        this._executeLabel(step);
        break;
      case 'pause':
        // Just wait
        break;
      default:
        console.warn(`OperationManager: unknown step type "${step.type}"`);
    }
  }

  _executeStepInstant(step) {
    switch (step.type) {
      case 'create':
        this._executeCreate({ ...step, data: { ...step.data, animated: false } });
        break;
      case 'construction':
        this._executeConstruction(step, false);
        break;
    }
  }

  /**
   * Highlight a vector (brief pulse effect via opacity).
   */
  _executeHighlight(step) {
    const vec = this._factory.get(step.vectorName);
    if (!vec) return;

    // Quick pulse: dim then restore
    this._setGroupOpacity(vec.group, 0.4);
    setTimeout(() => {
      this._setGroupOpacity(vec.group, 1);
    }, 300);
  }

  /**
   * Create a new vector with animated grow-in.
   */
  _executeCreate(step) {
    const data = step.data;
    const name = step.vectorName;

    const vector = this._factory.create({
      name,
      x: data.x,
      y: data.y,
      z: data.z,
      color: data.color || COLORS.constructionLine,
      origin: data.origin || { x: 0, y: 0, z: 0 },
    });

    vector.addTo(this._scene);
    this._operationVectorNames.push(name);

    // Animate grow-in
    if (data.animated !== false) {
      this._animator.growIn(vector, {
        duration: ANIM.vectorGrowDuration,
      });
    }
  }

  /**
   * Create construction lines (parallelogram visualization).
   */
  _executeConstruction(step, animated = true) {
    const data = step.data;

    if (data.ghostVector) {
      this._createGhostLine(data.ghostVector, animated);
    }
    if (data.ghostVector2) {
      this._createGhostLine(data.ghostVector2, animated);
    }
  }

  /**
   * Create a dashed "ghost" line from origin to endpoint of a translated vector.
   */
  _createGhostLine(ghostConfig, animated = true) {
    const origin = ghostConfig.origin || { x: 0, y: 0, z: 0 };
    const endpoint = {
      x: origin.x + ghostConfig.x,
      y: origin.y + ghostConfig.y,
      z: origin.z + ghostConfig.z,
    };

    const line = new DashedLine(origin, endpoint, {
      color: ghostConfig.color || COLORS.constructionLine,
      opacity: animated ? 0.0 : 0.4, 
    });

    line.addTo(this._scene);
    this._constructionLines.push(line);

    // Animate opacity in
    if (animated) {
      const proxy = { opacity: 0 };
      this._animator._tweenGroup.create(proxy, { opacity: 0.4 }, {
        duration: ANIM.constructionLineDuration,
        easing: 'easeOutQuad',
        onUpdate: () => {
          line.setOpacity(proxy.opacity);
        },
      });
    }
  }

  /**
   * Execute a label step (educational text — currently handled via step description).
   */
  _executeLabel(step) {
    // Labels are shown via the onStepChange callback
    // which the UI panel listens to
  }

  /**
   * Stop any running step sequence.
   */
  _stopSequence() {
    if (this._stepTimer) {
      clearTimeout(this._stepTimer);
      this._stepTimer = null;
    }
    this._isPlaying = false;
    this._currentSteps = [];
    this._currentStepIndex = 0;
  }

  // ─── Helpers ─────────────────────────────────────────────

  /**
   * Get a vector's direction from the factory.
   */
  _getVectorDir(name) {
    const vec = this._factory.get(name);
    if (!vec) {
      console.warn(`OperationManager: vector "${name}" not found`);
      return null;
    }
    return vec.getDirection();
  }

  /**
   * Set opacity for all materials in a group.
   */
  _setGroupOpacity(group, opacity) {
    group.traverse((child) => {
      if (child.material) {
        child.material.transparent = true;
        child.material.opacity = opacity;
      }
    });
  }

  /**
   * Notify status change listeners.
   */
  _notifyStatus(status, message) {
    if (this._onStatusChange) {
      this._onStatusChange(status, message);
    }
  }
}
