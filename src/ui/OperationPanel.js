/**
 * OperationPanel.js
 * Floating glassmorphic UI panel with operation buttons and status display.
 * Plugs into the OperationManager for callbacks.
 */

export class OperationPanel {
  /**
   * @param {import('../math/OperationManager.js').OperationManager} operationManager
   */
  constructor(operationManager) {
    this._opManager = operationManager;
    this._element = null;
    this._statusEl = null;
    this._stepEl = null;
    this._descEl = null;
    this._buttonsEl = null;

    this._build();
    this._bindCallbacks();
  }

  /**
   * Build the DOM structure and insert into the page.
   */
  _build() {
    this._element = document.createElement('div');
    this._element.id = 'operation-panel';
    this._element.innerHTML = `
      <div class="op-panel__header">
        <h2 class="op-panel__title">⃗ Operasi Vektor</h2>
        <button class="op-panel__toggle" id="op-panel-toggle" title="Alihkan panel">▼</button>
      </div>
      <div class="op-panel__body" id="op-panel-body">
        <div class="op-panel__status" id="op-status">Siap</div>
        <div class="op-panel__step" id="op-step"></div>
        <div class="op-panel__desc" id="op-desc"></div>
        <div class="op-panel__buttons" id="op-buttons">
          <button class="op-btn op-btn--add" data-op="add" title="Penjumlahan Vektor">
            <span class="op-btn__icon">＋</span>
            <span class="op-btn__label">p + q</span>
          </button>
          <button class="op-btn op-btn--sub" data-op="sub" title="Pengurangan Vektor">
            <span class="op-btn__icon">−</span>
            <span class="op-btn__label">p − q</span>
          </button>
          <button class="op-btn op-btn--scalar" data-op="scalar" title="Perkalian Skalar">
            <span class="op-btn__icon">×</span>
            <span class="op-btn__label">2p</span>
          </button>
          <button class="op-btn op-btn--combined" data-op="combined" title="Operasi Gabungan">
            <span class="op-btn__icon">⊕</span>
            <span class="op-btn__label">2p − q</span>
          </button>
        </div>
        <div class="op-panel__actions">
          <button class="op-btn op-btn--reset" data-op="reset" title="Atur ulang visualisasi">
            <span class="op-btn__icon">↺</span>
            <span class="op-btn__label">Atur Ulang</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this._element);

    // Cache references
    this._statusEl = this._element.querySelector('#op-status');
    this._stepEl = this._element.querySelector('#op-step');
    this._descEl = this._element.querySelector('#op-desc');
    this._buttonsEl = this._element.querySelector('#op-buttons');

    // Button events
    this._element.querySelectorAll('[data-op]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const op = e.currentTarget.dataset.op;
        this._handleOperation(op);
      });
    });

    // Toggle panel collapse
    const toggleBtn = this._element.querySelector('#op-panel-toggle');
    const body = this._element.querySelector('#op-panel-body');
    toggleBtn.addEventListener('click', () => {
      const collapsed = body.classList.toggle('op-panel__body--collapsed');
      toggleBtn.textContent = collapsed ? '▲' : '▼';
    });
  }

  /**
   * Handle operation button clicks.
   */
  _handleOperation(op) {
    if (this._opManager.isPlaying && op !== 'reset') return;

    switch (op) {
      case 'add':
        this._opManager.runAddition('p', 'q');
        break;
      case 'sub':
        this._opManager.runSubtraction('p', 'q');
        break;
      case 'scalar':
        this._opManager.runScalarMultiply(2, 'p');
        break;
      case 'combined':
        this._opManager.runScalarThenSubtract(2, 'p', 'q');
        break;
      case 'reset':
        this._opManager.reset();
        this._stepEl.textContent = '';
        this._descEl.textContent = '';
        break;
    }
  }

  /**
   * Bind OperationManager callbacks to update the UI.
   */
  _bindCallbacks() {
    this._opManager.onStepChange((stepIndex, totalSteps, description) => {
      this._stepEl.textContent = `Langkah ${stepIndex} / ${totalSteps}`;
      this._descEl.textContent = description;
      this._descEl.classList.add('op-panel__desc--flash');
      setTimeout(() => {
        this._descEl.classList.remove('op-panel__desc--flash');
      }, 400);
    });

    this._opManager.onStatusChange((status, message) => {
      this._statusEl.textContent = message;
      this._statusEl.className = `op-panel__status op-panel__status--${status}`;
    });

    this._opManager.onComplete(() => {
      // Could add a completion effect
    });
  }

  /**
   * Show the panel.
   */
  show() {
    if (this._element) this._element.style.display = 'flex';
  }

  /**
   * Hide the panel.
   */
  hide() {
    if (this._element) this._element.style.display = 'none';
  }
}
