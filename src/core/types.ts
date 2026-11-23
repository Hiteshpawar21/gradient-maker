// ---------------------------------------------------------------------------
// Core type definitions for the Gradient Maker project.
// Every gradient type, color stop, noise config and the root Project type.
// ---------------------------------------------------------------------------

/** CSS blend modes used throughout the project. */
export const BLEND_MODES = [
  'normal',
  'multiply',
  'screen',
  'overlay',
  'darken',
  'lighten',
  'color-dodge',
  'color-burn',
  'hard-light',
  'soft-light',
  'difference',
  'exclusion',
  'hue',
  'saturation',
  'color',
  'luminosity',
] as const

export type BlendMode = (typeof BLEND_MODES)[number]

/** Color-space interpolation modes. */
export type Interpolation = 'srgb' | 'srgb-linear' | 'hsl' | 'oklab'

// ---------------------------------------------------------------------------
// Shared sub-structures
// ---------------------------------------------------------------------------

export interface ColorStop {
  id: string
  color: string // any CSS color string
  position: number // 0–100
  opacity: number // 0–1
}

export interface MeshNode {
  id: string
  row: number
  col: number
  x: number // offset from grid cell centre, –0.5 to 0.5
  y: number
  color: string
}

export interface FreeformPoint {
  id: string
  x: number // 0–100
  y: number // 0–100
  color: string
  influenceRadius: number // 0–100
}

export interface BlurShape {
  id: string
  shapeType: 'circle' | 'ellipse' | 'rectangle' | 'blob'
  x: number // 0–100
  y: number // 0–100
  width: number // 0–100
  height: number // 0–100
  color: string
  blurRadius: number
  opacity: number // 0–1
}

/** A single layer inside a Layered gradient. */
export interface GradientLayer {
  id: string
  gradient: GradientConfig
  x: number
  y: number
  width: number
  height: number
  opacity: number // 0–1
  blendMode: BlendMode
}

// ---------------------------------------------------------------------------
// 15 gradient config interfaces (discriminated on `type`)
// ---------------------------------------------------------------------------

export interface LinearConfig {
  type: 'linear'
  stops: ColorStop[]
  angle: number // degrees
}

export interface RadialConfig {
  type: 'radial'
  stops: ColorStop[]
  centerX: number // 0–100
  centerY: number
  shape: 'circle' | 'ellipse'
  size: 'closest-side' | 'closest-corner' | 'farthest-side' | 'farthest-corner'
}

export interface ConicConfig {
  type: 'conic'
  stops: ColorStop[]
  centerX: number
  centerY: number
  startAngle: number
}

export interface DiamondConfig {
  type: 'diamond'
  stops: ColorStop[]
  centerX: number
  centerY: number
  width: number
  height: number
  rotation: number
  falloff: number // power curve, typically 1–4
}

export interface RepeatingLinearConfig {
  type: 'repeating-linear'
  stops: ColorStop[]
  angle: number
  stripeWidth: number
  repeatInterval: number
}

export interface RepeatingRadialConfig {
  type: 'repeating-radial'
  stops: ColorStop[]
  centerX: number
  centerY: number
  shape: 'circle' | 'ellipse'
  ringSize: number
  repeatInterval: number
}

export interface RepeatingConicConfig {
  type: 'repeating-conic'
  stops: ColorStop[]
  centerX: number
  centerY: number
  startAngle: number
  segmentSize: number // degrees
}

export interface MeshConfig {
  type: 'mesh'
  rows: number
  columns: number
  nodes: MeshNode[]
  interpolation: 'bilinear' | 'bicubic'
  smoothness: number // 0–1
}

export interface FreeformConfig {
  type: 'freeform'
  points: FreeformPoint[]
  smoothness: number // 0–1
}

export interface ShapeBlurConfig {
  type: 'shape-blur'
  shapes: BlurShape[]
}

export interface LayeredConfig {
  type: 'layered'
  layers: GradientLayer[]
}

export interface ReflectedConfig {
  type: 'reflected'
  stops: ColorStop[]
  angle: number
  centerX: number
  centerY: number
  symmetry: 'none' | 'horizontal' | 'vertical' | 'both'
}

export interface AuroraConfig {
  type: 'aurora'
  ribbonCount: number
  colors: string[]
  waveAmplitude: number
  flowDirection: number // degrees
  blur: number
  glow: number // 0–1
  opacity: number // 0–1
}

export interface HolographicConfig {
  type: 'holographic'
  stops: ColorStop[]
  hueRange: [number, number]
  angle: number
  blendMode: BlendMode
  highlightIntensity: number // 0–1
}

export interface GrainyConfig {
  type: 'grainy'
  baseGradient: GradientConfig
}

// ---------------------------------------------------------------------------
// Discriminated union + derived helpers
// ---------------------------------------------------------------------------

export type GradientConfig =
  | LinearConfig
  | RadialConfig
  | ConicConfig
  | DiamondConfig
  | RepeatingLinearConfig
  | RepeatingRadialConfig
  | RepeatingConicConfig
  | MeshConfig
  | FreeformConfig
  | ShapeBlurConfig
  | LayeredConfig
  | ReflectedConfig
  | AuroraConfig
  | HolographicConfig
  | GrainyConfig

/** Derived string-literal union of all gradient type names. */
export type GradientType = GradientConfig['type']

/** Runtime-iterable list of every gradient type. */
export const GRADIENT_TYPES: readonly GradientType[] = [
  'linear',
  'radial',
  'conic',
  'diamond',
  'repeating-linear',
  'repeating-radial',
  'repeating-conic',
  'mesh',
  'freeform',
  'shape-blur',
  'layered',
  'reflected',
  'aurora',
  'holographic',
  'grainy',
]

// ---------------------------------------------------------------------------
// Noise configuration
// ---------------------------------------------------------------------------

export interface NoiseConfig {
  enabled: boolean
  type: 'gaussian' | 'uniform' | 'monochromatic' | 'colored-rgb'
  intensity: number
  grainSize: 'fine' | 'small' | 'medium' | 'coarse'
  scale: number
  opacity: number
  distribution: 'uniform' | 'gaussian'
  color: 'black' | 'white' | 'monochrome' | 'colored'
  blendMode: 'normal' | 'overlay' | 'soft-light' | 'multiply' | 'screen'
  density: 'sparse' | 'balanced' | 'dense'
  seed: number
  textureStyle: 'film-grain' | 'analog' | 'digital' | 'paper'
  animated: boolean
  animationSpeed: 'slow' | 'medium' | 'fast' | number
  loopDuration: number // seconds
  seamlessLoop: boolean
  preserveTransparency: boolean
  blending: 'overlay' | 'underlay' | 'embedded'
}

// ---------------------------------------------------------------------------
// Root project
// ---------------------------------------------------------------------------

export interface Project {
  version: 1
  canvas: {
    width: number
    height: number
    background: string
  }
  gradient: GradientConfig
  global: {
    interpolation: Interpolation
    opacity: number
    rotation: number
    offsetX: number
    offsetY: number
    blendMode: BlendMode
    blur: number
    glow: { amount: number; color: string }
  }
  effects: {
    noise: NoiseConfig
  }
}

// ---------------------------------------------------------------------------
// Utility types
// ---------------------------------------------------------------------------

/** Omit that distributes correctly over union members. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never

/** Partial that distributes correctly over union members. */
type DistributivePartial<T> = T extends unknown ? Partial<T> : never

/** Accepts a partial update for any single gradient config variant (minus type). */
export type GradientConfigUpdate = DistributivePartial<
  DistributiveOmit<GradientConfig, 'type'>
>

/** Subset of GradientConfig variants that carry a `stops` array. */
export type GradientConfigWithStops = Extract<
  GradientConfig,
  { stops: ColorStop[] }
>

/** Runtime type guard: does this config have a `stops` array? */
export function hasStops(
  config: GradientConfig,
): config is GradientConfigWithStops {
  return 'stops' in config
}
