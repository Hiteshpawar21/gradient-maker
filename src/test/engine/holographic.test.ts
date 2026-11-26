import { describe, it, expect } from 'vitest'
import {
  generateSpectralStops,
  holographicToCSS,
  holographicRenderer,
} from '@/engine/css/holographic'
import type { HolographicConfig, Project } from '@/core/types'
import { createDefaultProject } from '@/core/defaults'

describe('Holographic Gradient Renderer (Type 14)', () => {
  describe('generateSpectralStops', () => {
    it('generates rainbow stops spanning hue range', () => {
      const stops = generateSpectralStops([180, 360], 5)
      expect(stops.length).toBe(5)
      expect(stops[0].position).toBe(0)
      expect(stops[0].color).toContain('hsl(180')
      expect(stops[4].position).toBe(100)
      expect(stops[4].color).toContain('hsl(360')
    })
  })

  describe('holographicToCSS', () => {
    it('generates multi-background CSS with specular glint and conic spectral layer', () => {
      const cfg: HolographicConfig = {
        type: 'holographic',
        stops: [
          { id: '1', color: '#ff00ff', position: 0, opacity: 1 },
          { id: '2', color: '#00ffff', position: 100, opacity: 1 },
        ],
        hueRange: [180, 360],
        angle: 45,
        blendMode: 'screen',
        highlightIntensity: 0.8,
      }
      const css = holographicToCSS(cfg)

      // Contains specular highlight
      expect(css).toContain('linear-gradient(45deg,')
      expect(css).toContain('rgba(255, 255, 255, 0.8)')

      // Contains conic gradient
      expect(css).toContain('conic-gradient(from 45deg at 50% 50%,')

      // Contains sheen linear gradient
      expect(css).toContain('linear-gradient(105deg,')
    })
  })

  describe('holographicRenderer', () => {
    it('implements toSVG and draw without throwing', () => {
      const cfg: HolographicConfig = {
        type: 'holographic',
        stops: [
          { id: '1', color: '#ff00ff', position: 0, opacity: 1 },
          { id: '2', color: '#00ffff', position: 100, opacity: 1 },
        ],
        hueRange: [180, 360],
        angle: 45,
        blendMode: 'screen',
        highlightIntensity: 0.8,
      }
      const project: Project = { ...createDefaultProject(), gradient: cfg }
      const svg = holographicRenderer.toSVG?.(cfg, project)
      expect(svg).toContain('<linearGradient')

      const mockCanvas = document.createElement('canvas')
      mockCanvas.width = 100
      mockCanvas.height = 100
      const ctx = mockCanvas.getContext('2d')
      if (ctx) {
        expect(() => {
          holographicRenderer.draw(ctx, cfg, project, 100, 100)
        }).not.toThrow()
      }
    })
  })
})
