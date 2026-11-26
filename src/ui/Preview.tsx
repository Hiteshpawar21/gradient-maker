// ---------------------------------------------------------------------------
// Preview Component
// Renders live preview: CSS background for CSS tier, Canvas 2D for Canvas tier.
// Reflects global settings and procedural noise & texture effects.
// Shows read-only generated CSS in a box with copy button.
// ---------------------------------------------------------------------------

import { useMemo, useRef, useEffect } from 'react'
import { useStore } from '@/core/store'
import { getRenderer, layeredToCSSProperties } from '@/engine'
import { generateNoiseDataUrl, applyNoiseToCanvas } from '@/engine/noise'
import { CssOutputBox } from './CssOutputBox'
import { Maximize2 } from 'lucide-react'

export default function Preview() {
  const { project } = useStore()
  const { canvas, gradient, global, effects } = project
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Get renderer from engine registry
  const renderer = useMemo(() => getRenderer(gradient.type), [gradient.type])

  // Generated CSS rule string (null for non-CSS tiers like Diamond)
  const cssString = useMemo(() => {
    if (renderer?.toCSS) {
      return renderer.toCSS(gradient, project)
    }
    return null
  }, [renderer, gradient, project])

  // Canvas drawing for Canvas-tier renderers (e.g. Diamond)
  useEffect(() => {
    if (renderer?.tier === 'canvas' && canvasRef.current) {
      const cvs = canvasRef.current
      try {
        const ctx = cvs.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, cvs.width, cvs.height)

          // Underlay noise drawn before gradient
          if (effects.noise.enabled && effects.noise.blending === 'underlay') {
            applyNoiseToCanvas(ctx, effects.noise, cvs.width, cvs.height)
          }

          renderer.draw(ctx, gradient, project, cvs.width, cvs.height)

          // Overlay/embedded noise drawn after gradient
          if (effects.noise.enabled && effects.noise.blending !== 'underlay') {
            applyNoiseToCanvas(ctx, effects.noise, cvs.width, cvs.height)
          }
        }
      } catch {
        // Fallback for headless environments without full Canvas 2D implementation
      }
    }
  }, [renderer, gradient, project, effects.noise])

  const aspectRatio = canvas.width / canvas.height

  // Compute CSS filter string combining blur and glow drop-shadow
  const computedFilter = useMemo(() => {
    const filters: string[] = []
    if (global.blur > 0) {
      filters.push(`blur(${global.blur}px)`)
    }
    if (global.glow.amount > 0) {
      filters.push(`drop-shadow(0 0 ${global.glow.amount}px ${global.glow.color})`)
    }
    return filters.length > 0 ? filters.join(' ') : undefined
  }, [global.blur, global.glow.amount, global.glow.color])

  // Compute CSS transform string for global rotation and offset
  const computedTransform = useMemo(() => {
    const parts: string[] = []
    if (global.offsetX !== 0 || global.offsetY !== 0) {
      parts.push(`translate(${global.offsetX}px, ${global.offsetY}px)`)
    }
    if (global.rotation !== 0) {
      parts.push(`rotate(${global.rotation}deg)`)
    }
    return parts.length > 0 ? parts.join(' ') : undefined
  }, [global.offsetX, global.offsetY, global.rotation])

  // Shared layer styling applied identically to CSS and Canvas tiers
  const layerStyle = useMemo(
    () => ({
      opacity: global.opacity,
      filter: computedFilter,
      transform: computedTransform,
      mixBlendMode: global.blendMode,
    }),
    [global.opacity, computedFilter, computedTransform, global.blendMode],
  )

  // Procedural noise tile Data-URL for CSS tier
  const noiseDataUrl = useMemo(() => {
    if (!effects.noise.enabled || renderer?.tier === 'canvas') return null
    return generateNoiseDataUrl(effects.noise, 128)
  }, [effects.noise, renderer?.tier])

  // Noise layer styling with blend mode, scale, and optional alpha masking
  const noiseLayerStyle = useMemo(() => {
    if (!noiseDataUrl) return undefined
    const tileSize = Math.max(16, Math.round(128 * effects.noise.scale))
    return {
      backgroundImage: `url(${noiseDataUrl})`,
      backgroundRepeat: 'repeat',
      backgroundSize: `${tileSize}px ${tileSize}px`,
      mixBlendMode: effects.noise.blendMode,
      opacity: effects.noise.opacity,
      maskImage:
        effects.noise.preserveTransparency && cssString
          ? cssString
          : undefined,
      WebkitMaskImage:
        effects.noise.preserveTransparency && cssString
          ? cssString
          : undefined,
    }
  }, [noiseDataUrl, effects.noise, cssString])

  // Multi-background properties for Layered gradient type
  const layeredProps = useMemo(() => {
    if (gradient.type === 'layered') {
      return layeredToCSSProperties(gradient, project)
    }
    return null
  }, [gradient, project])

  return (
    <div className="relative flex-1 h-full w-full bg-muted/20 flex flex-col items-center justify-between p-3 sm:p-5 overflow-hidden select-none gap-3">
      {/* Top badges bar */}
      <div className="w-full flex items-center justify-between text-[11px] text-muted-foreground z-10 pointer-events-none">
        <div className="flex items-center gap-1.5 bg-background/80 backdrop-blur-xs px-2.5 py-1 rounded-full border border-border shadow-2xs font-mono">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{canvas.width} × {canvas.height} px</span>
          <span className="text-muted-foreground/60">•</span>
          <span className="capitalize">{gradient.type}</span>
          <span className="text-muted-foreground/60">•</span>
          <span className="uppercase text-[9px] px-1 py-0.2 bg-slate-800 rounded text-slate-300">
            {renderer?.tier ?? 'css'}
          </span>
          {effects.noise.enabled && (
            <>
              <span className="text-muted-foreground/60">•</span>
              <span className="text-[10px] text-amber-400 font-semibold">NOISE</span>
            </>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-1.5 bg-background/80 backdrop-blur-xs px-2.5 py-1 rounded-full border border-border shadow-2xs">
          <Maximize2 className="size-3" />
          <span>Fit Preview</span>
        </div>
      </div>

      {/* Canvas container centered and maintaining aspect ratio */}
      <div className="relative w-full flex-1 flex items-center justify-center min-h-[220px] max-h-[72vh]">
        <div
          data-testid="preview-canvas"
          className="relative max-w-full max-h-full rounded-xl overflow-hidden shadow-2xl border border-border/80 ring-1 ring-black/5"
          style={{
            aspectRatio: `${canvas.width} / ${canvas.height}`,
            width: aspectRatio >= 1 ? 'min(100%, 720px)' : 'auto',
            height: aspectRatio < 1 ? 'min(100%, 540px)' : 'auto',
          }}
        >
          {/* Transparency checkerboard background */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(45deg, rgba(0,0,0,0.06) 25%, transparent 25%),
                linear-gradient(-45deg, rgba(0,0,0,0.06) 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.06) 75%),
                linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.06) 75%)
              `,
              backgroundSize: '16px 16px',
              backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
            }}
          />

          {/* Canvas solid background beneath gradient */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{ backgroundColor: canvas.background }}
          />

          {/* Underlay Noise Layer (beneath gradient) */}
          {noiseLayerStyle && effects.noise.blending === 'underlay' && (
            <div
              data-testid="noise-underlay"
              className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-200"
              style={noiseLayerStyle}
            />
          )}

          {/* Layer: CSS gradient OR Canvas 2D */}
          {renderer?.tier === 'canvas' ? (
            <canvas
              ref={canvasRef}
              data-testid="canvas-renderer"
              width={canvas.width}
              height={canvas.height}
              className="absolute inset-0 w-full h-full object-fill transition-all duration-200"
              style={layerStyle}
            />
          ) : (
            <div
              data-testid="css-renderer"
              className="absolute inset-0 w-full h-full transition-all duration-200"
              style={{
                ...(layeredProps
                  ? {
                      backgroundImage: layeredProps.backgroundImage,
                      backgroundPosition: layeredProps.backgroundPosition,
                      backgroundSize: layeredProps.backgroundSize,
                      backgroundBlendMode: layeredProps.backgroundBlendMode,
                      backgroundRepeat: layeredProps.backgroundRepeat,
                    }
                  : { background: cssString ?? undefined }),
                ...layerStyle,
              }}
            />
          )}

          {/* Overlay / Embedded Noise Layer (above gradient) */}
          {noiseLayerStyle && effects.noise.blending !== 'underlay' && (
            <div
              data-testid="noise-overlay"
              className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-200"
              style={noiseLayerStyle}
            />
          )}
        </div>
      </div>

      {/* Read-only CSS code output bar with Copy button */}
      <CssOutputBox css={cssString} gradientType={gradient.type} />
    </div>
  )
}
