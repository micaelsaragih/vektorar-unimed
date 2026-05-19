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
      if(e) e.preventDefault();
      
      // Fade out landing page
      this._element.style.opacity = '0';
      this._element.style.transform = 'scale(1.02)';
      
      // Reveal UI
      document.body.classList.remove('landing-active');

      setTimeout(() => {
        this._element.style.display = 'none';
        
        // Disable cinematic rotation and restore camera control
        const cameraCtrl = this._vectorScene.getCameraController();
        if (cameraCtrl) {
          cameraCtrl.setAutoRotate(false);
          cameraCtrl.reset();
        }
      }, 800);
    };

    startBtn.addEventListener('click', startApp);
    navStartBtn.addEventListener('click', startApp);
  }
}
