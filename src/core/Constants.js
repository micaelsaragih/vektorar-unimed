/**
 * Constants.js
 * Central configuration for the entire application.
 * All magic numbers, colors, and dimensions live here.
 */

// ─── Renderer ────────────────────────────────────────────
export const RENDERER = {
  antialias: true,
  alpha: true,
  pixelRatioClamp: 2,
};

// ─── Camera ──────────────────────────────────────────────
export const CAMERA = {
  fov: 60,
  near: 0.01,
  far: 1000,
  position: { x: 4, y: 3, z: 5 },
  lookAt: { x: 0, y: 0, z: 0 },
};

// ─── Lighting ────────────────────────────────────────────
export const LIGHTING = {
  ambient: {
    color: 0xffffff,
    intensity: 0.6,
  },
  directional: {
    color: 0xffffff,
    intensity: 1.0,
    position: { x: 5, y: 10, z: 7 },
  },
  hemisphere: {
    skyColor: 0xffffff,
    groundColor: 0x0f172a, /* Dark navy ground for depth */
    intensity: 0.7,
  },
};

// ─── Scene Atmosphere ────────────────────────────────────
export const ATMOSPHERE = {
  fog: {
    color: 0x0b1120, /* Matches dark CSS background */
    near: 6,
    far: 20,
  },
  toneMappingExposure: 1.2,
};

// ─── Colors ──────────────────────────────────────────────
export const COLORS = {
  // Axis colors (standard math convention)
  xAxis: 0xef4444, // Bright Red
  yAxis: 0x22c55e, // Bright Green
  zAxis: 0x3b82f6, // Bright Blue

  // Grid
  gridPrimary: 0x334155, // Dark slate
  gridSecondary: 0x1e293b, // Very dark slate
  gridCenter: 0x64748b, // Medium slate

  // Background
  background: 0x0b1120, // Deep academic navy

  // Origin marker
  origin: 0xffffff, // White

  // Vector defaults
  vectorDefault: 0x38bdf8,
  vectorP: 0x38bdf8,     // Bright Cyan/Blue
  vectorQ: 0xf59e0b,     // Bright Amber

  // Operation result colors
  resultAdd: 0xa78bfa,      // Vibrant Purple
  resultSubtract: 0xf87171, // Soft Red
  resultScalar: 0x2dd4bf,   // Teal
  resultCross: 0xfbbf24,    // Amber
  resultDot: 0x34d399,      // Emerald Green

  // Projection / angle visualization
  projection: 0x7dd3fc,    // Light sky blue
  angleFill: 0xfbbf24,     // Amber

  // Construction lines
  constructionLine: 0x94a3b8,
};

// ─── Coordinate System ───────────────────────────────────
export const COORDINATE_SYSTEM = {
  axisLength: 5,
  axisThickness: 0.02,
  arrowHeadLength: 0.2,
  arrowHeadRadius: 0.06,
  arrowSegments: 12,
  labelSize: 0.2, /* Reduced from 0.3 for subtlety */
  labelOffset: 0.35,
  tickMarkLength: 0.08,
  tickMarkInterval: 1,
};

// ─── Grid ────────────────────────────────────────────────
export const GRID = {
  size: 10,
  divisions: 10,
  fadeDistance: 8,
  opacity: 0.8, /* Increased for better spatial perception */
  lineWidth: 1.2, /* Slightly thicker */
};

// ─── Vectors ─────────────────────────────────────────────
export const VECTOR = {
  shaftRadius: 0.025,
  shaftSegments: 8,
  headLength: 0.2,
  headRadius: 0.07,
  headSegments: 12,
  endpointRadius: 0.05,
  endpointSegments: 16,
  labelSize: 0.25,
  labelOffsetY: 0.25,
  emissiveIntensity: 0.3, /* Increased from 0.15 for better glow */
  minLength: 0.001,
};

// ─── AR / Hit-Test ───────────────────────────────────────
export const AR = {
  reticle: {
    innerRadius: 0.08,
    outerRadius: 0.1,
    segments: 32,
    color: 0xffffff,
  },
  requiredFeatures: ['hit-test'],
  optionalFeatures: ['dom-overlay'],
  placementScale: 0.5,
};

// ─── Animation Timing ────────────────────────────────────
export const ANIM = {
  // Easing durations (seconds)
  vectorGrowDuration: 0.8,
  vectorFadeDuration: 0.4,
  constructionLineDuration: 0.5,
  pauseBetweenSteps: 0.6,

  // Step sequencing
  stepDelayMs: 600,

  // Easing types
  defaultEasing: 'easeInOutCubic',
};

// ─── Dashed Line ─────────────────────────────────────────
export const DASHED_LINE = {
  dashSize: 0.1,
  gapSize: 0.06,
  lineWidth: 2,
  opacity: 0.5,
};
