// ---------------------------------------------------------------------------
// Conic Gradient Renderer (Type 3)
// Tier: CSS
// ---------------------------------------------------------------------------

import type { ConicConfig, Project } from '@/core/types'
import type { GradientRenderer } from '@/engine/registry'
import {
  applyStopsToCanvasGradient,
  formatColorStops,
  getInterpolationPrefix,
} from './common'

/**
 * Generate CSS conic-gradient string.
 */
export function conicToCSS(cfg: ConicConfig, project?: Project): string {
  const prefix = getInterpolationPrefix(project)
  const angle = `from ${cfg.startAngle}deg`
  const center = `at ${cfg.centerX}% ${cfg.centerY}%`
  const stopsStr = formatColorStops(cfg.stops)
  return `conic-gradient(${prefix}${angle} ${center}, ${stopsStr})`
}

export const conicRenderer: GradientRenderer<ConicConfig> = {
  type: 'conic',
  tier: 'css',
  toCSS(cfg: ConicConfig, project: Project): string {
    return conicToCSS(cfg, project)
  },
  draw(
    ctx: CanvasRenderingContext2D,
    cfg: ConicConfig,
    _project: Project,
    w: number,
    h: number,
  ): void {
    const cx = (cfg.centerX / 100) * w
    const cy = (cfg.centerY / 100) * h
    const startRad = ((cfg.startAngle - 90) * Math.PI) / 180

    // Canvas 2D createConicGradient is standard in modern browsers
    if (typeof ctx.createConicGradient === 'function') {
      const grad = ctx.createConicGradient(startRad, cx, cy)
      applyStopsToCanvasGradient(grad, cfg.stops)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)
    }
  },
}
