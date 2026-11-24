import { describe, it, expect } from 'vitest'
import {
  sortStops,
  findStopById,
  addStopAt,
  removeStopById,
  moveStopTo,
  updateStopColor,
  updateStopOpacity,
  distributeStopsEqually,
  reverseStops,
} from '@/color/stops'
import type { ColorStop } from '@/core/types'

describe('color/stops', () => {
  const sampleStops: ColorStop[] = [
    { id: 'b', color: '#00ff00', position: 80, opacity: 1 },
    { id: 'a', color: '#ff0000', position: 20, opacity: 1 },
    { id: 'c', color: '#0000ff', position: 50, opacity: 0.8 },
  ]

  it('sortStops sorts stops by position ascending', () => {
    const sorted = sortStops(sampleStops)
    expect(sorted.map((s) => s.id)).toEqual(['a', 'c', 'b'])
    expect(sorted.map((s) => s.position)).toEqual([20, 50, 80])
  })

  it('findStopById finds stop by unique ID', () => {
    const found = findStopById(sampleStops, 'c')
    expect(found).toBeDefined()
    expect(found?.color).toBe('#0000ff')
    expect(findStopById(sampleStops, 'missing')).toBeUndefined()
  })

  it('addStopAt adds stop at specified position and maintains sorted order', () => {
    const added = addStopAt(sampleStops, 65, '#ffff00')
    expect(added).toHaveLength(4)
    const newStop = added.find((s) => s.position === 65)
    expect(newStop).toBeDefined()
    expect(newStop?.color).toBe('#ffff00')
  })

  it('removeStopById enforces minimum of 2 stops', () => {
    const twoStops: ColorStop[] = [
      { id: '1', color: '#ff0000', position: 0, opacity: 1 },
      { id: '2', color: '#0000ff', position: 100, opacity: 1 },
    ]

    // Cannot remove when only 2 stops remain
    expect(removeStopById(twoStops, '1')).toHaveLength(2)

    // Can remove when > 2 stops
    const removed = removeStopById(sampleStops, 'c')
    expect(removed).toHaveLength(2)
    expect(removed.find((s) => s.id === 'c')).toBeUndefined()
  })

  it('moveStopTo clamps position between 0 and 100', () => {
    const moved = moveStopTo(sampleStops, 'a', -10)
    expect(findStopById(moved, 'a')?.position).toBe(0)

    const movedOver = moveStopTo(sampleStops, 'a', 150)
    expect(findStopById(movedOver, 'a')?.position).toBe(100)
  })

  it('updateStopColor and updateStopOpacity update target stop properties', () => {
    const updatedColor = updateStopColor(sampleStops, 'a', '#123456')
    expect(findStopById(updatedColor, 'a')?.color).toBe('#123456')

    const updatedOpacity = updateStopOpacity(sampleStops, 'a', 0.45)
    expect(findStopById(updatedOpacity, 'a')?.opacity).toBe(0.45)
  })

  it('distributeStopsEqually spaces stops evenly between 0 and 100', () => {
    const distributed = distributeStopsEqually(sampleStops)
    expect(distributed).toHaveLength(3)
    expect(distributed[0].position).toBe(0)
    expect(distributed[1].position).toBe(50)
    expect(distributed[2].position).toBe(100)
  })

  it('reverseStops flips the color and opacity order', () => {
    const sorted = sortStops(sampleStops)
    const reversed = reverseStops(sorted)

    expect(reversed[0].color).toBe(sorted[2].color)
    expect(reversed[1].color).toBe(sorted[1].color)
    expect(reversed[2].color).toBe(sorted[0].color)
  })
})
