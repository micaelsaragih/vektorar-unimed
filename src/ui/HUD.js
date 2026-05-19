/**
 * HUD.js
 * Heads-Up Display — shows vector information, magnitudes, and
 * current scene state in a minimal overlay at the bottom of the screen.
 */

export class HUD {
  /**
   * @param {import('../vectors/VectorFactory.js').VectorFactory} vectorFactory
   */
  constructor(vectorFactory) {
    this._factory = vectorFactory;
    this._element = null;
    this._build();
  }

  _build() {
    this._element = document.createElement('div');
    this._element.id = 'hud';
    this._element.innerHTML = `
      <div class="hud__vectors" id="hud-vectors"></div>
    `;
    const container = document.getElementById('overlay-content') || document.body;
    container.appendChild(this._element);
    this.refresh();
  }

  /**
   * Refresh the HUD with current vector data.
   */
  refresh() {
    const container = this._element.querySelector('#hud-vectors');
    const vectors = this._factory.getAll();
    const baseVectors = vectors.filter(v => v.name === 'p' || v.name === 'q');

    container.innerHTML = baseVectors.map(v => {
      const d = v.getDirection();
      const mag = v.getMagnitude().toFixed(2);
      const colorHex = '#' + (v.color & 0xFFFFFF).toString(16).padStart(6, '0');
      return `
        <div class="hud__vec">
          <span class="hud__dot" style="background:${colorHex}"></span>
          <span class="hud__name">${v.name}\u20D7</span>
          <span class="hud__coords">= (${d.x}, ${d.y}, ${d.z})</span>
          <span class="hud__mag">|${v.name}| = ${mag}</span>
        </div>
      `;
    }).join('');
  }

  show() { this._element.style.display = 'flex'; }
  hide() { this._element.style.display = 'none'; }
}
