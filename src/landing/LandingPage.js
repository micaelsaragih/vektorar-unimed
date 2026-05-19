import { Navbar } from './Navbar.js';
import { HeroSection } from './HeroSection.js';
import { FeaturesSection } from './FeaturesSection.js';
import { AboutSection } from './AboutSection.js';
import { Footer } from './Footer.js';

export class LandingPage {
  constructor(engine, vectorScene) {
    this._engine = engine;
    this._vectorScene = vectorScene;
    this._element = null;
    this._isTransitioning = false;
  }

  build() {
    this._element = document.createElement('div');
    this._element.id = 'landing-page';
    
    // Assemble components
    this._element.innerHTML = `
      ${Navbar()}
      ${HeroSection()}
      ${FeaturesSection()}
      ${AboutSection()}
      ${Footer()}
    `;

    document.body.appendChild(this._element);
    this._bindEvents();
    
    // Add landing-active class to body to hide the app UI initially
    document.body.classList.add('landing-active');
  }

  _bindEvents() {
    const startBtn = this._element.querySelector('#btn-start-app');
    const navStartBtn = this._element.querySelector('.btn-mulai-nav');

    const startApp = (e) => {
      if (e) e.preventDefault();
      if (this._isTransitioning) return; // prevent double-tap
      this._isTransitioning = true;
      this._startVisualization();
    };

    startBtn.addEventListener('click', startApp);
    navStartBtn.addEventListener('click', startApp);
  }

  /**
   * Progressive visualization startup — initializes the 3D scene
   * asynchronously with a loading indicator, then reveals the UI.
   * Prevents Android freeze by yielding between subsystem inits.
   */
  async _startVisualization() {
    const btn = this._element.querySelector('#btn-start-app');
    
    // Show inline loading state on the button
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `
        <span class="btn-loading-spinner"></span>
        Memuat Visualisasi...
      `;
    }

    console.log('[Landing] Starting visualization initialization...');

    try {
      // Phase 1: Initialize scene progressively (async with yield points)
      if (!this._vectorScene.isInitialized) {
        await this._vectorScene.initProgressive((progress, message) => {
          if (btn) {
            btn.innerHTML = `
              <span class="btn-loading-spinner"></span>
              ${message} (${progress}%)
            `;
          }
        });
      }

      // Phase 2: Start the render loop if not already running
      if (!this._engine.isRunning) {
        this._engine.start();
      }

      // Phase 3: Enable auto-rotate briefly for smooth reveal
      const cameraCtrl = this._vectorScene.getCameraController();
      if (cameraCtrl) {
        cameraCtrl.setAutoRotate(true);
      }

      console.log('[Landing] ✓ Visualization ready, transitioning...');

      // Phase 4: Smooth transition to reveal the 3D scene
      await this._revealVisualization();

      // Phase 5: Initialize AR in background (non-blocking)
      setTimeout(() => {
        this._vectorScene.initializeARSafe().then(() => {
          console.log('[Landing] ✓ WebXR initialized (background)');
        }).catch(err => {
          console.warn('[Landing] WebXR init failed (non-critical):', err);
        });
      }, 1500);

    } catch (err) {
      console.error('[Landing] Visualization initialization failed:', err);
      // Fallback: force reveal even on error
      this._forceReveal();
    }
  }

  /**
   * Smoothly transition from landing page to visualization.
   * @returns {Promise<void>}
   */
  _revealVisualization() {
    return new Promise(resolve => {
      // Start fade-out of landing page
      this._element.style.opacity = '0';
      this._element.style.transform = 'scale(1.02)';
      
      // Reveal UI elements
      document.body.classList.remove('landing-active');

      setTimeout(() => {
        this._element.style.display = 'none';
        
        // Disable cinematic rotation and restore camera control
        const cameraCtrl = this._vectorScene.getCameraController();
        if (cameraCtrl) {
          cameraCtrl.setAutoRotate(false);
          cameraCtrl.reset();
        }

        this._isTransitioning = false;
        resolve();
      }, 800);
    });
  }

  /**
   * Emergency fallback if initialization fails.
   */
  _forceReveal() {
    console.warn('[Landing] Using force reveal fallback');
    this._element.style.display = 'none';
    document.body.classList.remove('landing-active');
    
    if (!this._engine.isRunning) {
      this._engine.start();
    }
    
    this._isTransitioning = false;
  }
}
