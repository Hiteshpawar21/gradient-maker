import { describe, it, expect, vi } from 'vitest'
import {
  createMirroredStops,
  reflectedToCSS,
  reflectedRenderer,
} from '@/engine/css/reflected'
import type { ReflectedConfig, ColorStop, Project } from '@/core/types'
import { createDefaultProject } from '@/core/defaults'

describe('Reflected Gradient Renderer (Type 12)', () => {
  const sampleStops: ColorStop[] = [
    { id: '1', color: '#ff0000', position: 0, opacity: 1 },
    { id: '2', color: '#0000ff', position: 100, opacity: 1 },
  ]

  describe('createMirroredStops', () => {
    it('creates symmetrical mirrored stops around center 50%', () => {
      const mirrored = createMirroredStops(sampleStops, 50)
      expect(mirrored.length).toBe(4)

      // First stop should be at 0% (#0000ff reflected from 100%)
      expect(mirrored[0].position).toBe(0)
      expect(mirrored[0].color).toBe('#0000ff')

      // Center stops should be at 50% (#ff0000)
      expect(mirrored[1].position).toBe(50)
      expect(mirrored[1].color).toBe('#ff0000')
      expect(mirrored[2].position).toBe(50)
      expect(mirrored[2].color).toBe('#ff0000')

      // Last stop should be at 100% (#0000ff)
      expect(mirrored[3].position).toBe(100)
      expect(mirrored[3].color).toBe('#0000ff')
    })

    it('respects offset mirror center (e.g. 30%)', () => {
      const mirrored = createMirroredStops(sampleStops, 30)
      expect(mirrored[0].position).toBe(0)
      expect(mirrored[1].position).toBe(30)
      expect(mirrored[2].position).toBe(30)
      expect(mirrored[3].position).toBe(100)
    })
  })

  describe('reflectedToCSS', () => {
    it('generates standard linear gradient when symmetry is none', () => {
      const cfg: ReflectedConfig = {
        type: 'reflected',
        stops: sampleStops,
        angle: 45,
        centerX: 50,
        centerY: 50,
        symmetry: 'none',
      }
      const css = reflectedToCSS(cfg)
      expect(css).toBe('linear-gradient(45deg, #ff0000 0%, #0000ff 100%)')
    })

    it('generates mirrored gradient for horizontal symmetry', () => {
      const cfg: ReflectedConfig = {
        type: 'reflected',
        stops: sampleStops,
        angle: 90,
        centerX: 50,
        centerY: 50,
        symmetry: 'horizontal',
      }
      const css = reflectedToCSS(cfg)
      expect(css).toContain('linear-gradient(90deg,')
      expect(css).toContain('#0000ff 0%')
      expect(css).toContain('#ff0000 50%')
      expect(css).toContain('#0000ff 100%')
    })

    it('generates mirrored gradient for vertical symmetry at perpendicular angle', () => {
      const cfg: ReflectedConfig = {
        type: 'reflected',
        stops: sampleStops,
        angle: 0,
        centerX: 50,
        centerY: 50,
        symmetry: 'vertical',
      }
      const css = reflectedToCSS(cfg)
      expect(css).toContain('linear-gradient(90deg,')
    })

    it('generates two layered gradients for both (cross) symmetry', () => {
      const cfg: ReflectedConfig = {
        type: 'reflected',
        stops: sampleStops,
        angle: 0,
        centerX: 50,
        centerY: 50,
        symmetry: 'both',
      }
      const css = reflectedToCSS(cfg)
      const parts = css.split('linear-gradient')
      expect(parts.length).toBe(3) // two linear-gradient instances
    })
  })

  describe('reflectedRenderer', () => {
    it('implements toSVG and draw without throwing', () => {
      const cfg: ReflectedConfig = {
        type: 'reflected',
        stops: sampleStops,
        angle: 45,
        centerX: 50,
        centerY: 50,
        symmetry: 'horizontal',
      }
      const project: Project = { ...createDefaultProject(), gradient: cfg }
      const svg = reflectedRenderer.toSVG?.(cfg, project)
      expect(svg).toContain('<linearGradient')

      const mockCanvas = document.createElement('canvas')
      mockCanvas.width = 100
      mockCanvas.height = 100
      const ctx = mockCanvas.getContext('2d')
      if (ctx) {
        const fillRectSpy = vi.spyOn(ctx, 'fillRect')
        reflectedRenderer.draw(ctx, cfg, project, 100, 100)
        expect(fillRectSpy).toHaveBeenCalled()
      }
    })
  })
})
