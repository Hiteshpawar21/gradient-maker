import { describe, it, expect } from 'vitest'
import { randomizeProject } from '@/core/randomize'
import { projectSchema } from '@/core/schema'
import { hasStops } from '@/core/types'

describe('Randomize Project & OKLCH Harmonies (Phase 5)', () => {
  it('generates a schema-valid Project object', () => {
    for (let i = 0; i < 10; i++) {
      const proj = randomizeProject()
      const parseResult = projectSchema.safeParse(proj)
      expect(parseResult.success).toBe(true)
    }
  })

  it('generates stops with OKLCH colors and valid positions', () => {
    const proj = randomizeProject()
    if (hasStops(proj.gradient)) {
      expect(proj.gradient.stops.length).toBeGreaterThanOrEqual(2)
      expect(proj.gradient.stops.length).toBeLessThanOrEqual(5)

      for (const stop of proj.gradient.stops) {
        expect(stop.color).toMatch(/^oklch\(/)
        expect(stop.position).toBeGreaterThanOrEqual(0)
        expect(stop.position).toBeLessThanOrEqual(100)
        expect(stop.opacity).toBe(1)
      }
    }
  })

  it('randomizes gradient type within valid basic types', () => {
    const validTypes = ['linear', 'radial', 'conic', 'diamond', 'reflected']
    const proj = randomizeProject()
    expect(validTypes).toContain(proj.gradient.type)
  })
})
