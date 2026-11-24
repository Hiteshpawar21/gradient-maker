// ---------------------------------------------------------------------------
// Preview Component
// Renders live preview: CSS background for CSS tier, Canvas 2D for Canvas tier.
// Shows read-only generated CSS in a box with copy button.
// ---------------------------------------------------------------------------

import { useMemo, useRef, useEffect } from 'react'
import { useStore } from '@/core/store'
import { getRenderer } from '@/engine'
import { CssOutputBox } from './CssOutputBox'
import { Maximize2 } from 'lucide-react'

export default function Preview() {
  const { project } = useStore()
  const { canvas, gradient, global } = project
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
      const ctx = cvs.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, cvs.width, cvs.height)
        renderer.draw(ctx, gradient, project, cvs.width, cvs.height)
      }
    }
  }, [renderer, gradient, project])

  const aspectRatio = canvas.width / canvas.height

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

          {/* Layer: CSS gradient OR Canvas 2D */}
          {renderer?.tier === 'canvas' ? (
            <canvas
              ref={canvasRef}
              data-testid="canvas-renderer"
              width={canvas.width}
              height={canvas.height}
              className="absolute inset-0 w-full h-full object-fill"
              style={{
                opacity: global.opacity,
                filter: global.blur > 0 ? `blur(${global.blur}px)` : undefined,
                mixBlendMode: global.blendMode,
              }}
            />
          ) : (
            <div
              data-testid="css-renderer"
              className="absolute inset-0 w-full h-full transition-all duration-200"
              style={{
                background: cssString ?? undefined,
                opacity: global.opacity,
                filter: global.blur > 0 ? `blur(${global.blur}px)` : undefined,
                mixBlendMode: global.blendMode,
              }}
            />
          )}

          {/* Noise effect overlay simulation if enabled */}
          {project.effects.noise.enabled && (
            <div
              className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay opacity-50"
              style={{
                backgroundImage: `radial-gradient(rgba(0,0,0,0.4) 1px, transparent 0)`,
                backgroundSize: '4px 4px',
              }}
            />
          )}
        </div>
      </div>

      {/* Read-only CSS code output bar with Copy button */}
      <CssOutputBox css={cssString} gradientType={gradient.type} />
    </div>
  )
}
