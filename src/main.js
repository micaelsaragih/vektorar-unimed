/**
 * main.js
 * Application entry point.
 * Composes the Engine, VectorScene, and starts the render loop.
 */

import { Engine } from './core/Engine.js';
import { VectorScene } from './scenes/VectorScene.js';
import { LandingPage } from './landing/LandingPage.js';

// ─── Bootstrap ───────────────────────────────────────────

const engine = new Engine(document.body);

// Enable WebXR
engine.enableXR();

// Create and initialize the vector scene
const vectorScene = new VectorScene(engine);
vectorScene.init();

// Build Landing Page
const landing = new LandingPage(engine, vectorScene);
landing.build();

// Loading Sequence
const loadingScreen = document.getElementById('loading-screen');
const loadingBar = document.getElementById('loading-bar');
const loadingText = document.getElementById('loading-text');

let progress = 0;
const interval = setInterval(() => {
  progress += Math.random() * 15;
  if (progress > 90) progress = 90;
  
  loadingBar.style.width = `${progress}%`;
  
  if (progress > 40) loadingText.textContent = 'Memuat model vektor...';
  if (progress > 70) loadingText.textContent = 'Menyiapkan WebXR...';
}, 100);

// Wait for fonts and complete loading
Promise.all([
  document.fonts.ready,
  new Promise(resolve => setTimeout(resolve, 800)) // ensure minimum display time
]).then(() => {
  clearInterval(interval);
  loadingBar.style.width = '100%';
  loadingText.textContent = 'Siap!';
  
  setTimeout(() => {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
      // Start rendering in background with autoRotate
      vectorScene.getCameraController().setAutoRotate(true);
      engine.start();
    }, 800);
  }, 400);
});

// Presentation Mode Logic
const btnPresentation = document.getElementById('btn-presentation');
let isPresentationMode = false;

const togglePresentationMode = () => {
  isPresentationMode = !isPresentationMode;
  document.body.classList.toggle('presentation-mode', isPresentationMode);
  
  const cameraCtrl = vectorScene.getCameraController();
  if (cameraCtrl) {
    cameraCtrl.setAutoRotate(isPresentationMode);
    if (!isPresentationMode) cameraCtrl.reset();
  }
};

if (btnPresentation) {
  btnPresentation.addEventListener('click', togglePresentationMode);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isPresentationMode) {
    togglePresentationMode();
  }
});

// Expose to console for development
if (import.meta.env.DEV) {
  window.__engine = engine;
  window.__vectorScene = vectorScene;
  window.__vectors = vectorScene.getVectorFactory();
  window.__ops = vectorScene.getOperationManager();
  console.log(
    '%c🔢 VektorAR — Platform Edukasi Matematika Vektor 3D Interaktif',
    'color: #00e5ff; font-size: 14px; font-weight: bold;'
  );
  console.log(
    '%cDev: __engine, __vectorScene, __vectors, __ops',
    'color: #7a7a9e; font-size: 11px;'
  );
  console.log(
    '%cKeyboard: 1=add, 2=sub, 3=scalar, 4=combined, R=reset, Spasi=replay',
    'color: #bb86fc; font-size: 11px;'
  );
}
