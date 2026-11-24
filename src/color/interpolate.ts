// ---------------------------------------------------------------------------
// Color interpolation in multiple color spaces using culori.
// Math functions only — no React components (Rule 2).
// ---------------------------------------------------------------------------

import { interpolate, formatHex } from 'culori'
import type { Interpolation, ColorStop } from '@/core/types'

/**
 * Map project interpolation setting to culori interpolation mode.
 */
function getCuloriMode(space: Interpolation): 'rgb' | 'lrgb' | 'hsl' | 'oklab' {
  switch (space) {
    case 'srgb':
      return 'rgb'
    case 'srgb-linear':
      return 'lrgb'
    case 'hsl':
      return 'hsl'
    case 'oklab':
      return 'oklab'
  }
}

/**
 * Returns CSS color interpolation syntax (e.g. "in oklab", "in hsl").
 */
export function getCssInterpolationHint(space: Interpolation): string {
  switch (space) {
    case 'oklab':
      return 'in oklab'
    case 'hsl':
      return 'in hsl'
    case 'srgb-linear':
      return 'in srgb-linear'
    case 'srgb':
    default:
      return 'in srgb'
  }
}

/**
 * Interpolate between two colors at fraction t (0–1) in the specified color space.
 */
export function interpolatePair(
  color1: string,
  color2: string,
  space: Interpolation,
  t: number,
): string {
  try {
    const mode = getCuloriMode(space)
    const clampedT = Math.max(0, Math.min(1, t))
    const interpolator = interpolate([color1, color2], mode)
    const result = interpolator(clampedT)
    return formatHex(result)
  } catch {
    return color1
  }
}

/**
 * Sample a gradient represented by ColorStops at a normalized position (0–1).
 */
export function sampleGradientAt(
  stops: ColorStop[],
  t: number,
  space: Interpolation,
): string {
  if (stops.length === 0) return '#000000'
  if (stops.length === 1) return stops[0].color

  const sorted = [...stops].sort((a, b) => a.position - b.position)
  const posPercent = Math.max(0, Math.min(1, t)) * 100

  // Before first stop
  if (posPercent <= sorted[0].position) return sorted[0].color
  // After last stop
  if (posPercent >= sorted[sorted.length - 1].position) {
    return sorted[sorted.length - 1].color
  }

  // Find surrounding segment
  for (let i = 0; i < sorted.length - 1; i++) {
    const left = sorted[i]
    const right = sorted[i + 1]
    if (posPercent >= left.position && posPercent <= right.position) {
      const span = right.position - left.position
      const localT = span === 0 ? 0 : (posPercent - left.position) / span
      return interpolatePair(left.color, right.color, space, localT)
    }
  }

  return sorted[0].color
}

/**
 * Generate N evenly spaced color samples across a gradient in the given space.
 */
export function sampleGradient(
  stops: ColorStop[],
  count: number,
  space: Interpolation,
): string[] {
  if (count <= 0) return []
  if (count === 1) return [sampleGradientAt(stops, 0.5, space)]

  const samples: string[] = []
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    samples.push(sampleGradientAt(stops, t, space))
  }
  return samples
}
