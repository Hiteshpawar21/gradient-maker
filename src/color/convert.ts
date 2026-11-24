// ---------------------------------------------------------------------------
// Color conversion, gamut checking, and normalization utilities using culori.
// Math functions only — no React components (Rule 2).
// ---------------------------------------------------------------------------

import {
  formatHex,
  formatRgb,
  formatHsl,
  rgb,
  hsl,
  oklch,
  inGamut,
  clampRgb,
} from 'culori'

export interface RgbColor {
  r: number // 0–255
  g: number // 0–255
  b: number // 0–255
  a: number // 0–1
}

export interface HslColor {
  h: number // 0–360
  s: number // 0–100
  l: number // 0–100
  a: number // 0–1
}

export interface OklchColor {
  l: number // 0–1
  c: number // 0–0.4
  h: number // 0–360
  a: number // 0–1
}

const checkRgbGamut = inGamut('rgb')

/**
 * Check if any color string or parsed color object is within the standard sRGB gamut.
 */
export function isGamutValid(color: string | Parameters<typeof checkRgbGamut>[0]): boolean {
  try {
    const parsed = typeof color === 'string' ? rgb(color) : rgb(color)
    if (!parsed) return true
    return checkRgbGamut(parsed)
  } catch {
    return true
  }
}

/**
 * Safely parse a color string. Returns fallback if input is malformed.
 */
export function safeParseColor(input: string, fallback = '#3b82f6'): string {
  try {
    const parsed = formatHex(input)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

/**
 * Convert any CSS color string to 6-digit or 8-digit HEX.
 */
export function toHex(color: string): string {
  try {
    const hex = formatHex(color)
    return hex ?? '#000000'
  } catch {
    return '#000000'
  }
}

/**
 * Convert any CSS color string to RGBA object (0–255 channels, 0–1 alpha).
 */
export function toRgb(color: string): RgbColor {
  try {
    const parsed = rgb(color)
    if (!parsed) return { r: 0, g: 0, b: 0, a: 1 }
    return {
      r: Math.round(Math.max(0, Math.min(1, parsed.r)) * 255),
      g: Math.round(Math.max(0, Math.min(1, parsed.g)) * 255),
      b: Math.round(Math.max(0, Math.min(1, parsed.b)) * 255),
      a: parsed.alpha ?? 1,
    }
  } catch {
    return { r: 0, g: 0, b: 0, a: 1 }
  }
}

/**
 * Convert any CSS color string to HSLA object (h: 0–360, s: 0–100, l: 0–100, a: 0–1).
 */
export function toHsl(color: string): HslColor {
  try {
    const parsed = hsl(color)
    if (!parsed) return { h: 0, s: 0, l: 0, a: 1 }
    return {
      h: Math.round(parsed.h ?? 0),
      s: Math.round(Math.max(0, Math.min(1, parsed.s)) * 100),
      l: Math.round(Math.max(0, Math.min(1, parsed.l)) * 100),
      a: parsed.alpha ?? 1,
    }
  } catch {
    return { h: 0, s: 0, l: 0, a: 1 }
  }
}

/**
 * Convert any CSS color string to OKLCH object (l: 0–1, c: 0–0.4, h: 0–360, a: 0–1).
 */
export function toOklch(color: string): OklchColor {
  try {
    const parsed = oklch(color)
    if (!parsed) return { l: 0, c: 0, h: 0, a: 1 }
    return {
      l: Number(Math.max(0, Math.min(1, parsed.l)).toFixed(3)),
      c: Number(Math.max(0, parsed.c).toFixed(3)),
      h: Math.round(parsed.h ?? 0),
      a: parsed.alpha ?? 1,
    }
  } catch {
    return { l: 0, c: 0, h: 0, a: 1 }
  }
}

/**
 * Format RGB channel values (0–255, alpha: 0–1) into CSS string.
 */
export function fromRgb(r: number, g: number, b: number, a = 1): string {
  const clampedR = Math.max(0, Math.min(255, Math.round(r)))
  const clampedG = Math.max(0, Math.min(255, Math.round(g)))
  const clampedB = Math.max(0, Math.min(255, Math.round(b)))
  const clampedA = Math.max(0, Math.min(1, a))

  if (clampedA < 1) {
    return `rgba(${clampedR}, ${clampedG}, ${clampedB}, ${Number(clampedA.toFixed(2))})`
  }
  return formatRgb({ mode: 'rgb', r: clampedR / 255, g: clampedG / 255, b: clampedB / 255 })
}

/**
 * Format HSL channel values (h: 0–360, s: 0–100, l: 0–100, alpha: 0–1) into CSS string.
 */
export function fromHsl(h: number, s: number, l: number, a = 1): string {
  const clampedH = ((h % 360) + 360) % 360
  const clampedS = Math.max(0, Math.min(100, s)) / 100
  const clampedL = Math.max(0, Math.min(100, l)) / 100
  const clampedA = Math.max(0, Math.min(1, a))

  return formatHsl({ mode: 'hsl', h: clampedH, s: clampedS, l: clampedL, alpha: clampedA })
}

/**
 * Format OKLCH channel values into standard CSS oklch() string.
 */
export function fromOklch(l: number, c: number, h: number, a = 1): string {
  const clampedL = Math.max(0, Math.min(1, l))
  const clampedC = Math.max(0, c)
  const clampedH = ((h % 360) + 360) % 360
  const clampedA = Math.max(0, Math.min(1, a))

  if (clampedA < 1) {
    return `oklch(${clampedL.toFixed(3)} ${clampedC.toFixed(3)} ${clampedH.toFixed(1)} / ${clampedA.toFixed(2)})`
  }
  return `oklch(${clampedL.toFixed(3)} ${clampedC.toFixed(3)} ${clampedH.toFixed(1)})`
}

/**
 * Clamp an out-of-gamut color into standard sRGB and return its HEX string.
 */
export function clampToRgbHex(color: string | Parameters<typeof clampRgb>[0]): string {
  try {
    const parsed = typeof color === 'string' ? rgb(color) : color
    if (!parsed) return '#000000'
    const clamped = clampRgb(parsed)
    return formatHex(clamped)
  } catch {
    return '#000000'
  }
}
