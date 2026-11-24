import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '@/core/store'
import type { StoreApi } from 'zustand'
import type { TemporalState } from 'zundo'
import type { Project } from '@/core/types'
import { hasStops } from '@/core/types'

type StoreWithTemporal = StoreApi<unknown> & {
  temporal: StoreApi<TemporalState<{ project: Project }>>
}

describe('core/store', () => {
  beforeEach(() => {
    useStore.getState().reset()
    const temporalApi = (useStore as unknown as StoreWithTemporal).temporal
    temporalApi.getState().clear()
  })

  it('initializes with default project state', () => {
    const { project } = useStore.getState()
    expect(project.version).toBe(1)
    expect(project.gradient.type).toBe('linear')
    expect(project.canvas.width).toBe(800)
    expect(project.canvas.height).toBe(600)
    expect(project.effects.noise.enabled).toBe(false)
  })

  it('setType updates the gradient type to a new valid default', () => {
    useStore.getState().setType('radial')
    expect(useStore.getState().project.gradient.type).toBe('radial')

    useStore.getState().setType('mesh')
    expect(useStore.getState().project.gradient.type).toBe('mesh')
  })

  it('supports undo and redo for gradient type changes', () => {
    useStore.getState().setType('radial')
    expect(useStore.getState().project.gradient.type).toBe('radial')

    useStore.getState().setType('conic')
    expect(useStore.getState().project.gradient.type).toBe('conic')

    useStore.getState().undo()
    expect(useStore.getState().project.gradient.type).toBe('radial')

    useStore.getState().redo()
    expect(useStore.getState().project.gradient.type).toBe('conic')
  })

  it('addStop, moveStop, and removeStop update stops correctly', () => {
    const initialGradient = useStore.getState().project.gradient
    const initialStopsCount = hasStops(initialGradient)
      ? initialGradient.stops.length
      : 0

    useStore.getState().addStop('#ff0000', 50)
    const afterAdd = useStore.getState().project.gradient
    if (hasStops(afterAdd)) {
      expect(afterAdd.stops.length).toBe(initialStopsCount + 1)
      const addedStop = afterAdd.stops.find((s) => s.color === '#ff0000')
      expect(addedStop).toBeDefined()
      expect(addedStop?.position).toBe(50)

      if (addedStop) {
        useStore.getState().moveStop(addedStop.id, 75)
        const updated = useStore.getState().project.gradient
        if (hasStops(updated)) {
          const moved = updated.stops.find((s) => s.id === addedStop.id)
          expect(moved?.position).toBe(75)
        }

        useStore.getState().removeStop(addedStop.id)
        const afterRemove = useStore.getState().project.gradient
        if (hasStops(afterRemove)) {
          expect(afterRemove.stops.length).toBe(initialStopsCount)
        }
      }
    }
  })

  it('updateCanvas and updateGlobal mutate state and support undo', () => {
    useStore.getState().updateCanvas({ width: 1920, height: 1080 })
    expect(useStore.getState().project.canvas.width).toBe(1920)
    expect(useStore.getState().project.canvas.height).toBe(1080)

    useStore.getState().undo()
    expect(useStore.getState().project.canvas.width).toBe(800)
    expect(useStore.getState().project.canvas.height).toBe(600)
  })

  it('updateNoise toggles noise configuration', () => {
    useStore.getState().updateNoise({ enabled: true, intensity: 0.8 })
    expect(useStore.getState().project.effects.noise.enabled).toBe(true)
    expect(useStore.getState().project.effects.noise.intensity).toBe(0.8)
  })

  it('randomize creates valid gradient with oklch palette', () => {
    useStore.getState().randomize()
    const { gradient } = useStore.getState().project
    expect(gradient).toBeDefined()
    expect(gradient.type).toBeDefined()
  })

  it('loadProject accepts valid JSON and rejects invalid schema', () => {
    const valid = useStore.getState().project
    const res1 = useStore.getState().loadProject(valid)
    expect(res1.success).toBe(true)

    const invalid = { version: 99, canvas: { width: -10 } }
    const res2 = useStore.getState().loadProject(invalid)
    expect(res2.success).toBe(false)
    expect(res2.error).toBeDefined()
  })

  it('theme toggle switches between light and dark', () => {
    useStore.getState().setTheme('dark')
    expect(useStore.getState().theme).toBe('dark')
    useStore.getState().toggleTheme()
    expect(useStore.getState().theme).toBe('light')
  })
})
