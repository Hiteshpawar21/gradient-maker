// ---------------------------------------------------------------------------
// Engine Entry Point: Registry initialization & exports
// Registers types 1–7: Linear, Radial, Conic, Diamond, Repeating Linear,
// Repeating Radial, Repeating Conic.
// ---------------------------------------------------------------------------

import type { Project } from '@/core/types'
import { registerRenderer, getRenderer } from './registry'
import { linearRenderer } from './css/linear'
import { radialRenderer } from './css/radial'
import { conicRenderer } from './css/conic'
import {
  repeatingLinearRenderer,
  repeatingRadialRenderer,
  repeatingConicRenderer,
} from './css/repeating'
import { diamondRenderer } from './canvas/diamond'

// Auto-register renderers 1–7
registerRenderer(linearRenderer)
registerRenderer(radialRenderer)
registerRenderer(conicRenderer)
registerRenderer(diamondRenderer)
registerRenderer(repeatingLinearRenderer)
registerRenderer(repeatingRadialRenderer)
registerRenderer(repeatingConicRenderer)

export * from './registry'
export { linearRenderer, linearToCSS } from './css/linear'
export { radialRenderer, radialToCSS } from './css/radial'
export { conicRenderer, conicToCSS } from './css/conic'
export {
  repeatingLinearRenderer,
  repeatingRadialRenderer,
  repeatingConicRenderer,
  repeatingLinearToCSS,
  repeatingRadialToCSS,
  repeatingConicToCSS,
} from './css/repeating'
export { diamondRenderer } from './canvas/diamond'

/**
 * Get generated CSS string for the project's current gradient.
 * Returns null if the gradient type is not expressible in CSS.
 */
export function getGradientCSS(project: Project): string | null {
  const renderer = getRenderer(project.gradient.type)
  if (!renderer?.toCSS) return null
  return renderer.toCSS(project.gradient, project)
}
