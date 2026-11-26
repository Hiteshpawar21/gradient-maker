import { describe, it, expect, vi } from 'vitest'
import {
  createPRNG,
  createGaussianPRNG,
  generateNoiseImageData,
  generateNoiseDataUrl,
  TEXTURE_STYLE_PRESETS,
  GRAIN_CELL_SIZES,
  applyNoiseToCanvas,
} from '@/engine/noise'
import { defaultNoiseConfig } from '@/core/defaults'
import type { NoiseConfig } from '@/core/types'

describe('Noise Engine & PRNG (Phase 6)', () => {
  describe('Mulberry32 PRNG determinism', () => {
    it('produces identical sequences for identical seeds', () => {
      const prng1 = createPRNG(42)
      const prng2 = createPRNG(42)

      const seq1 = Array.from({ length: 50 }, () => prng1())
      const seq2 = Array.from({ length: 50 }, () => prng2())

      expect(seq1).toEqual(seq2)
    })

    it('produces different sequences for different seeds', () => {
      const prng1 = createPRNG(42)
      const prng2 = createPRNG(43)

      const val1 = prng1()
      const val2 = prng2()

      expect(val1).not.toBe(val2)
    })

    it('outputs floats strictly within [0, 1)', () => {
      const prng = createPRNG(12345)
      for (let i = 0; i < 200; i++) {
        const val = prng()
        expect(val).toBeGreaterThanOrEqual(0)
        expect(val).toBeLessThan(1)
      }
    })
  })

  describe('Gaussian PRNG (Box-Muller)', () => {
    it('generates values distributed around mean', () => {
      const gPrng = createGaussianPRNG(99, 0.5, 0.15)
      let sum = 0
      const count = 500
      for (let i = 0; i < count; i++) {
        sum += gPrng()
      }
      const avg = sum / count
      expect(avg).toBeGreaterThan(0.4)
      expect(avg).toBeLessThan(0.6)
    })
  })

  describe('ImageData noise generation', () => {
    it('generates ImageData with specified dimensions', () => {
      const noise: NoiseConfig = {
        ...defaultNoiseConfig,
        enabled: true,
        seed: 100,
      }
      const imgData = generateNoiseImageData(noise, 64, 64)
      expect(imgData.width).toBe(64)
      expect(imgData.height).toBe(64)
      expect(imgData.data.length).toBe(64 * 64 * 4)
    })

    it('produces grayscale values for monochromatic noise', () => {
      const noise: NoiseConfig = {
        ...defaultNoiseConfig,
        enabled: true,
        color: 'monochrome',
        type: 'monochromatic',
        density: 'dense',
        seed: 777,
      }
      const imgData = generateNoiseImageData(noise, 16, 16)
      for (let i = 0; i < imgData.data.length; i += 4) {
        const r = imgData.data[i]
        const g = imgData.data[i + 1]
        const b = imgData.data[i + 2]
        expect(r).toBe(g)
        expect(g).toBe(b)
      }
    })

    it('respects grain size cell stepping', () => {
      expect(GRAIN_CELL_SIZES.fine).toBe(1)
      expect(GRAIN_CELL_SIZES.small).toBe(2)
      expect(GRAIN_CELL_SIZES.medium).toBe(4)
      expect(GRAIN_CELL_SIZES.coarse).toBe(8)
    })
  })

  describe('Texture Style Presets', () => {
    it('provides all 4 predefined texture presets', () => {
      expect(TEXTURE_STYLE_PRESETS['film-grain']).toBeDefined()
      expect(TEXTURE_STYLE_PRESETS.analog).toBeDefined()
      expect(TEXTURE_STYLE_PRESETS.digital).toBeDefined()
      expect(TEXTURE_STYLE_PRESETS.paper).toBeDefined()

      expect(TEXTURE_STYLE_PRESETS['film-grain'].grainSize).toBe('fine')
      expect(TEXTURE_STYLE_PRESETS.paper.color).toBe('black')
    })
  })

  describe('Data-URL generation and caching', () => {
    it('generates and caches data-URL for identical noise settings', () => {
      const noise: NoiseConfig = {
        ...defaultNoiseConfig,
        seed: 555,
      }
      const url1 = generateNoiseDataUrl(noise, 32)
      const url2 = generateNoiseDataUrl(noise, 32)
      expect(url1).toBe(url2)
      if (url1.length > 0) {
        expect(url1).toMatch(/^data:image\/png;base64,/)
      }
    })
  })

  describe('Canvas 2D noise compositor', () => {
    it('runs applyNoiseToCanvas without throwing', () => {
      const mockCanvas = document.createElement('canvas')
      mockCanvas.width = 100
      mockCanvas.height = 100
      const ctx = mockCanvas.getContext('2d')

      if (ctx) {
        const saveSpy = vi.spyOn(ctx, 'save')
        const restoreSpy = vi.spyOn(ctx, 'restore')

        applyNoiseToCanvas(
          ctx,
          { ...defaultNoiseConfig, enabled: true },
          100,
          100,
        )

        expect(saveSpy).toHaveBeenCalled()
        expect(restoreSpy).toHaveBeenCalled()
      }
    })
  })
})
