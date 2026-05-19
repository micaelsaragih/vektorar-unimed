/**
 * VectorMath.js
 * Pure mathematical operations on 3D vectors.
 * No Three.js dependencies — operates on plain {x, y, z} objects.
 * This keeps math logic decoupled from visualization.
 */

/**
 * @typedef {object} Vec3
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */

/**
 * Create a vector object.
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @returns {Vec3}
 */
export function vec3(x = 0, y = 0, z = 0) {
  return { x, y, z };
}

/**
 * Add two vectors: a + b
 * @param {Vec3} a
 * @param {Vec3} b
 * @returns {Vec3}
 */
export function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

/**
 * Subtract two vectors: a - b
 * @param {Vec3} a
 * @param {Vec3} b
 * @returns {Vec3}
 */
export function subtract(a, b) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

/**
 * Scalar multiplication: s * v
 * @param {Vec3} v
 * @param {number} s
 * @returns {Vec3}
 */
export function scale(v, s) {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

/**
 * Dot product: a · b
 * @param {Vec3} a
 * @param {Vec3} b
 * @returns {number}
 */
export function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/**
 * Cross product: a × b
 * @param {Vec3} a
 * @param {Vec3} b
 * @returns {Vec3}
 */
export function cross(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

/**
 * Magnitude (length) of a vector: |v|
 * @param {Vec3} v
 * @returns {number}
 */
export function magnitude(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

/**
 * Normalize a vector to unit length.
 * @param {Vec3} v
 * @returns {Vec3}
 */
export function normalize(v) {
  const mag = magnitude(v);
  if (mag === 0) return { x: 0, y: 0, z: 0 };
  return { x: v.x / mag, y: v.y / mag, z: v.z / mag };
}

/**
 * Angle between two vectors in radians.
 * @param {Vec3} a
 * @param {Vec3} b
 * @returns {number}
 */
export function angleBetween(a, b) {
  const magA = magnitude(a);
  const magB = magnitude(b);
  if (magA === 0 || magB === 0) return 0;
  const cosAngle = Math.max(-1, Math.min(1, dot(a, b) / (magA * magB)));
  return Math.acos(cosAngle);
}

/**
 * Project vector a onto vector b.
 * @param {Vec3} a
 * @param {Vec3} b
 * @returns {Vec3}
 */
export function projectOnto(a, b) {
  const bMagSq = dot(b, b);
  if (bMagSq === 0) return { x: 0, y: 0, z: 0 };
  const scalar = dot(a, b) / bMagSq;
  return scale(b, scalar);
}

/**
 * Negate a vector: -v
 * @param {Vec3} v
 * @returns {Vec3}
 */
export function negate(v) {
  return { x: -v.x, y: -v.y, z: -v.z };
}

/**
 * Check if two vectors are equal (within epsilon).
 * @param {Vec3} a
 * @param {Vec3} b
 * @param {number} [epsilon=1e-6]
 * @returns {boolean}
 */
export function equals(a, b, epsilon = 1e-6) {
  return (
    Math.abs(a.x - b.x) < epsilon &&
    Math.abs(a.y - b.y) < epsilon &&
    Math.abs(a.z - b.z) < epsilon
  );
}

/**
 * Linear interpolation between two vectors.
 * @param {Vec3} a
 * @param {Vec3} b
 * @param {number} t — 0..1
 * @returns {Vec3}
 */
export function lerp(a, b, t) {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  };
}

/**
 * Format a vector as a readable string.
 * @param {Vec3} v
 * @param {number} [decimals=2]
 * @returns {string}
 */
export function toString(v, decimals = 2) {
  return `(${v.x.toFixed(decimals)}, ${v.y.toFixed(decimals)}, ${v.z.toFixed(decimals)})`;
}
