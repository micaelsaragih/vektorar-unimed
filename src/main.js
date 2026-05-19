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
console.log('[Startup] renderer initialized');

// Create and initialize the vector scene
const vectorScene = new VectorScene(engine);
vectorScene.init();
console.log('[Startup] scene initialized');
console.log('[Startup] controls initialized'); // Controls are initialized in vectorScene.init()

// Build Landing Page
const landing = new LandingPage(engine, vectorScene);
landing.build();
console.log('[Startup] UI initialized');

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

// Wait for fonts and complete loading with a strict timeout protection
const loadingCompletion = Promise.all([
  document.fonts.ready,
  new Promise(resolve => setTimeout(resolve, 800)) // ensure minimum display time
]);

const timeoutProtection = new Promise(resolve => setTimeout(() => {
  console.warn('[Startup] Loading timeout reached. Forcing startup completion.');
  resolve();
}, 5000)); // 5 second maximum loading time

Promise.race([loadingCompletion, timeoutProtection]).then(() => {
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
      console.log('[Startup] app fully loaded');

      // Initialize AR safely after main startup is complete
      setTimeout(() => {
        vectorScene.initializeARSafe().then(() => {
          console.log('[Startup] WebXR initialized');
        });
      }, 1000);
    }, 800);
  }, 400);
}).catch((err) => {
  console.error('[Startup] Loading error:', err);
  // Fallback to ensure we never freeze
  loadingScreen.style.display = 'none';
  engine.start();
  console.log('[Startup] app fully loaded (fallback)');
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
