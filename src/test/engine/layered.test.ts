import { describe, it, expect, vi } from 'vitest'
import '@/engine'
import {
  blendModeToComposite,
  layeredToCSSProperties,
  layeredToCSS,
  layeredRenderer,
} from '@/engine/css/layered'
import type { LayeredConfig, Project } from '@/core/types'
import { createDefaultProject } from '@/core/defaults'

describe('Layered Gradient Renderer (Type 11)', () => {
  const sampleLayeredConfig: LayeredConfig = {
    type: 'layered',
    layers: [
      {
        id: 'layer-1',
        gradient: {
          type: 'linear',
          angle: 45,
          stops: [
            { id: 's1', color: '#ff0000', position: 0, opacity: 1 },
            { id: 's2', color: '#0000ff', position: 100, opacity: 1 },
          ],
        },
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        opacity: 1,
        blendMode: 'normal',
      },
      {
        id: 'layer-2',
        gradient: {
          type: 'radial',
          centerX: 50,
          centerY: 50,
          shape: 'circle',
          size: 'farthest-corner',
          stops: [
            { id: 's3', color: '#00ff00', position: 0, opacity: 1 },
            { id: 's4', color: '#ffff00', position: 100, opacity: 1 },
          ],
        },
        x: 10,
        y: 20,
        width: 80,
        height: 80,
        opacity: 0.7,
        blendMode: 'screen',
      },
    ],
  }

  describe('blendModeToComposite', () => {
    it('maps blend modes to canvas composites correctly', () => {
      expect(blendModeToComposite('normal')).toBe('source-over')
      expect(blendModeToComposite('screen')).toBe('screen')
      expect(blendModeToComposite('multiply')).toBe('multiply')
      expect(blendModeToComposite('overlay')).toBe('overlay')
    })
  })

  describe('layeredToCSSProperties & layeredToCSS', () => {
    it('produces comma-separated multi-background properties', () => {
      const defaultProject = createDefaultProject()
      const props = layeredToCSSProperties(sampleLayeredConfig, defaultProject)
      expect(props).not.toBeNull()
      if (props) {
        expect(props.backgroundImage).toContain('linear-gradient(45deg,')
        expect(props.backgroundImage).toContain('radial-gradient(circle farthest-corner')
        expect(props.backgroundPosition).toBe('0% 0%, 10% 20%')
        expect(props.backgroundSize).toBe('100% 100%, 80% 80%')
        expect(props.backgroundBlendMode).toBe('normal, screen')
      }

      const css = layeredToCSS(sampleLayeredConfig, defaultProject)
      expect(css).toContain('linear-gradient(45deg,')
      expect(css).toContain('radial-gradient(circle farthest-corner')
    })

    it('returns null for empty layers array', () => {
      const defaultProject = createDefaultProject()
      const emptyConfig: LayeredConfig = { type: 'layered', layers: [] }
      expect(layeredToCSSProperties(emptyConfig, defaultProject)).toBeNull()
      expect(layeredToCSS(emptyConfig, defaultProject)).toBeNull()
    })
  })

  describe('layeredRenderer', () => {
    it('draws layers in painter order without throwing', () => {
      const defaultProject = createDefaultProject()
      const project: Project = { ...defaultProject, gradient: sampleLayeredConfig }
      const mockCanvas = document.createElement('canvas')
      mockCanvas.width = 100
      mockCanvas.height = 100
      const ctx = mockCanvas.getContext('2d')
      if (ctx) {
        const saveSpy = vi.spyOn(ctx, 'save')
        const restoreSpy = vi.spyOn(ctx, 'restore')
        layeredRenderer.draw(ctx, sampleLayeredConfig, project, 100, 100)
        expect(saveSpy).toHaveBeenCalledTimes(2)
        expect(restoreSpy).toHaveBeenCalledTimes(2)
      }
    })
  })
})
