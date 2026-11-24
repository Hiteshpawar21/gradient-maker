// ---------------------------------------------------------------------------
// Gradient Renderer Registry
// Maps GradientType -> GradientRenderer implementation.
// Pure registry — no React dependencies. Zero any types.
// ---------------------------------------------------------------------------

import type { GradientConfig, GradientType, Project } from '@/core/types'

export interface GradientRenderer<T extends GradientConfig = GradientConfig> {
  type: T['type']
  tier: 'css' | 'canvas' | 'webgl'
  toCSS?(cfg: T, project: Project): string | null
  toSVG?(cfg: T, project: Project): string | null
  draw(
    ctx: CanvasRenderingContext2D,
    cfg: T,
    project: Project,
    w: number,
    h: number,
    t?: number,
  ): void
}

// Global registry of all gradient renderers
const registry = new Map<GradientType, GradientRenderer>()

/**
 * Register a gradient renderer.
 */
export function registerRenderer<T extends GradientConfig>(
  renderer: GradientRenderer<T>,
): void {
  registry.set(renderer.type, renderer)
}

/**
 * Get a gradient renderer by type.
 */
export function getRenderer<T extends GradientConfig = GradientConfig>(
  type: T['type'],
): GradientRenderer<T> | undefined {
  return registry.get(type) as GradientRenderer<T> | undefined
}

/**
 * Check if a renderer is registered for a given type.
 */
export function hasRenderer(type: GradientType): boolean {
  return registry.has(type)
}

/**
 * Get all registered renderers.
 */
export function getAllRenderers(): Map<GradientType, GradientRenderer> {
  return new Map(registry)
}
