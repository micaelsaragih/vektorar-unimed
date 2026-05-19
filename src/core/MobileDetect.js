/**
 * MobileDetect.js
 * Lightweight mobile/Android detection utility for performance-adaptive rendering.
 * Used across the app to select mobile-safe configurations.
 */

/** Cache detection results once */
let _isMobile = null;
let _isAndroid = null;
let _isLowEnd = null;

/**
 * Detect if the current device is a mobile/tablet.
 * @returns {boolean}
 */
export function isMobile() {
  if (_isMobile !== null) return _isMobile;
  _isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || ('ontouchstart' in window && window.innerWidth < 1024);
  return _isMobile;
}

/**
 * Detect if the current device is Android.
 * @returns {boolean}
 */
export function isAndroid() {
  if (_isAndroid !== null) return _isAndroid;
  _isAndroid = /Android/i.test(navigator.userAgent);
  return _isAndroid;
}

/**
 * Detect if this is likely a low-end mobile GPU.
 * Uses heuristics: small screen + Android + low devicePixelRatio.
 * @returns {boolean}
 */
export function isLowEndDevice() {
  if (_isLowEnd !== null) return _isLowEnd;
  _isLowEnd = isMobile() && (
    window.innerWidth * window.innerHeight < 400000 || // < ~630x630
    (isAndroid() && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
    navigator.deviceMemory && navigator.deviceMemory <= 4
  );
  return _isLowEnd;
}

/**
 * Get the optimal pixel ratio for this device.
 * Mobile: cap at 1.5 (Android) or 2 (iOS).
 * Desktop: cap at 2.
 * @returns {number}
 */
export function getOptimalPixelRatio() {
  const dpr = window.devicePixelRatio || 1;
  if (isAndroid()) return Math.min(dpr, 1.5);
  if (isMobile()) return Math.min(dpr, 2);
  return Math.min(dpr, 2);
}

/**
 * Yield control back to the browser to prevent UI freeze.
 * @param {number} [ms=0] Minimum delay in milliseconds
 * @returns {Promise<void>}
 */
export function yieldToMain(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
