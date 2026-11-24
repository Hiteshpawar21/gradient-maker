import { describe, it, expect, vi } from 'vitest'
import { diamondRenderer } from '@/engine/canvas/diamond'
import type { DiamondConfig } from '@/core/types'
import { createDefaultProject } from '@/core/defaults'

describe('Type 4: Diamond Renderer', () => {
  const cfg: DiamondConfig = {
    type: 'diamond',
    centerX: 50,
    centerY: 50,
    width: 80,
    height: 80,
    rotation: 0,
    falloff: 1,
    stops: [
      { id: '1', color: '#ff0000', position: 0, opacity: 1 },
      { id: '2', color: '#0000ff', position: 100, opacity: 1 },
    ],
  }

  it('has tier canvas and toCSS returns null', () => {
    expect(diamondRenderer.tier).toBe('canvas')
    expect(diamondRenderer.toCSS?.(cfg, createDefaultProject())).toBeNull()
  })

  it('draws per-pixel diamond gradient onto canvas', () => {
    const width = 20
    const height = 20
    const pixelBuffer = new Uint8ClampedArray(width * height * 4)

    const createImageDataMock = vi.fn((w: number, h: number) => ({
      width: w,
      height: h,
      data: pixelBuffer,
    }))
    const putImageDataMock = vi.fn()

    const mockCtx = {
      createImageData: createImageDataMock,
      putImageData: putImageDataMock,
    } as unknown as CanvasRenderingContext2D

    diamondRenderer.draw(mockCtx, cfg, createDefaultProject(), width, height)

    expect(createImageDataMock).toHaveBeenCalledWith(width, height)
    expect(putImageDataMock).toHaveBeenCalled()

    // Center pixel (10, 10) should be close to first stop (red: high R, low B)
    const centerIdx = (10 * width + 10) * 4
    const r = pixelBuffer[centerIdx]
    const b = pixelBuffer[centerIdx + 2]
    expect(r).toBeGreaterThan(b)
  })
})
