// ---------------------------------------------------------------------------
// Pure color stop manipulation functions.
// Math and data transformation only — no React components (Rule 2).
// ---------------------------------------------------------------------------

import type { ColorStop } from '@/core/types'
import { generateId } from '@/lib/utils'

/**
 * Sort stops by position ascending (0–100).
 */
export function sortStops(stops: ColorStop[]): ColorStop[] {
  return [...stops].sort((a, b) => a.position - b.position)
}

/**
 * Find stop by its unique identifier.
 */
export function findStopById(
  stops: ColorStop[],
  id: string,
): ColorStop | undefined {
  return stops.find((s) => s.id === id)
}

/**
 * Add a new stop at a position (defaulting to midpoint or 50) with optional color.
 */
export function addStopAt(
  stops: ColorStop[],
  position?: number,
  color = '#ffffff',
): ColorStop[] {
  const sorted = sortStops(stops)

  let targetPos: number
  if (position !== undefined) {
    targetPos = Math.max(0, Math.min(100, Math.round(position)))
  } else if (sorted.length >= 2) {
    // Insert between the last two stops or in the largest gap
    let maxGap = 0
    let bestPos = 50
    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = sorted[i + 1].position - sorted[i].position
      if (gap > maxGap) {
        maxGap = gap
        bestPos = Math.round(sorted[i].position + gap / 2)
      }
    }
    targetPos = bestPos
  } else if (sorted.length === 1) {
    targetPos = sorted[0].position < 50 ? 100 : 0
  } else {
    targetPos = 50
  }

  const newStop: ColorStop = {
    id: generateId(),
    color,
    position: targetPos,
    opacity: 1,
  }

  return sortStops([...stops, newStop])
}

/**
 * Remove a stop by ID. Enforces minimum of 2 stops in the gradient.
 */
export function removeStopById(stops: ColorStop[], id: string): ColorStop[] {
  if (stops.length <= 2) {
    return stops // Enforce minimum 2 stops
  }
  return stops.filter((s) => s.id !== id)
}

/**
 * Move a stop to a new position (clamped between 0 and 100).
 */
export function moveStopTo(
  stops: ColorStop[],
  id: string,
  position: number,
): ColorStop[] {
  const clamped = Math.max(0, Math.min(100, Math.round(position)))
  const updated = stops.map((s) => (s.id === id ? { ...s, position: clamped } : s))
  return sortStops(updated)
}

/**
 * Update color for a stop by ID.
 */
export function updateStopColor(
  stops: ColorStop[],
  id: string,
  color: string,
): ColorStop[] {
  return stops.map((s) => (s.id === id ? { ...s, color } : s))
}

/**
 * Update opacity for a stop by ID (clamped between 0 and 1).
 */
export function updateStopOpacity(
  stops: ColorStop[],
  id: string,
  opacity: number,
): ColorStop[] {
  const clamped = Math.max(0, Math.min(1, opacity))
  return stops.map((s) => (s.id === id ? { ...s, opacity: clamped } : s))
}

/**
 * Distribute stops evenly between 0% and 100%.
 */
export function distributeStopsEqually(stops: ColorStop[]): ColorStop[] {
  if (stops.length <= 1) return stops
  const sorted = sortStops(stops)
  const step = 100 / (sorted.length - 1)

  return sorted.map((s, index) => ({
    ...s,
    position: Math.round(index * step),
  }))
}

/**
 * Reverse the order of stops while preserving positions.
 */
export function reverseStops(stops: ColorStop[]): ColorStop[] {
  const sorted = sortStops(stops)
  const colors = sorted.map((s) => s.color).reverse()
  const opacities = sorted.map((s) => s.opacity).reverse()

  return sorted.map((s, index) => ({
    ...s,
    color: colors[index],
    opacity: opacities[index],
  }))
}
