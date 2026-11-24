import { describe, it, expect, vi } from 'vitest'
import {
  linearToCSS,
  radialToCSS,
  conicToCSS,
  repeatingLinearToCSS,
  repeatingRadialToCSS,
  repeatingConicToCSS,
  linearRenderer,
  radialRenderer,
  conicRenderer,
} from '@/engine'
import type {
  LinearConfig,
  RadialConfig,
  ConicConfig,
  RepeatingLinearConfig,
  RepeatingRadialConfig,
  RepeatingConicConfig,
  Project,
} from '@/core/types'
import { createDefaultProject } from '@/core/defaults'

describe('CSS Gradient Generators (Types 1–7)', () => {
  const dummyStops = [
    { id: '1', color: '#ff0000', position: 0, opacity: 1 },
    { id: '2', color: '#0000ff', position: 100, opacity: 1 },
  ]

  describe('Type 1: Linear', () => {
    it('generates standard linear-gradient', () => {
      const cfg: LinearConfig = {
        type: 'linear',
        angle: 90,
        stops: dummyStops,
      }
      const css = linearToCSS(cfg)
      expect(css).toBe('linear-gradient(90deg, #ff0000 0%, #0000ff 100%)')
    })

    it('includes color space interpolation prefix if not srgb', () => {
      const cfg: LinearConfig = {
        type: 'linear',
        angle: 45,
        stops: dummyStops,
      }
      const project: Project = createDefaultProject()
      project.global.interpolation = 'oklab'
      const css = linearToCSS(cfg, project)
      expect(css).toBe('linear-gradient(in oklab 45deg, #ff0000 0%, #0000ff 100%)')
    })

    it('formats stop opacity if less than 1', () => {
      const cfg: LinearConfig = {
        type: 'linear',
        angle: 0,
        stops: [
          { id: '1', color: '#ff0000', position: 0, opacity: 0.5 },
          { id: '2', color: '#0000ff', position: 100, opacity: 1 },
        ],
      }
      const css = linearToCSS(cfg)
      expect(css).toContain('rgba(255, 0, 0, 0.5) 0%')
    })

    it('draws to canvas context without throwing', () => {
      const createLinearGradientMock = vi.fn(() => ({
        addColorStop: vi.fn(),
      }))
      const fillRectMock = vi.fn()

      const ctx = {
        createLinearGradient: createLinearGradientMock,
        fillRect: fillRectMock,
        fillStyle: '',
      } as unknown as CanvasRenderingContext2D

      const cfg: LinearConfig = {
        type: 'linear',
        angle: 90,
        stops: dummyStops,
      }
      linearRenderer.draw(ctx, cfg, createDefaultProject(), 400, 300)
      expect(createLinearGradientMock).toHaveBeenCalled()
      expect(fillRectMock).toHaveBeenCalledWith(0, 0, 400, 300)
    })
  })

  describe('Type 2: Radial', () => {
    it('generates standard radial-gradient', () => {
      const cfg: RadialConfig = {
        type: 'radial',
        shape: 'circle',
        size: 'closest-side',
        centerX: 50,
        centerY: 50,
        stops: dummyStops,
      }
      const css = radialToCSS(cfg)
      expect(css).toBe('radial-gradient(circle closest-side at 50% 50%, #ff0000 0%, #0000ff 100%)')
    })

    it('draws to canvas context without throwing', () => {
      const createRadialGradientMock = vi.fn(() => ({
        addColorStop: vi.fn(),
      }))
      const fillRectMock = vi.fn()

      const ctx = {
        createRadialGradient: createRadialGradientMock,
        fillRect: fillRectMock,
        fillStyle: '',
      } as unknown as CanvasRenderingContext2D

      const cfg: RadialConfig = {
        type: 'radial',
        shape: 'circle',
        size: 'farthest-corner',
        centerX: 50,
        centerY: 50,
        stops: dummyStops,
      }
      radialRenderer.draw(ctx, cfg, createDefaultProject(), 400, 300)
      expect(createRadialGradientMock).toHaveBeenCalled()
      expect(fillRectMock).toHaveBeenCalledWith(0, 0, 400, 300)
    })
  })

  describe('Type 3: Conic', () => {
    it('generates standard conic-gradient', () => {
      const cfg: ConicConfig = {
        type: 'conic',
        centerX: 40,
        centerY: 60,
        startAngle: 120,
        stops: dummyStops,
      }
      const css = conicToCSS(cfg)
      expect(css).toBe('conic-gradient(from 120deg at 40% 60%, #ff0000 0%, #0000ff 100%)')
    })

    it('draws to canvas context if createConicGradient exists', () => {
      const createConicGradientMock = vi.fn(() => ({
        addColorStop: vi.fn(),
      }))

      const ctx = {
        createConicGradient: createConicGradientMock,
        fillRect: vi.fn(),
        fillStyle: '',
      } as unknown as CanvasRenderingContext2D

      const cfg: ConicConfig = {
        type: 'conic',
        centerX: 50,
        centerY: 50,
        startAngle: 0,
        stops: dummyStops,
      }
      conicRenderer.draw(ctx, cfg, createDefaultProject(), 400, 300)
      expect(createConicGradientMock).toHaveBeenCalled()
    })
  })

  describe('Repeating Gradients (Types 5, 6, 7)', () => {
    it('repeating-linear uses stripeWidth and repeatInterval', () => {
      const cfg: RepeatingLinearConfig = {
        type: 'repeating-linear',
        angle: 45,
        stripeWidth: 20,
        repeatInterval: 40,
        stops: dummyStops,
      }
      const css = repeatingLinearToCSS(cfg)
      expect(css).toContain('repeating-linear-gradient(45deg,')
      expect(css).toContain('0px')
      expect(css).toContain('20px')
      expect(css).toContain('40px')
    })

    it('repeating-radial generates repeating-radial-gradient', () => {
      const cfg: RepeatingRadialConfig = {
        type: 'repeating-radial',
        shape: 'circle',
        centerX: 50,
        centerY: 50,
        ringSize: 25,
        repeatInterval: 50,
        stops: dummyStops,
      }
      const css = repeatingRadialToCSS(cfg)
      expect(css).toContain('repeating-radial-gradient(circle at 50% 50%,')
      expect(css).toContain('25px')
      expect(css).toContain('50px')
    })

    it('repeating-conic maps stops to segmentSize in degrees', () => {
      const cfg: RepeatingConicConfig = {
        type: 'repeating-conic',
        centerX: 50,
        centerY: 50,
        startAngle: 0,
        segmentSize: 90,
        stops: dummyStops,
      }
      const css = repeatingConicToCSS(cfg)
      expect(css).toBe('repeating-conic-gradient(from 0deg at 50% 50%, #ff0000 0deg, #0000ff 90deg)')
    })
  })
})
