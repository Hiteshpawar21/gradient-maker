// ---------------------------------------------------------------------------
// Layered Gradient Renderer (Type 11)
// Tier: Mixed / CSS multi-background
// Composites multiple independent layers into comma-separated CSS backgrounds
// or Canvas 2D multi-layer stack with positions, sizes, opacities, and blend modes.
// ---------------------------------------------------------------------------

import type { BlendMode, LayeredConfig, Project } from '@/core/types'
import type { GradientRenderer } from '@/engine/registry'
import { getRenderer } from '@/engine/registry'

/**
 * Maps standard CSS BlendMode to Canvas 2D GlobalCompositeOperation.
 */
export function blendModeToComposite(
  mode: BlendMode,
): GlobalCompositeOperation {
  switch (mode) {
    case 'multiply':
    case 'screen':
    case 'overlay':
    case 'darken':
    case 'lighten':
    case 'color-dodge':
    case 'color-burn':
    case 'hard-light':
    case 'soft-light':
    case 'difference':
    case 'exclusion':
    case 'hue':
    case 'saturation':
    case 'color':
    case 'luminosity':
      return mode
    case 'normal':
    default:
      return 'source-over'
  }
}

export interface LayeredCSSProperties {
  backgroundImage: string
  backgroundPosition: string
  backgroundSize: string
  backgroundBlendMode: string
  backgroundRepeat: string
}

/**
 * Generate CSS multi-background properties for a Layered gradient.
 */
export function layeredToCSSProperties(
  cfg: LayeredConfig,
  project?: Project,
): LayeredCSSProperties | null {
  if (cfg.layers.length === 0) return null

  const images: string[] = []
  const positions: string[] = []
  const sizes: string[] = []
  const blendModes: string[] = []

  for (const layer of cfg.layers) {
    const renderer = getRenderer(layer.gradient.type)
    if (!renderer?.toCSS) continue

    const css = renderer.toCSS(
      layer.gradient,
      project ?? ({ global: { interpolation: 'srgb' } } as unknown as Project),
    )
    if (!css) continue

    images.push(css)
    positions.push(`${layer.x}% ${layer.y}%`)
    sizes.push(`${layer.width}% ${layer.height}%`)
    blendModes.push(layer.blendMode)
  }

  if (images.length === 0) return null

  return {
    backgroundImage: images.join(', '),
    backgroundPosition: positions.join(', '),
    backgroundSize: sizes.join(', '),
    backgroundBlendMode: blendModes.join(', '),
    backgroundRepeat: Array(images.length).fill('no-repeat').join(', '),
  }
}

/**
 * Generate CSS string representation for Layered gradient.
 * Returns comma-separated background-image string.
 */
export function layeredToCSS(
  cfg: LayeredConfig,
  project?: Project,
): string | null {
  const props = layeredToCSSProperties(cfg, project)
  return props ? props.backgroundImage : null
}

export const layeredRenderer: GradientRenderer<LayeredConfig> = {
  type: 'layered',
  tier: 'css',
  toCSS(cfg: LayeredConfig, project: Project): string | null {
    return layeredToCSS(cfg, project)
  },
  toSVG(cfg: LayeredConfig, project: Project): string | null {
    // Basic SVG multi-layer representation
    const rects: string[] = []
    for (const [idx, layer] of cfg.layers.entries()) {
      const renderer = getRenderer(layer.gradient.type)
      const gradSvg = renderer?.toSVG ? renderer.toSVG(layer.gradient, project) : null
      if (gradSvg) {
        rects.push(
          `<g opacity="${layer.opacity}" style="mix-blend-mode: ${layer.blendMode}"><rect x="${layer.x}%" y="${layer.y}%" width="${layer.width}%" height="${layer.height}%" fill="url(#grad-${idx})" /></g>`,
        )
      }
    }
    return rects.join('\n')
  },
  draw(
    ctx: CanvasRenderingContext2D,
    cfg: LayeredConfig,
    project: Project,
    w: number,
    h: number,
    t?: number,
  ): void {
    if (cfg.layers.length === 0) return

    // In CSS multi-background, index 0 is top-most.
    // In Canvas 2D painter's model, draw from bottom (index length-1) to top (index 0).
    for (let i = cfg.layers.length - 1; i >= 0; i--) {
      const layer = cfg.layers[i]
      if (layer.opacity <= 0) continue

      const renderer = getRenderer(layer.gradient.type)
      if (!renderer) continue

      ctx.save()
      ctx.globalAlpha = Math.max(0, Math.min(1, layer.opacity))
      ctx.globalCompositeOperation = blendModeToComposite(layer.blendMode)

      const lx = (layer.x / 100) * w
      const ly = (layer.y / 100) * h
      const lw = (layer.width / 100) * w
      const lh = (layer.height / 100) * h

      // Clip to layer bounds if not full canvas
      if (
        layer.width < 100 ||
        layer.height < 100 ||
        layer.x !== 0 ||
        layer.y !== 0
      ) {
        ctx.beginPath()
        ctx.rect(lx, ly, lw, lh)
        ctx.clip()
      }

      ctx.translate(lx, ly)
      renderer.draw(ctx, layer.gradient, project, lw, lh, t)
      ctx.restore()
    }
  },
}
