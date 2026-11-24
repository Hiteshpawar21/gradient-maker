// ---------------------------------------------------------------------------
// Linear Gradient Renderer (Type 1)
// Tier: CSS
// ---------------------------------------------------------------------------

import type { LinearConfig, Project } from '@/core/types'
import type { GradientRenderer } from '@/engine/registry'
import {
  applyStopsToCanvasGradient,
  formatColorStops,
  getInterpolationPrefix,
} from './common'

/**
 * Generate CSS linear-gradient string.
 */
export function linearToCSS(cfg: LinearConfig, project?: Project): string {
  const prefix = getInterpolationPrefix(project)
  const angleStr = `${cfg.angle}deg`
  const stopsStr = formatColorStops(cfg.stops)
  return `linear-gradient(${prefix}${angleStr}, ${stopsStr})`
}

export const linearRenderer: GradientRenderer<LinearConfig> = {
  type: 'linear',
  tier: 'css',
  toCSS(cfg: LinearConfig, project: Project): string {
    return linearToCSS(cfg, project)
  },
  toSVG(cfg: LinearConfig): string | null {
    const rad = (cfg.angle * Math.PI) / 180
    const x1 = Math.round(50 - 50 * Math.sin(rad))
    const y1 = Math.round(50 + 50 * Math.cos(rad))
    const x2 = Math.round(50 + 50 * Math.sin(rad))
    const y2 = Math.round(50 - 50 * Math.cos(rad))
    const stopsSvg = cfg.stops
      .map(
        (s) =>
          `<stop offset="${s.position}%" stop-color="${s.color}" stop-opacity="${s.opacity}" />`,
      )
      .join('')
    return `<linearGradient id="grad" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">${stopsSvg}</linearGradient>`
  },
  draw(
    ctx: CanvasRenderingContext2D,
    cfg: LinearConfig,
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
