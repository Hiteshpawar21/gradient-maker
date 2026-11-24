import { describe, it, expect } from 'vitest'
import {
  getRenderer,
  hasRenderer,
  getAllRenderers,
  linearRenderer,
  radialRenderer,
  conicRenderer,
  diamondRenderer,
  repeatingLinearRenderer,
  repeatingRadialRenderer,
  repeatingConicRenderer,
} from '@/engine'

describe('Gradient Engine Registry', () => {
  it('registers all basic types (1–7)', () => {
    expect(hasRenderer('linear')).toBe(true)
    expect(hasRenderer('radial')).toBe(true)
    expect(hasRenderer('conic')).toBe(true)
    expect(hasRenderer('diamond')).toBe(true)
    expect(hasRenderer('repeating-linear')).toBe(true)
    expect(hasRenderer('repeating-radial')).toBe(true)
    expect(hasRenderer('repeating-conic')).toBe(true)
  })

  it('returns the correct renderer instances and tiers', () => {
    expect(getRenderer('linear')).toBe(linearRenderer)
    expect(getRenderer('linear')?.tier).toBe('css')

    expect(getRenderer('radial')).toBe(radialRenderer)
    expect(getRenderer('radial')?.tier).toBe('css')

    expect(getRenderer('conic')).toBe(conicRenderer)
    expect(getRenderer('conic')?.tier).toBe('css')

    expect(getRenderer('diamond')).toBe(diamondRenderer)
    expect(getRenderer('diamond')?.tier).toBe('canvas')

    expect(getRenderer('repeating-linear')).toBe(repeatingLinearRenderer)
    expect(getRenderer('repeating-linear')?.tier).toBe('css')

    expect(getRenderer('repeating-radial')).toBe(repeatingRadialRenderer)
    expect(getRenderer('repeating-radial')?.tier).toBe('css')

    expect(getRenderer('repeating-conic')).toBe(repeatingConicRenderer)
    expect(getRenderer('repeating-conic')?.tier).toBe('css')
  })

  it('getAllRenderers returns at least 7 renderers', () => {
    const all = getAllRenderers()
    expect(all.size).toBeGreaterThanOrEqual(7)
  })
})
