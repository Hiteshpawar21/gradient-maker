// ---------------------------------------------------------------------------
// Grainy Gradient Renderer (Type 15)
// Tier: CSS (with noise overlay)
// Grainy renders a base gradient with the noise effect engine enabled.
// ---------------------------------------------------------------------------

import type { GrainyConfig, Project } from '@/core/types'
import type { GradientRenderer } from '@/engine/registry'
import { getRenderer } from '@/engine/registry'
import { applyNoiseToCanvas } from '@/engine/noise'

export const grainyRenderer: GradientRenderer<GrainyConfig> = {
  type: 'grainy',
  tier: 'css',
  toCSS(cfg: GrainyConfig, project: Project): string | null {
    const baseRenderer = getRenderer(cfg.baseGradient.type)
    if (!baseRenderer?.toCSS) return null
    return baseRenderer.toCSS(cfg.baseGradient, project)
  },
  draw(
    ctx: CanvasRenderingContext2D,
    cfg: GrainyConfig,
    project: Project,
    w: number,
    h: number,
    t?: number,
  ): void {
    const baseRenderer = getRenderer(cfg.baseGradient.type)
    if (baseRenderer) {
      baseRenderer.draw(ctx, cfg.baseGradient, project, w, h, t)
    }
    if (project.effects.noise.enabled) {
      applyNoiseToCanvas(ctx, project.effects.noise, w, h)
    }
  },
}
