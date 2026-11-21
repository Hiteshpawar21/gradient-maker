import { describe, it, expect } from 'vitest'
import { cn, clamp, lerp } from '../lib/utils'

describe('lib/utils', () => {
  describe('cn', () => {
    it('joins class names', () => {
      expect(cn('a', 'b', 'c')).toBe('a b c')
    })
    it('filters falsy values', () => {
      expect(cn('a', false, undefined, null, 'b')).toBe('a b')
    })
  })

  describe('clamp', () => {
    it('returns value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
    })
    it('clamps to min', () => {
      expect(clamp(-5, 0, 10)).toBe(0)
    })
    it('clamps to max', () => {
      expect(clamp(15, 0, 10)).toBe(10)
    })
  })

  describe('lerp', () => {
    it('returns a at t=0', () => {
      expect(lerp(0, 100, 0)).toBe(0)
    })
    it('returns b at t=1', () => {
      expect(lerp(0, 100, 1)).toBe(100)
    })
    it('returns midpoint at t=0.5', () => {
      expect(lerp(0, 100, 0.5)).toBe(50)
    })
  })
})
