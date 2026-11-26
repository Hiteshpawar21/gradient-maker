// ---------------------------------------------------------------------------
// Reflected Gradient Renderer (Type 12)
// Tier: CSS
// Generates mirrored stops around center based on symmetry.
// ---------------------------------------------------------------------------

import type { ColorStop, Project, ReflectedConfig } from '@/core/types'
import type { GradientRenderer } from '@/engine/registry'
import {
  applyStopsToCanvasGradient,
  formatColorStops,
  getInterpolationPrefix,
} from './common'

/**
 * Mirror an array of stops around a center percentage (0..100).
 * Produces a symmetric sequence from 0% to center to 100%.
 */
export function createMirroredStops(
  stops: ColorStop[],
  center = 50,
): ColorStop[] {
  if (stops.length === 0) return []
  if (stops.length === 1) {
    return [
      { ...stops[0], id: `${stops[0].id}-0`, position: 0 },
      { ...stops[0], id: `${stops[0].id}-1`, position: 100 },
    ]
  }

  // Sort input stops by original position 0..100
  const sorted = [...stops].sort((a, b) => a.position - b.position)
  const clampedCenter = Math.max(1, Math.min(99, center))

  // Left half: reverse order, mapped from clampedCenter down to 0
  const leftHalf: ColorStop[] = sorted.slice().reverse().map((s, idx) => {
    const fraction = s.position / 100
    const pos = Math.round((clampedCenter - fraction * clampedCenter) * 10) / 10
    return {
      ...s,
      id: `${s.id}-l-${idx}`,
      position: Math.max(0, Math.min(clampedCenter, pos)),
    }
  })

  // Right half: forward order, mapped from clampedCenter up to 100
  const rightHalf: ColorStop[] = sorted.map((s, idx) => {
    const fraction = s.position / 100
    const pos =
      Math.round((clampedCenter + fraction * (100 - clampedCenter)) * 10) / 10
    return {
      ...s,
      id: `${s.id}-r-${idx}`,
      position: Math.max(clampedCenter, Math.min(100, pos)),
    }
  })

  // Combine and deduplicate exact duplicate center stop if positions coincide
  const combined = [...leftHalf, ...rightHalf].sort(
    (a, b) => a.position - b.position,
  )
  return combined
}

/**
 * Generate CSS for reflected gradient.
 */
export function reflectedToCSS(
  cfg: ReflectedConfig,
  project?: Project,
): string {
  const prefix = getInterpolationPrefix(project)

  if (cfg.symmetry === 'none') {
    const stopsStr = formatColorStops(cfg.stops)
    return `linear-gradient(${prefix}${cfg.angle}deg, ${stopsStr})`
  }

  const center = cfg.symmetry === 'vertical' ? cfg.centerY : cfg.centerX
  const mirrored = createMirroredStops(cfg.stops, center)
  const stopsStr = formatColorStops(mirrored)

  if (cfg.symmetry === 'horizontal') {
    return `linear-gradient(${prefix}${cfg.angle}deg, ${stopsStr})`
  }

  if (cfg.symmetry === 'vertical') {
    const verticalAngle = (cfg.angle + 90) % 360
    return `linear-gradient(${prefix}${verticalAngle}deg, ${stopsStr})`
  }

  // symmetry === 'both' (cross reflection)
  const vAngle = (cfg.angle + 90) % 360
  return `linear-gradient(${prefix}${cfg.angle}deg, ${stopsStr}), linear-gradient(${prefix}${vAngle}deg, ${stopsStr})`
}

export const reflectedRenderer: GradientRenderer<ReflectedConfig> = {
  type: 'reflected',
  tier: 'css',
  toCSS(cfg: ReflectedConfig, project: Project): string {
    return reflectedToCSS(cfg, project)
  },
  toSVG(cfg: ReflectedConfig): string | null {
    const mirrored =
      cfg.symmetry === 'none'
        ? cfg.stops
        : createMirroredStops(
            cfg.stops,
            cfg.symmetry === 'vertical' ? cfg.centerY : cfg.centerX,
          )
    const rad = (cfg.angle * Math.PI) / 180
    const x1 = Math.round(50 - 50 * Math.sin(rad))
    const y1 = Math.round(50 + 50 * Math.cos(rad))
    const x2 = Math.round(50 + 50 * Math.sin(rad))
    const y2 = Math.round(50 - 50 * Math.cos(rad))
    const stopsSvg = mirrored
      .map(
        (s) =>
          `<stop offset="${s.position}%" stop-color="${s.color}" stop-opacity="${s.opacity}" />`,
      )
      .join('')
    return `<linearGradient id="grad" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">${stopsSvg}</linearGradient>`
  },
  draw(
    ctx: CanvasRenderingContext2D,
    cfg: ReflectedConfig,
    _project: Project,
    w: number,
    h: number,
  ): void {
    const mirrored =
      cfg.symmetry === 'none'
        ? cfg.stops
        : createMirroredStops(
            cfg.stops,
            cfg.symmetry === 'vertical' ? cfg.centerY : cfg.centerX,
          )

    const drawLinearPass = (angle: number) => {
      const rad = (angle * Math.PI) / 180
      const dx = Math.sin(rad)
      const dy = -Math.cos(rad)
      const L = Math.abs(w * dx) + Math.abs(h * dy)
      const cx = w / 2
      const cy = h / 2
      const x0 = cx - (L / 2) * dx
      const y0 = cy - (L / 2) * dy
      const x1 = cx + (L / 2) * dx
      const y1 = cy + (L / 2) * dy

      const grad = ctx.createLinearGradient(x0, y0, x1, y1)
      applyStopsToCanvasGradient(grad, mirrored)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)
    }

    if (cfg.symmetry === 'vertical') {
      drawLinearPass((cfg.angle + 90) % 360)
    } else if (cfg.symmetry === 'both') {
      drawLinearPass(cfg.angle)
      ctx.save()
      ctx.globalCompositeOperation = 'overlay'
      drawLinearPass((cfg.angle + 90) % 360)
      ctx.restore()
    } else {
      drawLinearPass(cfg.angle)
    }
  },
}
