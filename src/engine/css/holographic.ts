// ---------------------------------------------------------------------------
// Holographic Gradient Renderer (Type 14)
// Tier: CSS Layers
// Stacked conic and linear layers with hue range, angle, highlight intensity,
// and screen/overlay iridescence.
// ---------------------------------------------------------------------------

import type { HolographicConfig, Project, ColorStop } from '@/core/types'
import type { GradientRenderer } from '@/engine/registry'
import {
  applyStopsToCanvasGradient,
  formatColorStops,
  getInterpolationPrefix,
} from './common'

/**
 * Generate synthetic spectral rainbow stops across a hue range [hStart, hEnd].
 */
export function generateSpectralStops(
  hueRange: [number, number],
  steps = 6,
): ColorStop[] {
  const [h0, h1] = hueRange
  const stops: ColorStop[] = []
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1)
    const rawHue = Math.round(h0 + t * (h1 - h0))
    const hue = rawHue === 360 ? 360 : rawHue % 360
    stops.push({
      id: `spectral-${i}`,
      color: `hsl(${hue}, 85%, 68%)`,
      position: Math.round(t * 100),
      opacity: 0.9,
    })
  }
  return stops
}

/**
 * Generate CSS for holographic gradient (stacked linear + conic + specular sheen).
 */
export function holographicToCSS(
  cfg: HolographicConfig,
  project?: Project,
): string {
  const prefix = getInterpolationPrefix(project)
  const clampedIntensity = Math.max(0, Math.min(1, cfg.highlightIntensity))

  // Specular sheen highlight layer
  const specular = `linear-gradient(${prefix}${cfg.angle}deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, ${clampedIntensity}) 50%, rgba(255, 255, 255, 0) 100%)`

  // Base stops or spectral stops across hue range
  const stopsToUse =
    cfg.stops.length >= 2
      ? cfg.stops
      : generateSpectralStops(cfg.hueRange)

  const conicStops = formatColorStops(stopsToUse, 'deg', (pos) =>
    Math.round((pos / 100) * 360),
  )
  const conic = `conic-gradient(${prefix}from ${cfg.angle}deg at 50% 50%, ${conicStops})`

  // Translucent interference wash
  const sheenAngle = (cfg.angle + 60) % 360
  const sheenStops = formatColorStops(stopsToUse)
  const sheen = `linear-gradient(${prefix}${sheenAngle}deg, ${sheenStops})`

  return `${specular}, ${conic}, ${sheen}`
}

export const holographicRenderer: GradientRenderer<HolographicConfig> = {
  type: 'holographic',
  tier: 'css',
  toCSS(cfg: HolographicConfig, project: Project): string {
    return holographicToCSS(cfg, project)
  },
  toSVG(cfg: HolographicConfig): string | null {
    const stopsToUse =
      cfg.stops.length >= 2
        ? cfg.stops
        : generateSpectralStops(cfg.hueRange)
    const stopsSvg = stopsToUse
      .map(
        (s) =>
          `<stop offset="${s.position}%" stop-color="${s.color}" stop-opacity="${s.opacity}" />`,
      )
      .join('')
    return `<linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">${stopsSvg}</linearGradient>`
  },
  draw(
    ctx: CanvasRenderingContext2D,
    cfg: HolographicConfig,
    _project: Project,
    w: number,
    h: number,
  ): void {
    const stopsToUse =
      cfg.stops.length >= 2
        ? cfg.stops
        : generateSpectralStops(cfg.hueRange)

    const cx = w / 2
    const cy = h / 2

    // 1. Draw base conic spectral gradient
    try {
      const rad = (cfg.angle * Math.PI) / 180
      const conicGrad = ctx.createConicGradient(rad, cx, cy)
      applyStopsToCanvasGradient(conicGrad, stopsToUse)
      ctx.fillStyle = conicGrad
      ctx.fillRect(0, 0, w, h)
    } catch {
      // Fallback if createConicGradient is unsupported
      const linGrad = ctx.createLinearGradient(0, 0, w, h)
      applyStopsToCanvasGradient(linGrad, stopsToUse)
      ctx.fillStyle = linGrad
      ctx.fillRect(0, 0, w, h)
    }

    // 2. Composite iridescent sheen layer
    ctx.save()
    ctx.globalCompositeOperation = 'soft-light'
    ctx.globalAlpha = 0.6
    const sheenRad = (((cfg.angle + 60) % 360) * Math.PI) / 180
    const dx = Math.sin(sheenRad)
    const dy = -Math.cos(sheenRad)
    const L = Math.abs(w * dx) + Math.abs(h * dy)
    const sheenGrad = ctx.createLinearGradient(
      cx - (L / 2) * dx,
      cy - (L / 2) * dy,
      cx + (L / 2) * dx,
      cy + (L / 2) * dy,
    )
    applyStopsToCanvasGradient(sheenGrad, stopsToUse)
    ctx.fillStyle = sheenGrad
    ctx.fillRect(0, 0, w, h)
    ctx.restore()

    // 3. Specular highlight band
    if (cfg.highlightIntensity > 0) {
      ctx.save()
      ctx.globalCompositeOperation = 'overlay'
      const specRad = (cfg.angle * Math.PI) / 180
      const sdx = Math.sin(specRad)
      const sdy = -Math.cos(specRad)
      const sL = Math.abs(w * sdx) + Math.abs(h * sdy)
      const specGrad = ctx.createLinearGradient(
        cx - (sL / 2) * sdx,
        cy - (sL / 2) * sdy,
        cx + (sL / 2) * sdx,
        cy + (sL / 2) * sdy,
      )
      const alpha = Math.max(0, Math.min(1, cfg.highlightIntensity))
      specGrad.addColorStop(0, 'rgba(255, 255, 255, 0)')
      specGrad.addColorStop(0.5, `rgba(255, 255, 255, ${alpha})`)
      specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = specGrad
      ctx.fillRect(0, 0, w, h)
      ctx.restore()
    }
  },
}
