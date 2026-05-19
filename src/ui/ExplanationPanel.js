/**
 * ExplanationPanel.js
 * Educational explanation system — displays contextual mathematical
 * explanations for each vector operation with formulas and tips.
 */

/** @type {Record<string, {title: string, formula: string, explanation: string, tip: string}>} */
const EXPLANATIONS = {
  add: {
    title: 'Penjumlahan Vektor',
    formula: 'p + q = (p₁+q₁, p₂+q₂, p₃+q₃)',
    explanation:
      'Saat menjumlahkan vektor, tempatkan ekor vektor kedua di ujung vektor pertama. Hasilnya ditarik dari titik asal ke ujung yang baru. Ini disebut Aturan Jajar Genjang.',
    tip: '💡 Penjumlahan vektor bersifat komutatif: p + q = q + p',
  },
  sub: {
    title: 'Pengurangan Vektor',
    formula: 'p − q = (p₁−q₁, p₂−q₂, p₃−q₃)',
    explanation:
      'Mengurangi q dari p sama dengan menambahkan negasi dari q. Pertama balikkan arah q, lalu tambahkan ke p menggunakan aturan jajar genjang.',
    tip: '💡 p − q menunjuk dari ujung q ke ujung p',
  },
  scalar: {
    title: 'Perkalian Skalar',
    formula: 'kp = (k·p₁, k·p₂, k·p₃)',
    explanation:
      'Mengalikan vektor dengan skalar mengubah magnitudonya tanpa mengubah arahnya (jika positif) atau membalikkannya (jika negatif). Skalar 2 menggandakan panjangnya.',
    tip: '💡 |kp| = |k| · |p| — besaran diskalakan oleh nilai absolut k',
  },
  combined: {
    title: 'Operasi Gabungan',
    formula: '2p − q = 2(p₁,p₂,p₃) − (q₁,q₂,q₃)',
    explanation:
      'Pertama skalakan vektor p sebesar 2, lalu kurangi vektor q dari hasilnya. Ini menggabungkan perkalian skalar dan pengurangan vektor menjadi satu operasi tunggal.',
    tip: '💡 Operasi gabungan mengikuti aturan yang sama yang diterapkan secara berurutan',
  },
  dot: {
    title: 'Perkalian Titik (Dot Product)',
    formula: 'p · q = p₁q₁ + p₂q₂ + p₃q₃',
    explanation:
      'Perkalian titik mengukur seberapa banyak dua vektor menunjuk ke arah yang sama. Hasilnya adalah skalar (sebuah angka tunggal), bukan vektor. Ini sama dengan |p||q|cosθ, di mana θ adalah sudut di antara keduanya.',
    tip: '💡 Jika p · q = 0, kedua vektor tegak lurus (terpisah 90°)',
  },
  cross: {
    title: 'Perkalian Silang (Cross Product)',
    formula: 'p × q = (p₂q₃−p₃q₂, p₃q₁−p₁q₃, p₁q₂−p₂q₁)',
    explanation:
      'Perkalian silang menghasilkan vektor baru yang tegak lurus terhadap kedua vektor input. Besarnya sama dengan luas jajar genjang yang dibentuk oleh p dan q.',
    tip: '💡 Perkalian silang bersifat antikomutatif: p × q = -(q × p)',
  },
  rotate: {
    title: 'Transformasi Matriks (Rotasi)',
    formula: "Rz(θ) · p = (x·cosθ - y·sinθ, x·sinθ + y·cosθ, z)",
    explanation:
      'Transformasi matriks mengubah ruang vektor dengan mengalikannya terhadap sebuah matriks. Di sini, kita memutar vektor p sebesar 90° berlawanan arah jarum jam di sekitar sumbu Z.',
    tip: '💡 Operasi linier seperti ini mendasari semua grafik komputer 3D',
  },
  default: {
    title: 'Laboratorium Operasi Vektor',
    formula: '',
    explanation:
      'Pilih operasi untuk memvisualisasikan bagaimana vektor digabungkan dalam ruang 3D. Setiap operasi dianimasikan selangkah demi selangkah dengan panduan konstruksi.',
    tip: '💡 Vektor p dan q ditampilkan dari titik asal. Klik operasi mana saja untuk memulai.',
  },
};

export class ExplanationPanel {
  /**
   * @param {import('../education/TutorialManager.js').TutorialManager} tutorialManager
   * @param {import('../vectors/VectorFactory.js').VectorFactory} vectorFactory
   */
  constructor(tutorialManager, vectorFactory) {
    this._tutorialManager = tutorialManager;
    this._factory = vectorFactory;
    this._element = null;
    this._currentOp = 'default';
    this._build();
    this._bindTutorialEvents();
  }

  _build() {
    this._element = document.createElement('div');
    this._element.id = 'explanation-panel';
    this._element.innerHTML = `
      <div class="explain__header">
        <div class="explain__icon">📐</div>
        <h3 class="explain__title" id="explain-title"></h3>
      </div>
      <div class="explain__formula" id="explain-formula"></div>
      <p class="explain__text" id="explain-text"></p>
      <div class="explain__tip" id="explain-tip"></div>
      
      <!-- Tutorial Controls -->
      <div class="explain__controls" id="explain-controls" style="display: none; margin-top: 0.8rem; gap: 0.5rem;">
        <button class="ctrl__action-btn" id="btn-prev" disabled>⬅️ Sebelumnya</button>
        <button class="ctrl__action-btn" id="btn-next">Berikutnya ➡️</button>
      </div>
    `;
    const container = document.getElementById('overlay-content') || document.body;
    container.appendChild(this._element);
    this.showExplanation('default');
  }

  _bindTutorialEvents() {
    if (!this._tutorialManager) return;
    
    const btnPrev = this._element.querySelector('#btn-prev');
    const btnNext = this._element.querySelector('#btn-next');
    const controlsContainer = this._element.querySelector('#explain-controls');

    btnPrev.addEventListener('click', () => {
      this._tutorialManager.prevStep();
    });

    btnNext.addEventListener('click', () => {
      if (btnNext.textContent.includes('Ulangi')) {
        this._tutorialManager.replay();
      } else {
        this._tutorialManager.nextStep();
      }
    });

    this._tutorialManager.onModeChange = (isTutorial) => {
      if (!isTutorial) {
        controlsContainer.style.display = 'none';
        this.showExplanation('default');
      }
    };

    this._tutorialManager.onTutorialStep = (stepIndex, totalSteps, stepData) => {
      controlsContainer.style.display = 'flex';
      btnPrev.disabled = stepIndex === 0;
      
      if (stepIndex === totalSteps - 1) {
        btnNext.innerHTML = '🔄 Ulangi Tutorial';
      } else {
        btnNext.innerHTML = 'Berikutnya ➡️';
      }
      
      this.updateStep(stepData.description || 'Proses visualisasi...');
    };
  }

  /**
   * Show explanation for an operation key.
   * @param {'add'|'sub'|'scalar'|'combined'|'default'} opKey
   */
  showExplanation(opKey) {
    const data = EXPLANATIONS[opKey] || EXPLANATIONS.default;
    this._currentOp = opKey;

    const titleEl = this._element.querySelector('#explain-title');
    const formulaEl = this._element.querySelector('#explain-formula');
    const textEl = this._element.querySelector('#explain-text');
    const tipEl = this._element.querySelector('#explain-tip');

    let dynamicFormula = data.formula;
    if (this._factory && opKey !== 'default') {
      const vecP = this._factory.get('p');
      const vecQ = this._factory.get('q');
      if (vecP && vecQ) {
        const p = vecP.getDirection();
        const q = vecQ.getDirection();
        
        switch (opKey) {
          case 'add':
            dynamicFormula = `(${p.x}, ${p.y}, ${p.z}) + (${q.x}, ${q.y}, ${q.z}) = (${p.x + q.x}, ${p.y + q.y}, ${p.z + q.z})`;
            break;
          case 'sub':
            dynamicFormula = `(${p.x}, ${p.y}, ${p.z}) − (${q.x}, ${q.y}, ${q.z}) = (${p.x - q.x}, ${p.y - q.y}, ${p.z - q.z})`;
            break;
          case 'scalar':
            dynamicFormula = `2(${p.x}, ${p.y}, ${p.z}) = (${p.x*2}, ${p.y*2}, ${p.z*2})`;
            break;
          case 'combined':
            dynamicFormula = `2(${p.x}, ${p.y}, ${p.z}) − (${q.x}, ${q.y}, ${q.z}) = (${p.x*2 - q.x}, ${p.y*2 - q.y}, ${p.z*2 - q.z})`;
            break;
          case 'dot':
            const dot = (p.x*q.x + p.y*q.y + p.z*q.z).toFixed(2);
            dynamicFormula = `(${p.x})(${q.x}) + (${p.y})(${q.y}) + (${p.z})(${q.z}) = ${dot}`;
            break;
          case 'cross':
            const crossX = p.y*q.z - p.z*q.y;
            const crossY = p.z*q.x - p.x*q.z;
            const crossZ = p.x*q.y - p.y*q.x;
            dynamicFormula = `(${crossX}, ${crossY}, ${crossZ})`;
            break;
          case 'rotate':
            const cosT = 0; // cos(90)
            const sinT = 1; // sin(90)
            const rx = p.x * cosT - p.y * sinT;
            const ry = p.x * sinT + p.y * cosT;
            dynamicFormula = `Rz(90°) · (${p.x}, ${p.y}, ${p.z}) = (${rx}, ${ry}, ${p.z})`;
            break;
        }
      }
    }

    titleEl.textContent = data.title;
    formulaEl.innerHTML = `<span style="font-size: 0.8em; color: var(--text-dim);">${data.formula}</span><br/><span style="color: var(--accent); font-weight: 700;">${dynamicFormula}</span>`;
    textEl.textContent = data.explanation;
    tipEl.textContent = data.tip;

    // Trigger animation
    this._element.classList.remove('explain--animate');
    void this._element.offsetWidth; // reflow
    this._element.classList.add('explain--animate');

    const controlsContainer = this._element.querySelector('#explain-controls');
    if (opKey === 'default' || !this._tutorialManager || !this._tutorialManager.isTutorialMode) {
      controlsContainer.style.display = 'none';
    }
  }

  /**
   * Update step-specific text.
   * @param {string} description
   */
  updateStep(description) {
    const textEl = this._element.querySelector('#explain-text');
    textEl.textContent = description;
    textEl.classList.add('explain__text--highlight');
    setTimeout(() => textEl.classList.remove('explain__text--highlight'), 500);
  }

  show() { this._element.style.display = 'flex'; }
  hide() { this._element.style.display = 'none'; }
}
