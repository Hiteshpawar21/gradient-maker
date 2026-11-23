// ---------------------------------------------------------------------------
// Zod schemas – mirrors every type in types.ts for runtime validation.
// Used by loadProject to reject malformed JSON imports.
// ---------------------------------------------------------------------------

import { z } from 'zod'
import type { GradientConfig, Project } from './types'

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

const blendModeSchema = z.enum([
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
])

const interpolationSchema = z.enum(['srgb', 'srgb-linear', 'hsl', 'oklab'])

const colorStopSchema = z.object({
  id: z.string(),
  color: z.string(),
  position: z.number().min(0).max(100),
  opacity: z.number().min(0).max(1),
})

// ---------------------------------------------------------------------------
// Sub-structures
// ---------------------------------------------------------------------------

const meshNodeSchema = z.object({
  id: z.string(),
  row: z.number().int().min(0),
  col: z.number().int().min(0),
  x: z.number(),
  y: z.number(),
  color: z.string(),
})

const freeformPointSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  color: z.string(),
  influenceRadius: z.number().min(0),
})

const blurShapeSchema = z.object({
  id: z.string(),
  shapeType: z.enum(['circle', 'ellipse', 'rectangle', 'blob']),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  color: z.string(),
  blurRadius: z.number().min(0),
  opacity: z.number().min(0).max(1),
})

// ---------------------------------------------------------------------------
// 15 gradient config schemas
// ---------------------------------------------------------------------------

const linearConfigSchema = z.object({
  type: z.literal('linear'),
  stops: z.array(colorStopSchema).min(2),
  angle: z.number(),
})

const radialConfigSchema = z.object({
  type: z.literal('radial'),
  stops: z.array(colorStopSchema).min(2),
  centerX: z.number(),
  centerY: z.number(),
  shape: z.enum(['circle', 'ellipse']),
  size: z.enum([
    'closest-side',
    'closest-corner',
    'farthest-side',
    'farthest-corner',
  ]),
})

const conicConfigSchema = z.object({
  type: z.literal('conic'),
  stops: z.array(colorStopSchema).min(2),
  centerX: z.number(),
  centerY: z.number(),
  startAngle: z.number(),
})

const diamondConfigSchema = z.object({
  type: z.literal('diamond'),
  stops: z.array(colorStopSchema).min(2),
  centerX: z.number(),
  centerY: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number(),
  falloff: z.number(),
})

const repeatingLinearConfigSchema = z.object({
  type: z.literal('repeating-linear'),
  stops: z.array(colorStopSchema).min(2),
  angle: z.number(),
  stripeWidth: z.number(),
  repeatInterval: z.number(),
})

const repeatingRadialConfigSchema = z.object({
  type: z.literal('repeating-radial'),
  stops: z.array(colorStopSchema).min(2),
  centerX: z.number(),
  centerY: z.number(),
  shape: z.enum(['circle', 'ellipse']),
  ringSize: z.number(),
  repeatInterval: z.number(),
})

const repeatingConicConfigSchema = z.object({
  type: z.literal('repeating-conic'),
  stops: z.array(colorStopSchema).min(2),
  centerX: z.number(),
  centerY: z.number(),
  startAngle: z.number(),
  segmentSize: z.number(),
})

const meshConfigSchema = z.object({
  type: z.literal('mesh'),
  rows: z.number().int().min(2),
  columns: z.number().int().min(2),
  nodes: z.array(meshNodeSchema).min(4),
  interpolation: z.enum(['bilinear', 'bicubic']),
  smoothness: z.number().min(0).max(1),
})

const freeformConfigSchema = z.object({
  type: z.literal('freeform'),
  points: z.array(freeformPointSchema).min(1),
  smoothness: z.number().min(0).max(1),
})

const shapeBlurConfigSchema = z.object({
  type: z.literal('shape-blur'),
  shapes: z.array(blurShapeSchema).min(1),
})

// Recursive schemas: Layered and Grainy reference gradientConfigSchema
// via z.lazy so the circular reference is resolved at parse time.

const gradientLayerSchema = z.object({
  id: z.string(),
  gradient: z.lazy((): z.ZodType<GradientConfig> => gradientConfigSchema),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  opacity: z.number().min(0).max(1),
  blendMode: blendModeSchema,
})

const layeredConfigSchema = z.object({
  type: z.literal('layered'),
  layers: z.array(gradientLayerSchema).min(1),
})

const reflectedConfigSchema = z.object({
  type: z.literal('reflected'),
  stops: z.array(colorStopSchema).min(2),
  angle: z.number(),
  centerX: z.number(),
  centerY: z.number(),
  symmetry: z.enum(['none', 'horizontal', 'vertical', 'both']),
})

const auroraConfigSchema = z.object({
  type: z.literal('aurora'),
  ribbonCount: z.number().int().min(1),
  colors: z.array(z.string()).min(1),
  waveAmplitude: z.number(),
  flowDirection: z.number(),
  blur: z.number().min(0),
  glow: z.number().min(0).max(1),
  opacity: z.number().min(0).max(1),
})

const holographicConfigSchema = z.object({
  type: z.literal('holographic'),
  stops: z.array(colorStopSchema).min(2),
  hueRange: z.tuple([z.number(), z.number()]),
  angle: z.number(),
  blendMode: blendModeSchema,
  highlightIntensity: z.number().min(0).max(1),
})

const grainyConfigSchema = z.object({
  type: z.literal('grainy'),
  baseGradient: z.lazy(
    (): z.ZodType<GradientConfig> => gradientConfigSchema,
  ),
})

// ---------------------------------------------------------------------------
// Combined gradient config (discriminated union)
// ---------------------------------------------------------------------------

// Because layered & grainy use z.lazy, z.discriminatedUnion cannot be used
// (it needs concrete ZodObject options). z.union works identically here—the
// only downside is O(n) validation instead of O(1), but n = 15 is trivial.
const gradientConfigSchema: z.ZodType<GradientConfig> = z.union([
  linearConfigSchema,
  radialConfigSchema,
  conicConfigSchema,
  diamondConfigSchema,
  repeatingLinearConfigSchema,
  repeatingRadialConfigSchema,
  repeatingConicConfigSchema,
  meshConfigSchema,
  freeformConfigSchema,
  shapeBlurConfigSchema,
  layeredConfigSchema,
  reflectedConfigSchema,
  auroraConfigSchema,
  holographicConfigSchema,
  grainyConfigSchema,
])

// ---------------------------------------------------------------------------
// Noise configuration schema
// ---------------------------------------------------------------------------

const noiseConfigSchema = z.object({
  enabled: z.boolean(),
  type: z.enum(['gaussian', 'uniform', 'monochromatic', 'colored-rgb']),
  intensity: z.number().min(0).max(1),
  grainSize: z.enum(['fine', 'small', 'medium', 'coarse']),
  scale: z.number(),
  opacity: z.number().min(0).max(1),
  distribution: z.enum(['uniform', 'gaussian']),
  color: z.enum(['black', 'white', 'monochrome', 'colored']),
  blendMode: z.enum(['normal', 'overlay', 'soft-light', 'multiply', 'screen']),
  density: z.enum(['sparse', 'balanced', 'dense']),
  seed: z.number(),
  textureStyle: z.enum(['film-grain', 'analog', 'digital', 'paper']),
  animated: z.boolean(),
  animationSpeed: z.union([
    z.enum(['slow', 'medium', 'fast']),
    z.number(),
  ]),
  loopDuration: z.number().min(0),
  seamlessLoop: z.boolean(),
  preserveTransparency: z.boolean(),
  blending: z.enum(['overlay', 'underlay', 'embedded']),
})

// ---------------------------------------------------------------------------
// Root project schema
// ---------------------------------------------------------------------------

export const projectSchema: z.ZodType<Project> = z.object({
  version: z.literal(1),
  canvas: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
    background: z.string(),
  }),
  gradient: gradientConfigSchema,
  global: z.object({
    interpolation: interpolationSchema,
    opacity: z.number().min(0).max(1),
    rotation: z.number(),
    offsetX: z.number(),
    offsetY: z.number(),
    blendMode: blendModeSchema,
    blur: z.number().min(0),
    glow: z.object({
      amount: z.number().min(0),
      color: z.string(),
    }),
  }),
  effects: z.object({
    noise: noiseConfigSchema,
  }),
})

export { gradientConfigSchema, noiseConfigSchema, colorStopSchema }
