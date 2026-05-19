/**
 * VectorOperations.js
 * Defines visual vector operations as reusable operation descriptors.
 * Each operation produces a "recipe" of steps that the OperationManager
 * can execute as an animated sequence.
 *
 * Pure data layer — does NOT directly create 3D objects.
 */

import * as VMath from './VectorMath.js';

/**
 * @typedef {object} OperationStep
 * @property {'show'|'create'|'move'|'construction'|'highlight'|'pause'|'label'} type
 * @property {string} [vectorName] — Name of the vector to act on
 * @property {object} [data] — Step-specific payload
 * @property {string} [description] — Educational text for this step
 */

/**
 * Generate steps for vector addition: a + b = result.
 *
 * @param {string} nameA — Name of first vector (e.g., "p")
 * @param {object} a — Direction {x, y, z}
 * @param {string} nameB — Name of second vector (e.g., "q")
 * @param {object} b — Direction {x, y, z}
 * @param {number} resultColor — Hex color for result vector
 * @returns {{ resultName: string, result: object, steps: OperationStep[] }}
 */
export function addition(nameA, a, nameB, b, resultColor) {
  const result = VMath.add(a, b);
  const resultName = `${nameA}+${nameB}`;

  return {
    resultName,
    result,
    steps: [
      {
        type: 'highlight',
        vectorName: nameA,
        description: `Mulai dengan vektor ${nameA} = ${VMath.toString(a, 1)}`,
      },
      {
        type: 'highlight',
        vectorName: nameB,
        description: `Dan vektor ${nameB} = ${VMath.toString(b, 1)}`,
      },
      {
        type: 'construction',
        data: {
          // Show q translated to tip of p (parallelogram rule)
          ghostVector: { name: `${nameB}'`, ...b, origin: a, color: null, dashed: true },
          // And p translated to tip of q
          ghostVector2: { name: `${nameA}'`, ...a, origin: b, color: null, dashed: true },
        },
        description: `Pindahkan ${nameB} ke ujung ${nameA} (aturan jajar genjang)`,
      },
      {
        type: 'create',
        vectorName: resultName,
        data: {
          x: result.x,
          y: result.y,
          z: result.z,
          color: resultColor,
          animated: true,
        },
        description: `Hasil: ${nameA} + ${nameB} = ${VMath.toString(result, 1)}`,
      },
    ],
  };
}

/**
 * Generate steps for vector subtraction: a - b = result.
 *
 * @param {string} nameA
 * @param {object} a
 * @param {string} nameB
 * @param {object} b
 * @param {number} resultColor
 * @returns {{ resultName: string, result: object, steps: OperationStep[] }}
 */
export function subtraction(nameA, a, nameB, b, resultColor) {
  const negB = VMath.negate(b);
  const result = VMath.subtract(a, b);
  const resultName = `${nameA}-${nameB}`;

  return {
    resultName,
    result,
    steps: [
      {
        type: 'highlight',
        vectorName: nameA,
        description: `Mulai dengan vektor ${nameA} = ${VMath.toString(a, 1)}`,
      },
      {
        type: 'highlight',
        vectorName: nameB,
        description: `Kurangi vektor ${nameB} = ${VMath.toString(b, 1)}`,
      },
      {
        type: 'create',
        vectorName: `-${nameB}`,
        data: {
          x: negB.x,
          y: negB.y,
          z: negB.z,
          color: null, // use dimmed color
          animated: true,
          isHelper: true,
        },
        description: `Negasikan ${nameB}: -${nameB} = ${VMath.toString(negB, 1)}`,
      },
      {
        type: 'construction',
        data: {
          ghostVector: {
            name: `(-${nameB})'`,
            ...negB,
            origin: a,
            color: null,
            dashed: true,
          },
        },
        description: `Pindahkan -${nameB} ke ujung ${nameA}`,
      },
      {
        type: 'create',
        vectorName: resultName,
        data: {
          x: result.x,
          y: result.y,
          z: result.z,
          color: resultColor,
          animated: true,
        },
        description: `Hasil: ${nameA} - ${nameB} = ${VMath.toString(result, 1)}`,
      },
    ],
  };
}

/**
 * Generate steps for scalar multiplication: s * v = result.
 *
 * @param {number} scalar
 * @param {string} nameV
 * @param {object} v
 * @param {number} resultColor
 * @returns {{ resultName: string, result: object, steps: OperationStep[] }}
 */
export function scalarMultiply(scalar, nameV, v, resultColor) {
  const result = VMath.scale(v, scalar);
  const resultName = `${scalar}${nameV}`;

  return {
    resultName,
    result,
    steps: [
      {
        type: 'highlight',
        vectorName: nameV,
        description: `Mulai dengan vektor ${nameV} = ${VMath.toString(v, 1)}`,
      },
      {
        type: 'label',
        data: { text: `Kalikan dengan skalar ${scalar}` },
        description: `Skalakan dengan ${scalar}: arah ${scalar > 0 ? 'dipertahankan' : 'dibalik'}, magnitudo ×${Math.abs(scalar)}`,
      },
      {
        type: 'create',
        vectorName: resultName,
        data: {
          x: result.x,
          y: result.y,
          z: result.z,
          color: resultColor,
          animated: true,
        },
        description: `Hasil: ${scalar}${nameV} = ${VMath.toString(result, 1)}`,
      },
    ],
  };
}

/**
 * Generate steps for combined operation: s*a - b.
 *
 * @param {number} scalar
 * @param {string} nameA
 * @param {object} a
 * @param {string} nameB
 * @param {object} b
 * @param {number} resultColor
 * @returns {{ resultName: string, result: object, steps: OperationStep[] }}
 */
export function scalarMultiplyThenSubtract(scalar, nameA, a, nameB, b, resultColor) {
  const scaled = VMath.scale(a, scalar);
  const result = VMath.subtract(scaled, b);
  const resultName = `${scalar}${nameA}-${nameB}`;

  return {
    resultName,
    result,
    steps: [
      {
        type: 'highlight',
        vectorName: nameA,
        description: `Mulai dengan vektor ${nameA} = ${VMath.toString(a, 1)}`,
      },
      {
        type: 'create',
        vectorName: `${scalar}${nameA}`,
        data: {
          x: scaled.x,
          y: scaled.y,
          z: scaled.z,
          color: 0x03dac6,
          animated: true,
          isHelper: false,
        },
        description: `Skala: ${scalar}${nameA} = ${VMath.toString(scaled, 1)}`,
      },
      {
        type: 'highlight',
        vectorName: nameB,
        description: `Kurangi vektor ${nameB} = ${VMath.toString(b, 1)}`,
      },
      {
        type: 'construction',
        data: {
          ghostVector: {
            name: `(-${nameB})'`,
            ...VMath.negate(b),
            origin: scaled,
            color: null,
            dashed: true,
          },
        },
        description: `Pindahkan -${nameB} ke ujung ${scalar}${nameA}`,
      },
      {
        type: 'create',
        vectorName: resultName,
        data: {
          x: result.x,
          y: result.y,
          z: result.z,
          color: resultColor,
          animated: true,
        },
        description: `Hasil: ${scalar}${nameA} - ${nameB} = ${VMath.toString(result, 1)}`,
      },
    ],
  };
}

/**
 * Generate steps for dot product visualization: a · b = scalar.
 * Shows the projection of a onto b and the resulting scalar value.
 *
 * @param {string} nameA
 * @param {object} a
 * @param {string} nameB
 * @param {object} b
 * @param {number} projColor — Hex color for the projection vector
 * @returns {{ resultName: string, scalarResult: number, steps: OperationStep[] }}
 */
export function dotProduct(nameA, a, nameB, b, projColor) {
  const dotValue = VMath.dot(a, b);
  const proj = VMath.projectOnto(a, b);
  const angle = VMath.angleBetween(a, b);
  const angleDeg = (angle * 180 / Math.PI).toFixed(1);
  const resultName = `${nameA}·${nameB}`;

  return {
    resultName,
    scalarResult: dotValue,
    result: proj,
    steps: [
      {
        type: 'highlight',
        vectorName: nameA,
        description: `Vektor ${nameA} = ${VMath.toString(a, 1)}`,
      },
      {
        type: 'highlight',
        vectorName: nameB,
        description: `Vektor ${nameB} = ${VMath.toString(b, 1)}`,
      },
      {
        type: 'label',
        data: { text: `Sudut antara ${nameA} dan ${nameB}: ${angleDeg}°` },
        description: `Sudut antara ${nameA} dan ${nameB} adalah ${angleDeg}°`,
      },
      {
        type: 'create',
        vectorName: `proj_${nameA}_on_${nameB}`,
        data: {
          x: proj.x,
          y: proj.y,
          z: proj.z,
          color: projColor,
          animated: true,
        },
        description: `Proyeksi ${nameA} ke ${nameB} = ${VMath.toString(proj, 1)}`,
      },
      {
        type: 'label',
        data: { text: `${nameA} · ${nameB} = ${dotValue.toFixed(2)}` },
        description: `Hasil: ${nameA} · ${nameB} = ${dotValue.toFixed(2)} (nilai skalar)`,
      },
    ],
  };
}

/**
 * Generate steps for cross product visualization: a × b = result vector.
 * The result is perpendicular to both a and b.
 *
 * @param {string} nameA
 * @param {object} a
 * @param {string} nameB
 * @param {object} b
 * @param {number} resultColor — Hex color for the result vector
 * @returns {{ resultName: string, result: object, steps: OperationStep[] }}
 */
export function crossProduct(nameA, a, nameB, b, resultColor) {
  const result = VMath.cross(a, b);
  const mag = VMath.magnitude(result);
  const resultName = `${nameA}×${nameB}`;

  return {
    resultName,
    result,
    steps: [
      {
        type: 'highlight',
        vectorName: nameA,
        description: `Vektor ${nameA} = ${VMath.toString(a, 1)}`,
      },
      {
        type: 'highlight',
        vectorName: nameB,
        description: `Vektor ${nameB} = ${VMath.toString(b, 1)}`,
      },
      {
        type: 'construction',
        data: {
          ghostVector: { name: `${nameA}'`, ...a, origin: b, color: null, dashed: true },
          ghostVector2: { name: `${nameB}'`, ...b, origin: a, color: null, dashed: true },
        },
        description: `Bidang yang dibentuk oleh ${nameA} dan ${nameB}`,
      },
      {
        type: 'create',
        vectorName: resultName,
        data: {
          x: result.x,
          y: result.y,
          z: result.z,
          color: resultColor,
          animated: true,
        },
        description: `Hasil: ${nameA} × ${nameB} = ${VMath.toString(result, 1)}, |hasil| = ${mag.toFixed(2)}`,
      },
    ],
  };
}

/**
 * Generate steps for matrix transformation visualization: Rotation around Z axis.
 *
 * @param {string} nameV
 * @param {object} v
 * @param {number} angleDeg
 * @param {number} resultColor
 * @returns {{ resultName: string, result: object, steps: OperationStep[] }}
 */
export function rotateZ(nameV, v, angleDeg, resultColor) {
  const rad = angleDeg * Math.PI / 180;
  const cosT = Math.cos(rad);
  const sinT = Math.sin(rad);
  
  const result = {
    x: v.x * cosT - v.y * sinT,
    y: v.x * sinT + v.y * cosT,
    z: v.z
  };
  const resultName = `Rz(${nameV})`;

  return {
    resultName,
    result,
    steps: [
      {
        type: 'highlight',
        vectorName: nameV,
        description: `Vektor ${nameV} = ${VMath.toString(v, 1)}`,
      },
      {
        type: 'label',
        data: { text: `Transformasi Matriks: Rotasi ${angleDeg}° sumbu Z` },
        description: `Terapkan matriks rotasi: x' = x·cosθ - y·sinθ, y' = x·sinθ + y·cosθ`,
      },
      {
        type: 'create',
        vectorName: resultName,
        data: {
          x: result.x,
          y: result.y,
          z: result.z,
          color: resultColor,
          animated: true,
        },
        description: `Hasil Rotasi: ${VMath.toString(result, 1)}`,
      },
    ],
  };
}
