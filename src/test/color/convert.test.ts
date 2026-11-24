import { describe, it, expect } from 'vitest'
import {
  toHex,
  toRgb,
  toHsl,
  toOklch,
  fromRgb,
  fromHsl,
  fromOklch,
  isGamutValid,
  clampToRgbHex,
  safeParseColor,
} from '@/color/convert'

describe('color/convert', () => {
  describe('toHex', () => {
    it('converts common named and hex colors correctly', () => {
      expect(toHex('#ff0000')).toBe('#ff0000')
      expect(toHex('#3b82f6')).toBe('#3b82f6')
    })

    it('falls back to #000000 on invalid color input', () => {
      expect(toHex('invalid-color-123')).toBe('#000000')
    })
  })

  describe('toRgb', () => {
    it('converts hex to RGB channels (0–255)', () => {
      const rgb = toRgb('#ff00aa')
      expect(rgb.r).toBe(255)
      expect(rgb.g).toBe(0)
      expect(rgb.b).toBe(170)
      expect(rgb.a).toBe(1)
    })

    it('falls back on invalid input', () => {
      expect(toRgb('bad-color')).toEqual({ r: 0, g: 0, b: 0, a: 1 })
    })
  })

  describe('toHsl', () => {
    it('converts hex to HSL channels (h: 0–360, s: 0–100, l: 0–100)', () => {
      const hsl = toHsl('#ff0000')
      expect(hsl.h).toBe(0)
      expect(hsl.s).toBe(100)
      expect(hsl.l).toBe(50)
    })

    it('falls back on invalid input', () => {
      expect(toHsl('bad-color')).toEqual({ h: 0, s: 0, l: 0, a: 1 })
    })
  })

  describe('toOklch', () => {
    it('converts hex to OKLCH channels (l: 0–1, c: >= 0, h: 0–360)', () => {
      const oklch = toOklch('#3b82f6')
      expect(oklch.l).toBeGreaterThan(0.5)
      expect(oklch.l).toBeLessThan(0.7)
      expect(oklch.c).toBeGreaterThan(0.15)
      expect(oklch.h).toBeGreaterThan(250)
    })

    it('falls back on invalid input', () => {
      expect(toOklch('bad-color')).toEqual({ l: 0, c: 0, h: 0, a: 1 })
    })
  })

  describe('fromRgb, fromHsl, fromOklch', () => {
    it('formats RGB channels to valid CSS string', () => {
      expect(fromRgb(255, 0, 128)).toBe('rgb(255, 0, 128)')
      expect(fromRgb(255, 0, 128, 0.5)).toContain('rgba(255, 0, 128, 0.5')
    })

    it('formats HSL channels to valid CSS string', () => {
      expect(fromHsl(180, 50, 50)).toBe('hsl(180, 50%, 50%)')
    })

    it('formats OKLCH channels to valid CSS oklch() string', () => {
      const formatted = fromOklch(0.65, 0.25, 140)
      expect(formatted).toMatch(/^oklch\(0\.650 0\.250 140\.0\)$/)
    })
  })

  describe('isGamutValid & clampToRgbHex', () => {
    it('identifies standard sRGB colors as valid in gamut', () => {
      expect(isGamutValid('#3b82f6')).toBe(true)
      expect(isGamutValid('#ffffff')).toBe(true)
      expect(isGamutValid('#000000')).toBe(true)
    })

    it('detects high-chroma OKLCH colors outside sRGB gamut', () => {
      // Extremely high chroma at medium lightness cannot exist in sRGB
      const wideGamutColor = 'oklch(0.8 0.35 140)'
      expect(isGamutValid(wideGamutColor)).toBe(false)
    })

    it('clamps out-of-gamut color into valid sRGB hex', () => {
      const wideGamutColor = 'oklch(0.8 0.35 140)'
      const clampedHex = clampToRgbHex(wideGamutColor)
      expect(clampedHex).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(isGamutValid(clampedHex)).toBe(true)
    })
  })

  describe('safeParseColor', () => {
    it('returns normalized hex for valid color', () => {
      expect(safeParseColor('red')).toBe('#ff0000')
      expect(safeParseColor('#123')).toBe('#112233')
    })

    it('returns fallback for invalid string', () => {
      expect(safeParseColor('not-a-color', '#abcdef')).toBe('#abcdef')
    })
  })
})
