/**
 * main.js
 * Application entry point.
 *
 * Architecture (Phase 5 — Mobile-optimized):
 * 1. Create Engine immediately (lightweight — just renderer + camera + base lighting)
 * 2. Build Landing Page overlay (no 3D scene yet)
 * 3. Show loading screen briefly
 * 4. When user clicks "Mulai Visualisasi", LandingPage triggers
 *    progressive async scene initialization via VectorScene.initProgressive()
 *
 * This prevents Android freeze by deferring heavy 3D initialization
 * until the user explicitly requests it.
 */

import { Engine } from './core/Engine.js';
import { VectorScene } from './scenes/VectorScene.js';
import { LandingPage } from './landing/LandingPage.js';
import { isMobile } from './core/MobileDetect.js';

// ─── Bootstrap ───────────────────────────────────────────

console.log('[Startup] Initializing engine...');
const engine = new Engine(document.body);

// Create VectorScene instance (but do NOT initialize subsystems yet)
const vectorScene = new VectorScene(engine);
console.log('[Startup] VectorScene created (deferred init)');

// Build Landing Page — will trigger scene init on button press
const landing = new LandingPage(engine, vectorScene);
landing.build();
console.log('[Startup] Landing page built');

// ─── Loading Screen ──────────────────────────────────────

const loadingScreen = document.getElementById('loading-screen');
const loadingBar = document.getElementById('loading-bar');
const loadingText = document.getElementById('loading-text');

let progress = 0;
const interval = setInterval(() => {
  progress += Math.random() * 20;
  if (progress > 90) progress = 90;
  
  if (loadingBar) loadingBar.style.width = `${progress}%`;
  
  if (progress > 40 && loadingText) loadingText.textContent = 'Menyiapkan antarmuka...';
  if (progress > 70 && loadingText) loadingText.textContent = 'Hampir siap...';
}, 100);

// Wait for fonts and complete loading with strict timeout protection
const loadingCompletion = Promise.all([
  document.fonts.ready.catch(() => {}), // Don't block on font failures
  new Promise(resolve => setTimeout(resolve, isMobile() ? 500 : 800))
]);

const timeoutProtection = new Promise(resolve => setTimeout(() => {
  console.warn('[Startup] Loading timeout reached. Forcing startup completion.');
  resolve();
}, 3000)); // 3 second maximum (reduced from 5s for faster mobile startup)

Promise.race([loadingCompletion, timeoutProtection]).then(() => {
  clearInterval(interval);
  if (loadingBar) loadingBar.style.width = '100%';
  if (loadingText) loadingText.textContent = 'Siap!';
  
  setTimeout(() => {
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
        console.log('[Startup] ✓ Loading screen dismissed, landing page visible');
        
        // On desktop: optionally start a lightweight preview render
        // On mobile: keep the renderer idle until user clicks "Mulai Visualisasi"
        if (!isMobile()) {
          // Desktop: start renderer for subtle background animation behind landing
          engine.start();
        }
      }, 600);
    }
  }, 300);
}).catch((err) => {
  console.error('[Startup] Loading error:', err);
  // Fallback to ensure we never freeze
  if (loadingScreen) loadingScreen.style.display = 'none';
  console.log('[Startup] ✓ app loaded (fallback)');
});

// ─── Presentation Mode ──────────────────────────────────

const btnPresentation = document.getElementById('btn-presentation');
let isPresentationMode = false;

const togglePresentationMode = () => {
  if (!vectorScene.isInitialized) return; // Don't toggle before init
  
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

// ─── Dev Tools ──────────────────────────────────────────

if (import.meta.env.DEV) {
  window.__engine = engine;
  window.__vectorScene = vectorScene;
  // These will be null until initProgressive completes
  Object.defineProperty(window, '__vectors', { get: () => vectorScene.getVectorFactory() });
  Object.defineProperty(window, '__ops', { get: () => vectorScene.getOperationManager() });
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

// ─── Mobile Touch Debugging ─────────────────────────────

if (import.meta.env.DEV && isMobile()) {
  console.log('[TouchDebug] Mobile device detected — enabling touch interaction logging');

  const canvas = engine.getRenderer().domElement;

  // Log touch events on canvas
  canvas.addEventListener('touchstart', (e) => {
    console.log(`[TouchDebug] canvas touchstart — touches: ${e.touches.length}, target: ${e.target.tagName}`);
  }, { passive: true });

  canvas.addEventListener('pointerdown', (e) => {
    console.log(`[TouchDebug] canvas pointerdown — type: ${e.pointerType}, target: ${e.target.tagName}`);
  }, { passive: true });

  // Log touch events on document to detect if something is intercepting
  document.addEventListener('touchstart', (e) => {
    const tag = e.target.tagName;
    const id = e.target.id || 'no-id';
    const cls = e.target.className?.toString().substring(0, 30) || '';
    console.log(`[TouchDebug] document touchstart — target: ${tag}#${id}.${cls}`);
  }, { passive: true, capture: true });

  // Log blocked interactions (elements with pointer-events: none being touched)
  document.addEventListener('pointerdown', (e) => {
    const computed = window.getComputedStyle(e.target);
    if (computed.pointerEvents === 'none') {
      console.warn(`[TouchDebug] ⚠ pointerdown on pointer-events:none element — ${e.target.tagName}#${e.target.id}`);
    }
  }, { passive: true, capture: true });

  console.log('[TouchDebug] ✓ Touch interaction logging enabled');
}
