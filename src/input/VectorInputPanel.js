/**
 * VectorInputPanel.js
 * Handles dynamic user input for vectors p and q.
 * Integrates validation, preset loading, and updates the VectorFactory.
 */

export class VectorInputPanel {
  /**
   * @param {import('../vectors/VectorFactory.js').VectorFactory} vectorFactory
   * @param {import('../ui/ControlPanel.js').ControlPanel} controlPanel
   * @param {import('../math/OperationManager.js').OperationManager} opManager
   */
  constructor(vectorFactory, controlPanel, opManager) {
    this._factory = vectorFactory;
    this._controlPanel = controlPanel;
    this._opManager = opManager;
    this._element = null;
    this._build();
  }

  _build() {
    this._element = document.createElement('div');
    this._element.id = 'vector-input-panel';
    this._element.className = 'modal-overlay';
    this._element.style.display = 'none';

    this._element.innerHTML = `
      <div class="input-modal">
        <div class="input-modal__header">
          <h3>Konfigurasi Vektor</h3>
          <button class="input-modal__close" id="btn-close-input">✕</button>
        </div>
        
        <div class="input-modal__body">
          <p class="input-modal__desc">Masukkan nilai koordinat untuk vektor p dan q (-10 hingga 10).</p>
          
          <div class="input-group">
            <label style="color: #00e5ff; font-weight: bold;">Vektor p</label>
            <div class="input-row">
              <input type="number" id="p-x" value="2" step="0.5" min="-10" max="10">
              <input type="number" id="p-y" value="1" step="0.5" min="-10" max="10">
              <input type="number" id="p-z" value="3" step="0.5" min="-10" max="10">
            </div>
          </div>

          <div class="input-group">
            <label style="color: #ff6b35; font-weight: bold;">Vektor q</label>
            <div class="input-row">
              <input type="number" id="q-x" value="-1" step="0.5" min="-10" max="10">
              <input type="number" id="q-y" value="2" step="0.5" min="-10" max="10">
              <input type="number" id="q-z" value="1" step="0.5" min="-10" max="10">
            </div>
          </div>

          <div class="input-error" id="input-error"></div>
        </div>

        <div class="input-modal__footer">
          <button class="input-btn input-btn--secondary" id="btn-preset">Preset Edukasi</button>
          <button class="input-btn input-btn--primary" id="btn-apply">Terapkan Vektor</button>
        </div>
      </div>
    `;

    // Append directly to body — NOT to #overlay-content which is a fullscreen
    // layer that can interfere with touch events on Android.
    document.body.appendChild(this._element);

    this._bindEvents();
  }

  _bindEvents() {
    const closeBtn = this._element.querySelector('#btn-close-input');
    const applyBtn = this._element.querySelector('#btn-apply');
    const presetBtn = this._element.querySelector('#btn-preset');
    const errorEl = this._element.querySelector('#input-error');

    closeBtn.addEventListener('click', () => this.hide());
    
    // Preset: Load a good educational example
    let presetToggle = false;
    presetBtn.addEventListener('click', () => {
      presetToggle = !presetToggle;
      if (presetToggle) {
        this._setInputs('p', 3, 0, 0);
        this._setInputs('q', 0, 3, 0);
      } else {
        this._setInputs('p', 2, 2, 2);
        this._setInputs('q', -2, 2, -2);
      }
      if (errorEl) {
        errorEl.textContent = 'Preset dimuat. Klik Terapkan.';
        errorEl.style.color = '#38a169'; // success green
      }
    });

    applyBtn.addEventListener('click', () => {
      const px = parseFloat(this._element.querySelector('#p-x').value);
      const py = parseFloat(this._element.querySelector('#p-y').value);
      const pz = parseFloat(this._element.querySelector('#p-z').value);
      
      const qx = parseFloat(this._element.querySelector('#q-x').value);
      const qy = parseFloat(this._element.querySelector('#q-y').value);
      const qz = parseFloat(this._element.querySelector('#q-z').value);

      if ([px, py, pz, qx, qy, qz].some(isNaN)) {
        if (errorEl) {
          errorEl.textContent = 'Masukkan angka yang valid untuk koordinat vektor.';
          errorEl.style.color = '#f87171'; // error red
        }
        return;
      }

      // Update VectorFactory
      const vecP = this._factory.get('p');
      const vecQ = this._factory.get('q');
      
      if (vecP) vecP.setDirection(px, py, pz);
      if (vecQ) vecQ.setDirection(qx, qy, qz);

      // Tell ControlPanel & HUD to refresh
      this._opManager.reset();
      this._controlPanel._handleOperation('reset');
      this._controlPanel.refreshVectorLabels(); // We will add this to ControlPanel

      this.hide();
    });
  }

  _setInputs(vec, x, y, z) {
    this._element.querySelector(`#${vec}-x`).value = x;
    this._element.querySelector(`#${vec}-y`).value = y;
    this._element.querySelector(`#${vec}-z`).value = z;
  }

  show() {
    // Populate current values
    const vecP = this._factory.get('p');
    const vecQ = this._factory.get('q');
    
    if (vecP) {
      const dir = vecP.getDirection();
      this._setInputs('p', dir.x, dir.y, dir.z);
    }
    if (vecQ) {
      const dir = vecQ.getDirection();
      this._setInputs('q', dir.x, dir.y, dir.z);
    }

    if (this._element) {
      const errorEl = this._element.querySelector('#input-error');
      if (errorEl) errorEl.textContent = '';
      this._element.style.display = 'flex';
    }
  }

  hide() {
    if (this._element) this._element.style.display = 'none';
  }
}
