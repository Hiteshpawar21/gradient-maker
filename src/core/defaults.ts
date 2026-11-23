// ---------------------------------------------------------------------------
// Sensible defaults for every gradient type, noise, global settings and
// the root Project. Used by the store for reset() and setType().
// ---------------------------------------------------------------------------

import type {
  AuroraConfig,
  BlurShape,
  ColorStop,
  ConicConfig,
  DiamondConfig,
  FreeformConfig,
  FreeformPoint,
  GradientConfig,
  GradientType,
  GrainyConfig,
  HolographicConfig,
  LayeredConfig,
  LinearConfig,
  MeshConfig,
  MeshNode,
  NoiseConfig,
  Project,
  RadialConfig,
  ReflectedConfig,
  RepeatingConicConfig,
  RepeatingLinearConfig,
  RepeatingRadialConfig,
  ShapeBlurConfig,
} from './types'
import { generateId } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createStops(
  colors: [string, string, ...string[]],
): ColorStop[] {
  return colors.map((color, i) => ({
    id: generateId(),
    color,
    position: Math.round((i / (colors.length - 1)) * 100),
    opacity: 1,
  }))
}

// ---------------------------------------------------------------------------
// Noise defaults
// ---------------------------------------------------------------------------

export const defaultNoiseConfig: NoiseConfig = {
  enabled: false,
  type: 'gaussian',
  intensity: 0.3,
  grainSize: 'fine',
  scale: 1,
  opacity: 0.5,
  distribution: 'gaussian',
  color: 'monochrome',
  blendMode: 'overlay',
  density: 'balanced',
  seed: 42,
  textureStyle: 'film-grain',
  animated: false,
  animationSpeed: 'medium',
  loopDuration: 3,
  seamlessLoop: true,
  preserveTransparency: true,
  blending: 'overlay',
}

// ---------------------------------------------------------------------------
// Per-type gradient defaults
// ---------------------------------------------------------------------------

function defaultLinear(): LinearConfig {
  return { type: 'linear', stops: createStops(['#3b82f6', '#8b5cf6']), angle: 180 }
}

function defaultRadial(): RadialConfig {
  return {
    type: 'radial',
    stops: createStops(['#3b82f6', '#8b5cf6']),
    centerX: 50, centerY: 50,
    shape: 'circle',
    size: 'farthest-corner',
  }
}

function defaultConic(): ConicConfig {
  return {
    type: 'conic',
    stops: createStops(['#3b82f6', '#8b5cf6', '#3b82f6']),
    centerX: 50, centerY: 50,
    startAngle: 0,
  }
}

function defaultDiamond(): DiamondConfig {
  return {
    type: 'diamond',
    stops: createStops(['#3b82f6', '#8b5cf6']),
    centerX: 50, centerY: 50,
    width: 80, height: 80,
    rotation: 0, falloff: 1,
  }
}

function defaultRepeatingLinear(): RepeatingLinearConfig {
  return {
    type: 'repeating-linear',
    stops: createStops(['#3b82f6', '#8b5cf6']),
    angle: 45,
    stripeWidth: 20, repeatInterval: 40,
  }
}

function defaultRepeatingRadial(): RepeatingRadialConfig {
  return {
    type: 'repeating-radial',
    stops: createStops(['#3b82f6', '#8b5cf6']),
    centerX: 50, centerY: 50,
    shape: 'circle',
    ringSize: 20, repeatInterval: 40,
  }
}

function defaultRepeatingConic(): RepeatingConicConfig {
  return {
    type: 'repeating-conic',
    stops: createStops(['#3b82f6', '#8b5cf6']),
    centerX: 50, centerY: 50,
    startAngle: 0, segmentSize: 90,
  }
}

function defaultMesh(): MeshConfig {
  const rows = 3
  const columns = 3
  const palette = [
    '#ef4444', '#22c55e', '#3b82f6',
    '#eab308', '#a855f7', '#06b6d4',
    '#f97316', '#6366f1', '#f1f5f9',
  ]
  const nodes: MeshNode[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      nodes.push({
        id: generateId(), row: r, col: c,
        x: 0, y: 0,
        color: palette[r * columns + c],
      })
    }
  }
  return { type: 'mesh', rows, columns, nodes, interpolation: 'bilinear', smoothness: 0.5 }
}

function defaultFreeform(): FreeformConfig {
  const points: FreeformPoint[] = [
    { id: generateId(), x: 25, y: 25, color: '#ef4444', influenceRadius: 50 },
    { id: generateId(), x: 75, y: 25, color: '#22c55e', influenceRadius: 50 },
    { id: generateId(), x: 50, y: 75, color: '#3b82f6', influenceRadius: 50 },
  ]
  return { type: 'freeform', points, smoothness: 0.5 }
}

function defaultShapeBlur(): ShapeBlurConfig {
  const shapes: BlurShape[] = [
    { id: generateId(), shapeType: 'circle', x: 30, y: 40, width: 40, height: 40, color: '#ff6b6b', blurRadius: 40, opacity: 0.8 },
    { id: generateId(), shapeType: 'circle', x: 60, y: 55, width: 50, height: 50, color: '#4ecdc4', blurRadius: 50, opacity: 0.7 },
  ]
  return { type: 'shape-blur', shapes }
}

function defaultLayered(): LayeredConfig {
  return {
    type: 'layered',
    layers: [
      {
        id: generateId(),
        gradient: defaultLinear(),
        x: 0, y: 0, width: 100, height: 100,
        opacity: 1, blendMode: 'normal',
      },
      {
        id: generateId(),
        gradient: defaultRadial(),
        x: 0, y: 0, width: 100, height: 100,
        opacity: 0.7, blendMode: 'screen',
      },
    ],
  }
}

function defaultReflected(): ReflectedConfig {
  return {
    type: 'reflected',
    stops: createStops(['#3b82f6', '#8b5cf6']),
    angle: 0,
    centerX: 50, centerY: 50,
    symmetry: 'horizontal',
  }
}

function defaultAurora(): AuroraConfig {
  return {
    type: 'aurora',
    ribbonCount: 3,
    colors: ['#22d3ee', '#a78bfa', '#f472b6'],
    waveAmplitude: 50, flowDirection: 0,
    blur: 20, glow: 0.3, opacity: 1,
  }
}

function defaultHolographic(): HolographicConfig {
  return {
    type: 'holographic',
    stops: createStops(['#67e8f9', '#c084fc', '#f9a8d4']),
    hueRange: [180, 360],
    angle: 45,
    blendMode: 'screen',
    highlightIntensity: 0.7,
  }
}

function defaultGrainy(): GrainyConfig {
  return { type: 'grainy', baseGradient: defaultLinear() }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Return a sensible default gradient config for the given type. */
export function defaultGradientConfig(type: GradientType): GradientConfig {
  switch (type) {
    case 'linear': return defaultLinear()
    case 'radial': return defaultRadial()
    case 'conic': return defaultConic()
    case 'diamond': return defaultDiamond()
    case 'repeating-linear': return defaultRepeatingLinear()
    case 'repeating-radial': return defaultRepeatingRadial()
    case 'repeating-conic': return defaultRepeatingConic()
    case 'mesh': return defaultMesh()
    case 'freeform': return defaultFreeform()
    case 'shape-blur': return defaultShapeBlur()
    case 'layered': return defaultLayered()
    case 'reflected': return defaultReflected()
    case 'aurora': return defaultAurora()
    case 'holographic': return defaultHolographic()
    case 'grainy': return defaultGrainy()
  }
}

/** Create a fresh default Project. */
export function createDefaultProject(): Project {
  return {
    version: 1,
    canvas: { width: 800, height: 600, background: '#ffffff' },
    gradient: defaultLinear(),
    global: {
      interpolation: 'srgb',
      opacity: 1,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
      blendMode: 'normal',
      blur: 0,
      glow: { amount: 0, color: '#ffffff' },
    },
    effects: { noise: { ...defaultNoiseConfig } },
  }
}
