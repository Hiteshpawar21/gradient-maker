// ---------------------------------------------------------------------------
// randomizeProject – generates a random gradient using OKLCH harmony rules.
// Called by the store's `randomize` action.
// ---------------------------------------------------------------------------

import type {
  ColorStop,
  GradientConfig,
  GradientType,
  Project,
} from './types'
import { createDefaultProject, defaultGradientConfig } from './defaults'
import { generateId } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function randomFloat(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function randomInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1))
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Create a CSS oklch() colour string. */
function oklch(hue: number): string {
  const l = randomFloat(0.35, 0.85)
  const c = randomFloat(0.06, 0.2)
  const h = ((hue % 360) + 360) % 360
  return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`
}

// ---------------------------------------------------------------------------
// Harmonious palette generation
// ---------------------------------------------------------------------------

type Harmony = 'analogous' | 'complementary' | 'triadic' | 'split-complementary'

function harmonyHues(base: number, type: Harmony): number[] {
  switch (type) {
    case 'analogous':
      return [base - 25, base, base + 25]
    case 'complementary':
      return [base, base + 180]
    case 'triadic':
      return [base, base + 120, base + 240]
    case 'split-complementary':
      return [base, base + 150, base + 210]
  }
}

function generateStops(): ColorStop[] {
  const base = randomFloat(0, 360)
  const harmony = pick<Harmony>([
    'analogous',
    'complementary',
    'triadic',
    'split-complementary',
  ])
  const hues = harmonyHues(base, harmony)
  const count = randomInt(2, Math.min(5, hues.length + 2))

  return Array.from({ length: count }, (_, i) => ({
    id: generateId(),
    color: oklch(hues[i % hues.length]),
    position: Math.round((i / (count - 1)) * 100),
    opacity: 1,
  }))
}

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

/** Basic types suitable for randomisation. */
const RANDOM_TYPES: readonly GradientType[] = [
  'linear',
  'radial',
  'conic',
  'diamond',
  'reflected',
]

export function randomizeProject(): Project {
  const project = createDefaultProject()
  const type = pick(RANDOM_TYPES)
  const stops = generateStops()
  const base = defaultGradientConfig(type) as GradientConfig & {
    stops?: ColorStop[]
  }

  // Replace stops and add small random tweaks per type
  const gradient: GradientConfig =
    'stops' in base
      ? ({ ...base, stops } as GradientConfig)
      : base

  if (gradient.type === 'linear') {
    ;(gradient as { angle: number }).angle = randomInt(0, 359)
  }

  project.gradient = gradient
  return project
}
