import { describe, it, expect } from 'vitest'
import {
  interpolatePair,
  sampleGradientAt,
  sampleGradient,
  getCssInterpolationHint,
} from '@/color/interpolate'
import type { ColorStop } from '@/core/types'

describe('color/interpolate', () => {
  describe('interpolatePair', () => {
    it('interpolates in sRGB (rgb)', () => {
      const mid = interpolatePair('#ff0000', '#0000ff', 'srgb', 0.5)
      expect(mid).toBe('#800080')
    })

    it('interpolates in OKLab without murky gray center', () => {
      const mid = interpolatePair('#ff0000', '#0000ff', 'oklab', 0.5)
      expect(mid).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(mid).not.toBe('#800080')
    })

    it('interpolates in HSL across hue wheel', () => {
      const mid = interpolatePair('#ff0000', '#0000ff', 'hsl', 0.5)
      expect(mid).toMatch(/^#[0-9a-fA-F]{6}$/)
    })

    it('clamps t to 0 and 1 boundaries', () => {
      expect(interpolatePair('#ff0000', '#0000ff', 'srgb', -0.5)).toBe('#ff0000')
      expect(interpolatePair('#ff0000', '#0000ff', 'srgb', 1.5)).toBe('#0000ff')
    })
  })

  describe('sampleGradientAt & sampleGradient', () => {
    const stops: ColorStop[] = [
      { id: '1', color: '#ff0000', position: 0, opacity: 1 },
      { id: '2', color: '#00ff00', position: 50, opacity: 1 },
      { id: '3', color: '#0000ff', position: 100, opacity: 1 },
    ]

    it('returns exact stop colors at their positions', () => {
      expect(sampleGradientAt(stops, 0, 'srgb')).toBe('#ff0000')
      expect(sampleGradientAt(stops, 0.5, 'srgb')).toBe('#00ff00')
      expect(sampleGradientAt(stops, 1, 'srgb')).toBe('#0000ff')
    })

    it('generates N intermediate sampled colors', () => {
      const samples = sampleGradient(stops, 5, 'oklab')
      expect(samples).toHaveLength(5)
      expect(samples[0]).toBe('#ff0000')
      expect(samples[2]).toBe('#00ff00')
      expect(samples[4]).toBe('#0000ff')
    })

    it('handles empty or single stop edge cases', () => {
      expect(sampleGradientAt([], 0.5, 'srgb')).toBe('#000000')
      expect(sampleGradientAt([stops[0]], 0.5, 'srgb')).toBe('#ff0000')
    })
  })

  describe('getCssInterpolationHint', () => {
    it('returns correct CSS interpolation keywords', () => {
      expect(getCssInterpolationHint('oklab')).toBe('in oklab')
      expect(getCssInterpolationHint('hsl')).toBe('in hsl')
      expect(getCssInterpolationHint('srgb-linear')).toBe('in srgb-linear')
      expect(getCssInterpolationHint('srgb')).toBe('in srgb')
    })
  })
})
