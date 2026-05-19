/**
 * ControlPanel.js
 * Main floating control panel — redesigned for Phase 4.
 * Integrates operation buttons, status, step counter,
 * and coordinates with ExplanationPanel and HUD.
 */

import { ExplanationPanel } from './ExplanationPanel.js';
import { HUD } from './HUD.js';
import { VectorInputPanel } from '../input/VectorInputPanel.js';

export class ControlPanel {
  /**
   * @param {import('../math/OperationManager.js').OperationManager} operationManager
   * @param {import('../vectors/VectorFactory.js').VectorFactory} vectorFactory
   * @param {import('../education/TutorialManager.js').TutorialManager} tutorialManager
   */
  constructor(operationManager, vectorFactory, tutorialManager) {
    this._opManager = operationManager;
    this._factory = vectorFactory;
    this._tutorialManager = tutorialManager;
    this._element = null;
    this._explanationPanel = null;
    this._inputPanel = null;
    this._hud = null;
    this._activeOp = null;

    this._build();
    this._buildSubPanels();
    this._bindCallbacks();
    this._bindKeyboard();
  }

  _build() {
    this._element = document.createElement('div');
    this._element.id = 'control-panel';
    this._element.innerHTML = `
      <div class="ctrl__header">
        <div class="ctrl__brand">
          <span class="ctrl__logo">⃗</span>
          <h2 class="ctrl__title">VektorAR</h2>
        </div>
        <button class="ctrl__collapse" id="ctrl-collapse" title="Minimalkan">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 5L7 9L11 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="ctrl__tabs" style="display: flex; border-bottom: 1px solid var(--border); background: rgba(0,0,0,0.2);">
        <button class="ctrl__tab active" data-tab="operasi" style="flex:1; padding: 0.8rem 0.5rem; background: transparent; border: none; color: var(--accent); font-weight: 600; border-bottom: 2px solid var(--accent); cursor: pointer; transition: all 0.3s; font-size: 0.8rem;">Operasi</button>
        <button class="ctrl__tab" data-tab="pembelajaran" style="flex:1; padding: 0.8rem 0.5rem; background: transparent; border: none; color: var(--text-dim); font-weight: 600; border-bottom: 2px solid transparent; cursor: pointer; transition: all 0.3s; font-size: 0.8rem;">Edukasi</button>
        <button class="ctrl__tab" data-tab="vektor" style="flex:1; padding: 0.8rem 0.5rem; background: transparent; border: none; color: var(--text-dim); font-weight: 600; border-bottom: 2px solid transparent; cursor: pointer; transition: all 0.3s; font-size: 0.8rem;">Vektor</button>
      </div>

      <div class="ctrl__body" id="ctrl-body" style="position: relative;">
        
        <!-- Status Bar -->
        <div class="ctrl__status" id="ctrl-status" style="margin-bottom: 1rem;">
          <span class="ctrl__status-dot"></span>
          <span class="ctrl__status-text">Siap</span>
        </div>

        <!-- TAB 1: OPERASI -->
        <div class="ctrl__tab-content active" id="tab-operasi">
          <!-- Vector Selector -->
          <div class="ctrl__vec-row" style="margin-bottom: 1.5rem;">
            <button class="ctrl__vec-btn ctrl__vec-btn--p" data-vec="p" title="Tampilkan vektor p">
              <span class="ctrl__vec-dot" style="background:#00e5ff"></span>
              <span id="label-vec-p">p = (2, 1, 3)</span>
            </button>
            <button class="ctrl__vec-btn ctrl__vec-btn--q" data-vec="q" title="Tampilkan vektor q">
              <span class="ctrl__vec-dot" style="background:#ff6b35"></span>
              <span id="label-vec-q">q = (-1, 2, 1)</span>
            </button>
          </div>

          <div class="ctrl__op-grid">
            <button class="ctrl__op-btn" data-op="add" data-key="1">
              <span class="ctrl__op-badge ctrl__op-badge--add">+</span>
              <span class="ctrl__op-text">p + q</span>
            </button>
            <button class="ctrl__op-btn" data-op="sub" data-key="2">
              <span class="ctrl__op-badge ctrl__op-badge--sub">−</span>
              <span class="ctrl__op-text">p − q</span>
            </button>
            <button class="ctrl__op-btn" data-op="scalar" data-key="3">
              <span class="ctrl__op-badge ctrl__op-badge--scalar">×</span>
              <span class="ctrl__op-text">2p</span>
            </button>
            <button class="ctrl__op-btn" data-op="combined" data-key="4">
              <span class="ctrl__op-badge ctrl__op-badge--combined">⊕</span>
              <span class="ctrl__op-text">2p − q</span>
            </button>
            <button class="ctrl__op-btn" data-op="dot" data-key="5">
              <span class="ctrl__op-badge ctrl__op-badge--dot">·</span>
              <span class="ctrl__op-text">p · q</span>
            </button>
            <button class="ctrl__op-btn" data-op="cross" data-key="6">
              <span class="ctrl__op-badge ctrl__op-badge--cross">×</span>
              <span class="ctrl__op-text">p × q</span>
            </button>
            <button class="ctrl__op-btn" data-op="rotate" data-key="7" style="grid-column: span 2;">
              <span class="ctrl__op-badge" style="background:#2563eb; color:white;">Rz</span>
              <span class="ctrl__op-text">Rotasi Z (90°)</span>
            </button>
          </div>

          <div class="ctrl__actions" style="margin-top: 1.5rem;">
            <button class="ctrl__action-btn ctrl__action-btn--replay" data-op="replay">Ulangi</button>
            <button class="ctrl__action-btn ctrl__action-btn--reset" data-op="reset">Atur ulang (R)</button>
          </div>
        </div>

        <!-- TAB 2: PEMBELAJARAN -->
        <div class="ctrl__tab-content" id="tab-pembelajaran" style="display: none;">
          <div style="margin-bottom: 1rem; color: var(--text-dim); font-size: 0.8rem; line-height: 1.5;">
            Pilih mode interaksi. Mode Pembelajaran akan membimbing Anda langkah-demi-langkah melalui setiap operasi matematika.
          </div>
          <div class="ctrl__vec-row" style="margin-bottom: 1.5rem;">
            <button class="ctrl__vec-btn ctrl__vec-btn--active" id="mode-free" style="justify-content: center; background: var(--surface-active); border-color: var(--border-active);">Visualisasi Bebas</button>
            <button class="ctrl__vec-btn" id="mode-tutorial" style="justify-content: center;">Pembelajaran</button>
          </div>
        </div>

        <!-- TAB 3: INPUT VEKTOR -->
        <div class="ctrl__tab-content" id="tab-vektor" style="display: none;">
          <div style="margin-bottom: 1rem;">
            <label style="color: #00e5ff; font-weight: bold; font-size: 0.9rem; display:block; margin-bottom: 0.5rem;">Vektor p (x, y, z)</label>
            <div style="display: flex; gap: 0.5rem;">
              <input type="number" id="inline-p-x" value="2" step="0.5" class="ctrl__inline-input">
              <input type="number" id="inline-p-y" value="1" step="0.5" class="ctrl__inline-input">
              <input type="number" id="inline-p-z" value="3" step="0.5" class="ctrl__inline-input">
            </div>
          </div>
          <div style="margin-bottom: 1.5rem;">
            <label style="color: #ff6b35; font-weight: bold; font-size: 0.9rem; display:block; margin-bottom: 0.5rem;">Vektor q (x, y, z)</label>
            <div style="display: flex; gap: 0.5rem;">
              <input type="number" id="inline-q-x" value="-1" step="0.5" class="ctrl__inline-input">
              <input type="number" id="inline-q-y" value="2" step="0.5" class="ctrl__inline-input">
              <input type="number" id="inline-q-z" value="1" step="0.5" class="ctrl__inline-input">
            </div>
          </div>
          <button id="btn-inline-apply" style="width: 100%; padding: 0.8rem; background: var(--accent); color: #000; font-weight: bold; border-radius: 8px; border: none; cursor: pointer;">Terapkan Koordinat</button>
        </div>
      </div>
    `;

    // Append directly to body — NOT to #overlay-content which is a fullscreen
    // layer that can interfere with touch events on Android.
    document.body.appendChild(this._element);

    // Tabs logic
    const tabs = this._element.querySelectorAll('.ctrl__tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('active');
          t.style.color = 'var(--text-dim)';
          t.style.borderBottomColor = 'transparent';
        });
        tab.classList.add('active');
        tab.style.color = 'var(--accent)';
        tab.style.borderBottomColor = 'var(--accent)';
        
        const target = tab.dataset.tab;
        this._element.querySelectorAll('.ctrl__tab-content').forEach(c => {
          if (c) c.style.display = 'none';
        });
        const targetEl = this._element.querySelector(`#tab-${target}`);
        if (targetEl) targetEl.style.display = 'block';
      });
    });

    // Mode events
    const btnFree = this._element.querySelector('#mode-free');
    const btnTutorial = this._element.querySelector('#mode-tutorial');
    
    btnFree.addEventListener('click', () => {
      if (btnFree) {
        btnFree.style.background = 'var(--surface-active)';
        btnFree.style.borderColor = 'var(--border-active)';
      }
      if (btnTutorial) {
        btnTutorial.style.background = 'rgba(255,255,255,0.05)';
        btnTutorial.style.borderColor = 'var(--border)';
      }
      this._tutorialManager.setMode(false);
      this._handleOperation('reset');
    });

    btnTutorial.addEventListener('click', () => {
      if (btnTutorial) {
        btnTutorial.style.background = 'var(--surface-active)';
        btnTutorial.style.borderColor = 'var(--border-active)';
      }
      if (btnFree) {
        btnFree.style.background = 'rgba(255,255,255,0.05)';
        btnFree.style.borderColor = 'var(--border)';
      }
      this._tutorialManager.setMode(true);
      this._handleOperation('reset');
    });

    // Button events — operations
    this._element.querySelectorAll('[data-op]').forEach(btn => {
      btn.addEventListener('click', e => {
        const op = e.currentTarget.dataset.op;
        this._handleOperation(op);
      });
    });

    // Vector toggle buttons
    this._element.querySelectorAll('[data-vec]').forEach(btn => {
      btn.addEventListener('click', e => {
        const name = e.currentTarget.dataset.vec;
        this._toggleVector(name, e.currentTarget);
      });
    });

    // Edit Vectors Inline Apply
    const btnInlineApply = this._element.querySelector('#btn-inline-apply');
    if (btnInlineApply) {
      btnInlineApply.addEventListener('click', () => {
        const px = parseFloat(this._element.querySelector('#inline-p-x').value);
        const py = parseFloat(this._element.querySelector('#inline-p-y').value);
        const pz = parseFloat(this._element.querySelector('#inline-p-z').value);
        
        const qx = parseFloat(this._element.querySelector('#inline-q-x').value);
        const qy = parseFloat(this._element.querySelector('#inline-q-y').value);
        const qz = parseFloat(this._element.querySelector('#inline-q-z').value);

        if ([px, py, pz, qx, qy, qz].some(isNaN)) return;

        const vecP = this._factory.get('p');
        const vecQ = this._factory.get('q');
        
        if (vecP) vecP.setDirection(px, py, pz);
        if (vecQ) vecQ.setDirection(qx, qy, qz);

        this._opManager.reset();
        this._handleOperation('reset');
        this.refreshVectorLabels();
        
        // Switch back to operasi tab
        tabs[0].click();
      });
    }

    // Collapse
    const collapseBtn = this._element.querySelector('#ctrl-collapse');
    const body = this._element.querySelector('#ctrl-body');
    
    const toggleCollapse = (forceCollapse) => {
      const isCurrentlyCollapsed = body.classList.contains('ctrl__body--collapsed');
      const shouldCollapse = forceCollapse !== undefined ? forceCollapse : !isCurrentlyCollapsed;
      body.classList.toggle('ctrl__body--collapsed', shouldCollapse);
      collapseBtn.classList.toggle('ctrl__collapse--rotated', !shouldCollapse);
    };

    collapseBtn.addEventListener('click', () => toggleCollapse());

    // Auto-collapse on mobile initially
    if (window.innerWidth <= 480) {
      toggleCollapse(true);
    }
  }

  _buildSubPanels() {
    this._explanationPanel = new ExplanationPanel(this._tutorialManager, this._factory);
    // Removed external VectorInputPanel & HUD references to clean up overlay.
  }

  refreshVectorLabels() {
    const vecP = this._factory.get('p');
    const vecQ = this._factory.get('q');
    
    if (vecP) {
      const dp = vecP.getDirection();
      this._element.querySelector('#label-vec-p').textContent = `p = (${dp.x}, ${dp.y}, ${dp.z})`;
    }
    if (vecQ) {
      const dq = vecQ.getDirection();
      this._element.querySelector('#label-vec-q').textContent = `q = (${dq.x}, ${dq.y}, ${dq.z})`;
    }
  }

  _handleOperation(op) {
    if (this._opManager.isPlaying && op !== 'reset') return;

    // Update active button state
    this._setActiveOp(op);

    const executeOp = (opName, defaultAction) => {
      this._explanationPanel.showExplanation(opName);
      if (this._tutorialManager.isTutorialMode) {
        // Pre-run to get steps, but don't play
        defaultAction();
        this._tutorialManager.startTutorial(opName);
      } else {
        defaultAction();
      }
    };

    switch (op) {
      case 'add':
        executeOp('add', () => this._opManager.runAddition('p', 'q'));
        break;
      case 'sub':
        executeOp('sub', () => this._opManager.runSubtraction('p', 'q'));
        break;
      case 'scalar':
        executeOp('scalar', () => this._opManager.runScalarMultiply(2, 'p'));
        break;
      case 'combined':
        executeOp('combined', () => this._opManager.runScalarThenSubtract(2, 'p', 'q'));
        break;
      case 'dot':
        executeOp('dot', () => this._opManager.runDotProduct('p', 'q'));
        break;
      case 'cross':
        executeOp('cross', () => this._opManager.runCrossProduct('p', 'q'));
        break;
      case 'rotate':
        executeOp('rotate', () => this._opManager.runRotateZ('p', 90));
        break;
      case 'replay':
        if (this._activeOp && this._activeOp !== 'replay' && this._activeOp !== 'reset') {
          this._handleOperation(this._activeOp);
        }
        return;
      case 'reset':
        this._opManager.reset();
        this._explanationPanel.showExplanation('default');
        this._clearActiveOp();
        this._clearProgress();
        if (this._tutorialManager.isTutorialMode) {
          this._tutorialManager.currentOperation = null;
        }
        return;
    }
  }

  _toggleVector(name, btn) {
    const vec = this._factory.get(name);
    if (!vec) return;
    const visible = !vec.group.visible;
    vec.setVisible(visible);
    btn.classList.toggle('ctrl__vec-btn--hidden', !visible);
  }

  _setActiveOp(op) {
    if (op === 'replay' || op === 'reset') return;
    this._activeOp = op;
    this._element.querySelectorAll('[data-op]').forEach(btn => {
      btn.classList.toggle('ctrl__op-btn--active', btn.dataset.op === op);
    });
  }

  _clearActiveOp() {
    this._activeOp = null;
    this._element.querySelectorAll('.ctrl__op-btn--active').forEach(btn => {
      btn.classList.remove('ctrl__op-btn--active');
    });
  }

  _clearProgress() {
    // Moved progress bar to ExplanationPanel/TutorialManager
  }

  _bindCallbacks() {
    this._opManager.onStepChange((stepIndex, totalSteps, description) => {
      const bar = this._element.querySelector('#ctrl-progress-bar');
      const info = this._element.querySelector('#ctrl-step-info');
      
      if (bar) {
        const pct = (stepIndex / totalSteps) * 100;
        bar.style.width = `${pct}%`;
      }
      
      if (info) {
        info.textContent = `Langkah ${stepIndex}/${totalSteps} — ${description}`;
      }

      // Update explanation panel with live step
      if (this._explanationPanel) {
        this._explanationPanel.updateStep(description);
      }
    });

    this._opManager.onStatusChange((status, message) => {
      const statusEl = this._element.querySelector('#ctrl-status');
      if (statusEl) {
        const textEl = statusEl.querySelector('.ctrl__status-text');
        if (textEl) {
          textEl.textContent = message;
        }
        statusEl.className = `ctrl__status ctrl__status--${status}`;
      }
    });

    this._opManager.onComplete(() => {
      // Nothing needed now that HUD is removed
    });
  }

  _bindKeyboard() {
    document.addEventListener('keydown', e => {
      // Don't trigger if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case '1': this._handleOperation('add'); break;
        case '2': this._handleOperation('sub'); break;
        case '3': this._handleOperation('scalar'); break;
        case '4': this._handleOperation('combined'); break;
        case '5': this._handleOperation('dot'); break;
        case '6': this._handleOperation('cross'); break;
        case '7': this._handleOperation('rotate'); break;
        case 'r': case 'R': this._handleOperation('reset'); break;
        case ' ': e.preventDefault(); this._handleOperation('replay'); break;
      }
    });
  }

  show() { if (this._element) this._element.style.display = 'flex'; }
  hide() { if (this._element) this._element.style.display = 'none'; }
}
