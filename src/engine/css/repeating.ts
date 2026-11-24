// ---------------------------------------------------------------------------
// Repeating Gradient Renderers (Types 5, 6, 7)
// Tier: CSS
// ---------------------------------------------------------------------------

import type {
  RepeatingLinearConfig,
  RepeatingRadialConfig,
  RepeatingConicConfig,
  Project,
} from '@/core/types'
import type { GradientRenderer } from '@/engine/registry'
import {
  formatColorStops,
  formatStopColor,
  getInterpolationPrefix,
  applyStopsToCanvasGradient,
} from './common'
import { sortStops } from '@/color/stops'

/**
 * Format color stops for repeating linear/radial gradients.
 */
function formatRepeatingStops(
  stops: RepeatingLinearConfig['stops'],
  activeSpan: number,
  period: number,
  unit: 'px' | '%' = 'px',
): string {
  const sorted = sortStops(stops)
  if (sorted.length === 0) return ''

  const safeSpan = Math.max(1, activeSpan)
  const safePeriod = Math.max(safeSpan, period)

  const stopParts = sorted.map((s) => {
    const pos = Number(((s.position / 100) * safeSpan).toFixed(1))
    const colorStr = formatStopColor(s.color, s.opacity)
    return `${colorStr} ${pos}${unit}`
  })

  // If interval is larger than active stripe width, anchor the cycle at the end
  if (safePeriod > safeSpan) {
    const lastStop = sorted[sorted.length - 1]
    const lastColorStr = formatStopColor(lastStop.color, lastStop.opacity)
    stopParts.push(`${lastColorStr} ${Number(safePeriod.toFixed(1))}${unit}`)
  }

  return stopParts.join(', ')
}

// ---------------------------------------------------------------------------
// Type 5: Repeating Linear
// ---------------------------------------------------------------------------

export function repeatingLinearToCSS(
  cfg: RepeatingLinearConfig,
  project?: Project,
): string {
  const prefix = getInterpolationPrefix(project)
  const stopsStr = formatRepeatingStops(
    cfg.stops,
    cfg.stripeWidth,
    cfg.repeatInterval,
    'px',
  )
  return `repeating-linear-gradient(${prefix}${cfg.angle}deg, ${stopsStr})`
}

export const repeatingLinearRenderer: GradientRenderer<RepeatingLinearConfig> = {
  type: 'repeating-linear',
  tier: 'css',
  toCSS(cfg: RepeatingLinearConfig, project: Project): string {
    return repeatingLinearToCSS(cfg, project)
  },
  draw(
    ctx: CanvasRenderingContext2D,
    cfg: RepeatingLinearConfig,
    _project: Project,
    w: number,
    h: number,
  ): void {
    const rad = (cfg.angle * Math.PI) / 180
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
    applyStopsToCanvasGradient(grad, cfg.stops)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
  },
}

// ---------------------------------------------------------------------------
// Type 6: Repeating Radial
// ---------------------------------------------------------------------------

export function repeatingRadialToCSS(
  cfg: RepeatingRadialConfig,
  project?: Project,
): string {
  const prefix = getInterpolationPrefix(project)
  const shape = cfg.shape
  const center = `at ${cfg.centerX}% ${cfg.centerY}%`
  const stopsStr = formatRepeatingStops(
    cfg.stops,
    cfg.ringSize,
    cfg.repeatInterval,
    'px',
  )
  return `repeating-radial-gradient(${prefix}${shape} ${center}, ${stopsStr})`
}

export const repeatingRadialRenderer: GradientRenderer<RepeatingRadialConfig> = {
  type: 'repeating-radial',
  tier: 'css',
  toCSS(cfg: RepeatingRadialConfig, project: Project): string {
    return repeatingRadialToCSS(cfg, project)
  },
  draw(
    ctx: CanvasRenderingContext2D,
    cfg: RepeatingRadialConfig,
    _project: Project,
    w: number,
    h: number,
  ): void {
    const cx = (cfg.centerX / 100) * w
    const cy = (cfg.centerY / 100) * h
    const radius = Math.max(1, cfg.repeatInterval)

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
    applyStopsToCanvasGradient(grad, cfg.stops)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
  },
}

// ---------------------------------------------------------------------------
// Type 7: Repeating Conic
// ---------------------------------------------------------------------------

export function repeatingConicToCSS(
  cfg: RepeatingConicConfig,
  project?: Project,
): string {
  const prefix = getInterpolationPrefix(project)
  const angle = `from ${cfg.startAngle}deg`
  const center = `at ${cfg.centerX}% ${cfg.centerY}%`
  const seg = Math.max(1, cfg.segmentSize)
  const stopsStr = formatColorStops(cfg.stops, 'deg', (pos) =>
    Number(((pos / 100) * seg).toFixed(1)),
  )
  return `repeating-conic-gradient(${prefix}${angle} ${center}, ${stopsStr})`
}

export const repeatingConicRenderer: GradientRenderer<RepeatingConicConfig> = {
  type: 'repeating-conic',
  tier: 'css',
  toCSS(cfg: RepeatingConicConfig, project: Project): string {
    return repeatingConicToCSS(cfg, project)
  },
  draw(
    ctx: CanvasRenderingContext2D,
    cfg: RepeatingConicConfig,
    _project: Project,
    w: number,
    h: number,
  ): void {
    const cx = (cfg.centerX / 100) * w
    const cy = (cfg.centerY / 100) * h
    const startRad = ((cfg.startAngle - 90) * Math.PI) / 180

    if (typeof ctx.createConicGradient === 'function') {
      const grad = ctx.createConicGradient(startRad, cx, cy)
      applyStopsToCanvasGradient(grad, cfg.stops)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)
    }
  },
}
