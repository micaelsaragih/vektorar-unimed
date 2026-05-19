/**
 * TutorialManager.js
 * Manages the educational flow of vector operations.
 * Handles stepping through operations, mode switching (Free vs Tutorial),
 * and synchronizing UI with the OperationManager.
 */

export class TutorialManager {
  /**
   * @param {import('../math/OperationManager.js').OperationManager} operationManager
   */
  constructor(operationManager) {
    this.opManager = operationManager;
    this.isTutorialMode = false;
    this.currentOperation = null;
    this.currentStep = 0;
    this.totalSteps = 0;
    
    // Callbacks
    this.onModeChange = null;
    this.onTutorialStep = null;
    this.onTutorialEnd = null;
  }

  setMode(isTutorial) {
    this.isTutorialMode = isTutorial;
    this.opManager.setTutorialMode(isTutorial);
    if (this.onModeChange) this.onModeChange(isTutorial);
    
    if (!isTutorial) {
      this.currentOperation = null;
      this.opManager.reset();
    }
  }

  startTutorial(opName) {
    if (!this.isTutorialMode) return;
    this.currentOperation = opName;
    this.currentStep = 0;
    
    this.totalSteps = this.opManager.getTotalSteps();
    this.goToStep(0);
  }

  nextStep() {
    if (this.currentStep < this.totalSteps - 1) {
      this.goToStep(this.currentStep + 1);
    } else {
      if (this.onTutorialEnd) this.onTutorialEnd();
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.goToStep(this.currentStep - 1);
    }
  }

  goToStep(stepIndex) {
    this.currentStep = stepIndex;
    this.opManager.executeToStep(stepIndex);
    
    const stepData = this.opManager.getStepData(stepIndex);
    if (this.onTutorialStep) {
      this.onTutorialStep(this.currentStep, this.totalSteps, stepData);
    }
  }

  replay() {
    if (this.currentOperation) {
      this.goToStep(0);
    }
  }
}
