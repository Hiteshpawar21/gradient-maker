// ---------------------------------------------------------------------------
// Canvas Noise Compositor
// Applies noise layer to Canvas 2D contexts with blend modes and transparency preservation.
// ---------------------------------------------------------------------------

import type { NoiseConfig } from '@/core/types'
import { generateNoiseImageData } from './generators'

/**
 * Maps CSS blend modes to CanvasRenderingContext2D globalCompositeOperation strings.
 */
export function mapBlendModeToComposite(
  blendMode: NoiseConfig['blendMode'],
): GlobalCompositeOperation {
  switch (blendMode) {
    case 'multiply':
      return 'multiply'
    case 'screen':
      return 'screen'
    case 'overlay':
      return 'overlay'
    case 'soft-light':
      return 'soft-light'
    case 'normal':
    default:
      return 'source-over'
  }
}

/**
 * Apply procedural noise to a canvas context.
 */
export function applyNoiseToCanvas(
  ctx: CanvasRenderingContext2D,
  noise: NoiseConfig,
  width: number,
  height: number,
): void {
  if (!noise.enabled || width <= 0 || height <= 0) return

  // 1. Generate noise in an offscreen canvas
  if (typeof document === 'undefined') return

  const offscreen = document.createElement('canvas')
  offscreen.width = width
  offscreen.height = height
  const offCtx = offscreen.getContext('2d')
  if (!offCtx) return

  const noiseImgData = generateNoiseImageData(noise, width, height)
  offCtx.putImageData(noiseImgData, 0, 0)

  // 2. Preserve transparency mask if requested
  if (noise.preserveTransparency) {
    // Mask offscreen noise with current canvas alpha
    offCtx.globalCompositeOperation = 'destination-in'
    offCtx.drawImage(ctx.canvas, 0, 0)
  }

  // 3. Composite onto destination canvas
  ctx.save()
  ctx.globalAlpha = Math.max(0, Math.min(1, noise.opacity))
  ctx.globalCompositeOperation = mapBlendModeToComposite(noise.blendMode)
  ctx.drawImage(offscreen, 0, 0)
  ctx.restore()
}
