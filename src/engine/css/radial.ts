// ---------------------------------------------------------------------------
// Radial Gradient Renderer (Type 2)
// Tier: CSS
// ---------------------------------------------------------------------------

import type { RadialConfig, Project } from '@/core/types'
import type { GradientRenderer } from '@/engine/registry'
import {
  applyStopsToCanvasGradient,
  formatColorStops,
  getInterpolationPrefix,
} from './common'

/**
 * Generate CSS radial-gradient string.
 */
export function radialToCSS(cfg: RadialConfig, project?: Project): string {
  const prefix = getInterpolationPrefix(project)
  const shape = cfg.shape
  const size = cfg.size
  const center = `at ${cfg.centerX}% ${cfg.centerY}%`
  const stopsStr = formatColorStops(cfg.stops)
  return `radial-gradient(${prefix}${shape} ${size} ${center}, ${stopsStr})`
}

export const radialRenderer: GradientRenderer<RadialConfig> = {
  type: 'radial',
  tier: 'css',
  toCSS(cfg: RadialConfig, project: Project): string {
    return radialToCSS(cfg, project)
  },
  toSVG(cfg: RadialConfig): string | null {
    const stopsSvg = cfg.stops
      .map(
        (s) =>
          `<stop offset="${s.position}%" stop-color="${s.color}" stop-opacity="${s.opacity}" />`,
      )
      .join('')
    return `<radialGradient id="grad" cx="${cfg.centerX}%" cy="${cfg.centerY}%" r="50%">${stopsSvg}</radialGradient>`
  },
  draw(
    ctx: CanvasRenderingContext2D,
    cfg: RadialConfig,
    _project: Project,
    w: number,
    h: number,
  ): void {
    const cx = (cfg.centerX / 100) * w
    const cy = (cfg.centerY / 100) * h

    let radius: number
    switch (cfg.size) {
      case 'closest-side':
        radius = Math.min(cx, w - cx, cy, h - cy)
        break
      case 'farthest-side':
        radius = Math.max(cx, w - cx, cy, h - cy)
        break
      case 'closest-corner':
        radius = Math.min(
          Math.hypot(cx, cy),
          Math.hypot(w - cx, cy),
          Math.hypot(cx, h - cy),
          Math.hypot(w - cx, h - cy),
        )
        break
      case 'farthest-corner':
      default:
        radius = Math.max(
          Math.hypot(cx, cy),
          Math.hypot(w - cx, cy),
          Math.hypot(cx, h - cy),
          Math.hypot(w - cx, h - cy),
        )
        break
    }

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(1, radius))
    applyStopsToCanvasGradient(grad, cfg.stops)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
  },
}
