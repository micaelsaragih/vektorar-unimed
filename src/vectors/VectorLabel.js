/**
 * VectorLabel.js
 * Creates text sprites for labeling vectors, axes, and points.
 * Uses canvas-based texture rendering for crisp text in 3D space.
 */

import * as THREE from 'three';

/**
 * Create a text sprite that always faces the camera.
 *
 * @param {string} text — The label text
 * @param {object} [options]
 * @param {number} [options.fontSize=36] — Font size in pixels
 * @param {string} [options.fontFamily='Inter, system-ui, sans-serif']
 * @param {string} [options.fontWeight='600']
 * @param {string} [options.color='#ffffff']
 * @param {string} [options.backgroundColor='rgba(10, 10, 30, 0.65)']
 * @param {number} [options.padding=8]
 * @param {number} [options.borderRadius=4]
 * @param {string} [options.borderColor] — Optional border color
 * @returns {THREE.Sprite}
 */
export function createTextSprite(text, options = {}) {
  const {
    fontSize = 36,
    fontFamily = 'Inter, system-ui, sans-serif',
    fontWeight = '600',
    color = '#ffffff',
    backgroundColor = 'rgba(10, 10, 30, 0.65)',
    padding = 8,
    borderRadius = 4,
    borderColor = null,
  } = options;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  // Measure text to size the canvas
  context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  const metrics = context.measureText(text);
  const textWidth = metrics.width;
  const textHeight = fontSize;

  // Canvas dimensions with padding
  const canvasWidth = textWidth + padding * 2;
  const canvasHeight = textHeight + padding * 2;

  // Set canvas size (power of 2 not required for sprites, but round up)
  canvas.width = Math.ceil(canvasWidth);
  canvas.height = Math.ceil(canvasHeight);

  // Re-set font after resize (canvas resets context on resize)
  context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  // Draw background with rounded corners
  if (backgroundColor) {
    context.fillStyle = backgroundColor;
    _roundRect(context, 0, 0, canvas.width, canvas.height, borderRadius);
    context.fill();
  }

  // Draw border
  if (borderColor) {
    context.strokeStyle = borderColor;
    context.lineWidth = 2;
    _roundRect(context, 1, 1, canvas.width - 2, canvas.height - 2, borderRadius);
    context.stroke();
  }

  // Draw text
  context.fillStyle = color;
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  // Create sprite material
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const sprite = new THREE.Sprite(material);

  // Scale proportionally based on canvas aspect ratio
  const aspect = canvas.width / canvas.height;
  sprite.scale.set(aspect * 0.5, 0.5, 1);

  sprite.userData.isLabel = true;
  sprite.userData.text = text;

  return sprite;
}

/**
 * Create a vector info label showing name and coordinates.
 * e.g., "p⃗ = (2, 1, 3)"
 *
 * @param {string} name — Vector name (e.g., "p")
 * @param {object} vec — {x, y, z}
 * @param {string} color — CSS color string
 * @returns {THREE.Sprite}
 */
export function createVectorInfoSprite(name, vec, color) {
  const coordText = `${name}\u20D7 (${vec.x}, ${vec.y}, ${vec.z})`;
  return createTextSprite(coordText, {
    fontSize: 30,
    color,
    backgroundColor: 'rgba(10, 10, 30, 0.75)',
    padding: 10,
    borderRadius: 6,
    borderColor: color,
    fontWeight: '600',
  });
}

/**
 * Draw a rounded rectangle path on a canvas context.
 * @private
 */
function _roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
