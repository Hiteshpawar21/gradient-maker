// ---------------------------------------------------------------------------
// Procedural Noise Generator & Texture Presets
// Generates ImageData and tileable Data-URIs for CSS and Canvas previews.
// Pure math and canvas image data — no React dependencies.
// ---------------------------------------------------------------------------

import type { NoiseConfig } from '@/core/types'
import { createPRNG, createGaussianPRNG } from './prng'

/**
 * Pixel cell step corresponding to grain size.
 */
export const GRAIN_CELL_SIZES: Record<NoiseConfig['grainSize'], number> = {
  fine: 1,
  small: 2,
  medium: 4,
  coarse: 8,
}

/**
 * Probability of cell activation per density level.
 */
export const DENSITY_PROBABILITIES: Record<NoiseConfig['density'], number> = {
  sparse: 0.35,
  balanced: 0.7,
  dense: 1.0,
}

/**
 * Parameter presets for named texture styles.
 */
export const TEXTURE_STYLE_PRESETS: Record<
  NoiseConfig['textureStyle'],
  Partial<NoiseConfig>
> = {
  'film-grain': {
    type: 'gaussian',
    distribution: 'gaussian',
    grainSize: 'fine',
    intensity: 0.28,
    opacity: 0.45,
    density: 'balanced',
    color: 'monochrome',
    blendMode: 'overlay',
    blending: 'overlay',
  },
  analog: {
    type: 'uniform',
    distribution: 'uniform',
    grainSize: 'small',
    intensity: 0.4,
    opacity: 0.55,
    density: 'balanced',
    color: 'monochrome',
    blendMode: 'soft-light',
    blending: 'overlay',
  },
  digital: {
    type: 'monochromatic',
    distribution: 'uniform',
    grainSize: 'fine',
    intensity: 0.55,
    opacity: 0.65,
    density: 'dense',
    color: 'monochrome',
    blendMode: 'overlay',
    blending: 'overlay',
  },
  paper: {
    type: 'gaussian',
    distribution: 'gaussian',
    grainSize: 'medium',
    intensity: 0.32,
    opacity: 0.5,
    density: 'sparse',
    color: 'black',
    blendMode: 'multiply',
    blending: 'overlay',
  },
}

function createImageDataObject(width: number, height: number): ImageData {
  if (typeof ImageData !== 'undefined') {
    return new ImageData(width, height)
  }
  return {
    width,
    height,
    data: new Uint8ClampedArray(width * height * 4),
    colorSpace: 'srgb',
  } as unknown as ImageData
}

/**
 * Generate a raw ImageData object containing procedural noise.
 */
export function generateNoiseImageData(
  noise: NoiseConfig,
  width: number,
  height: number,
): ImageData {
  const imgData = createImageDataObject(width, height)
  const data = imgData.data

  const uniformPRNG = createPRNG(noise.seed)
  const gaussianPRNG = createGaussianPRNG(noise.seed)

  const cellSize = GRAIN_CELL_SIZES[noise.grainSize]
  const densityThreshold = DENSITY_PROBABILITIES[noise.density]
  const isGaussian =
    noise.type === 'gaussian' || noise.distribution === 'gaussian'
  const isColored =
    noise.type === 'colored-rgb' || noise.color === 'colored'

  // Pre-calculate scaled alpha
  const baseAlpha = Math.max(0, Math.min(1, noise.opacity * noise.intensity))

  for (let y = 0; y < height; y += cellSize) {
    for (let x = 0; x < width; x += cellSize) {
      // Density check: skip cell if outside probability
      if (densityThreshold < 1.0 && uniformPRNG() > densityThreshold) {
        continue
      }

      let r = 0
      let g = 0
      let b = 0
      let a = baseAlpha

      if (isColored) {
        // Independent R, G, B channels
        const valR = isGaussian ? gaussianPRNG() : uniformPRNG()
        const valG = isGaussian ? gaussianPRNG() : uniformPRNG()
        const valB = isGaussian ? gaussianPRNG() : uniformPRNG()
        r = Math.round(Math.max(0, Math.min(1, valR)) * 255)
        g = Math.round(Math.max(0, Math.min(1, valG)) * 255)
        b = Math.round(Math.max(0, Math.min(1, valB)) * 255)
      } else {
        // Monochromatic / black / white
        const val = isGaussian ? gaussianPRNG() : uniformPRNG()
        const clampedVal = Math.max(0, Math.min(1, val))

        if (noise.color === 'black') {
          r = 0
          g = 0
          b = 0
          a = baseAlpha * (1 - clampedVal)
        } else if (noise.color === 'white') {
          r = 255
          g = 255
          b = 255
          a = baseAlpha * clampedVal
        } else {
          // Standard monochrome grayscale
          const byteVal = Math.round(clampedVal * 255)
          r = byteVal
          g = byteVal
          b = byteVal
        }
      }

      const alphaByte = Math.round(Math.max(0, Math.min(1, a)) * 255)

      // Stamp the cell (cellSize x cellSize)
      const maxY = Math.min(y + cellSize, height)
      const maxX = Math.min(x + cellSize, width)

      for (let cy = y; cy < maxY; cy++) {
        const rowOffset = cy * width * 4
        for (let cx = x; cx < maxX; cx++) {
          const idx = rowOffset + cx * 4
          data[idx] = r
          data[idx + 1] = g
          data[idx + 2] = b
          data[idx + 3] = alphaByte
        }
      }
    }
  }

  return imgData
}

// In-memory cache for tile data URLs
const dataUrlCache = new Map<string, string>()

/**
 * Generate a seamless/tileable Data-URL for CSS background tiling.
 */
export function generateNoiseDataUrl(
  noise: NoiseConfig,
  tileSize = 128,
): string {
  const cacheKey = `${noise.seed}_${noise.type}_${noise.grainSize}_${noise.density}_${noise.color}_${noise.distribution}_${noise.intensity}_${noise.opacity}_${tileSize}`

  const cached = dataUrlCache.get(cacheKey)
  if (cached) return cached

  // In browser or canvas environment: create canvas and export
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas')
    canvas.width = tileSize
    canvas.height = tileSize
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const imgData = generateNoiseImageData(noise, tileSize, tileSize)
      ctx.putImageData(imgData, 0, 0)
      const url = canvas.toDataURL('image/png')
      dataUrlCache.set(cacheKey, url)
      return url
    }
  }

  return ''
}
