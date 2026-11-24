// ---------------------------------------------------------------------------
// Diamond Gradient Renderer (Type 4)
// Tier: Canvas 2D
// Formula: per pixel, t = pow(|x'|/w + |y'|/h, falloff) after center and rotation,
// then sample the stops via pre-calculated LUT.
// ---------------------------------------------------------------------------

import type { DiamondConfig, Project } from '@/core/types'
import type { GradientRenderer } from '@/engine/registry'
import { sampleGradientAt } from '@/color/interpolate'
import { toRgb } from '@/color/convert'

export const diamondRenderer: GradientRenderer<DiamondConfig> = {
  type: 'diamond',
  tier: 'canvas',
  toCSS(): string | null {
    // Diamond is not expressible in native CSS
    return null
  },
  draw(
    ctx: CanvasRenderingContext2D,
    cfg: DiamondConfig,
    project: Project,
    w: number,
    h: number,
  ): void {
    if (w <= 0 || h <= 0) return

    // 1. Build a 256-sample RGBA lookup table (LUT) for fast rendering
    const lutSize = 256
    const lut = new Uint8ClampedArray(lutSize * 4)
    const interp = project.global.interpolation

    for (let i = 0; i < lutSize; i++) {
      const t = i / (lutSize - 1)
      const color = sampleGradientAt(cfg.stops, t, interp)
      const rgb = toRgb(color)
      lut[i * 4] = rgb.r
      lut[i * 4 + 1] = rgb.g
      lut[i * 4 + 2] = rgb.b
      lut[i * 4 + 3] = Math.round(rgb.a * 255)
    }

    // 2. Geometry parameters
    const cx = (cfg.centerX / 100) * w
    const cy = (cfg.centerY / 100) * h
    const rx = Math.max(1, (cfg.width / 100) * w * 0.5)
    const ry = Math.max(1, (cfg.height / 100) * h * 0.5)
    const rad = (cfg.rotation * Math.PI) / 180
    const cos = Math.cos(-rad)
    const sin = Math.sin(-rad)
    const falloff = cfg.falloff > 0 ? cfg.falloff : 1

    // 3. Render per-pixel to ImageData
    const imgData = ctx.createImageData(w, h)
    const data = imgData.data

    for (let y = 0; y < h; y++) {
      const dy = y - cy
      const rowOffset = y * w * 4
      for (let x = 0; x < w; x++) {
        const dx = x - cx
        const xPrime = dx * cos - dy * sin
        const yPrime = dx * sin + dy * cos

        const dist = Math.abs(xPrime) / rx + Math.abs(yPrime) / ry
        const t = Math.min(1, Math.max(0, Math.pow(dist, falloff)))
        const lutIdx = Math.min(lutSize - 1, Math.round(t * (lutSize - 1))) * 4
        const pixelIdx = rowOffset + x * 4

        data[pixelIdx] = lut[lutIdx]
        data[pixelIdx + 1] = lut[lutIdx + 1]
        data[pixelIdx + 2] = lut[lutIdx + 2]
        data[pixelIdx + 3] = lut[lutIdx + 3]
      }
    }

    ctx.putImageData(imgData, 0, 0)
  },
}
