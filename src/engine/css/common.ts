// ---------------------------------------------------------------------------
// Shared CSS & Canvas Gradient Helpers
// Pure functions for formatting stops and canvas gradient drawing.
// ---------------------------------------------------------------------------

import type { ColorStop, Interpolation, Project } from '@/core/types'
import { toRgb, fromRgb } from '@/color/convert'
import { sortStops } from '@/color/stops'

/**
 * Format a color stop's color string, applying stop opacity if < 1.
 */
export function formatStopColor(color: string, opacity = 1): string {
  if (opacity >= 1) return color
  const rgb = toRgb(color)
  const finalAlpha = Math.max(0, Math.min(1, rgb.a * opacity))
  return fromRgb(rgb.r, rgb.g, rgb.b, finalAlpha)
}

/**
 * Format an array of ColorStops into CSS stop list string.
 */
export function formatColorStops(
  stops: ColorStop[],
  unit: '%' | 'px' | 'deg' = '%',
  positionMapper?: (pos: number) => number,
): string {
  const sorted = sortStops(stops)
  return sorted
    .map((s) => {
      const colorStr = formatStopColor(s.color, s.opacity)
      const pos = positionMapper ? positionMapper(s.position) : s.position
      return `${colorStr} ${pos}${unit}`
    })
    .join(', ')
}

/**
 * Get CSS color interpolation method prefix if not default 'srgb'.
 */
export function getInterpolationPrefix(project?: Project): string {
  const interp: Interpolation | undefined = project?.global.interpolation
  if (!interp || interp === 'srgb') return ''
  return `in ${interp} `
}

/**
 * Apply color stops to a CanvasGradient.
 */
export function applyStopsToCanvasGradient(
  gradient: CanvasGradient,
  stops: ColorStop[],
): void {
  const sorted = sortStops(stops)
  if (sorted.length === 0) return

  for (const s of sorted) {
    const offset = Math.max(0, Math.min(1, s.position / 100))
    const colorStr = formatStopColor(s.color, s.opacity)
    try {
      gradient.addColorStop(offset, colorStr)
    } catch {
      // Ignore invalid color stop values
    }
  }
}
