import { useMemo } from 'react'
import { useStore } from '@/core/store'
import { hasStops } from '@/core/types'
import { Maximize2 } from 'lucide-react'

export default function Preview() {
  const { project } = useStore()
  const { canvas, gradient, global } = project

  // Calculate CSS gradient background preview for the current type
  const gradientStyle = useMemo(() => {
    const stops = hasStops(gradient)
      ? gradient.stops.map((s) => `${s.color} ${s.position}%`).join(', ')
      : '#3b82f6, #8b5cf6'

    switch (gradient.type) {
      case 'linear':
        return `linear-gradient(${gradient.angle}deg, ${stops})`
      case 'radial':
        return `radial-gradient(${gradient.shape} at ${gradient.centerX}% ${gradient.centerY}%, ${stops})`
      case 'conic':
        return `conic-gradient(from ${gradient.startAngle}deg at ${gradient.centerX}% ${gradient.centerY}%, ${stops})`
      case 'diamond':
        return `linear-gradient(45deg, #3b82f6 25%, #8b5cf6 25%, #8b5cf6 50%, #3b82f6 50%, #3b82f6 75%, #8b5cf6 75%)`
      case 'repeating-linear':
        return `repeating-linear-gradient(${gradient.angle}deg, ${stops})`
      case 'repeating-radial':
        return `repeating-radial-gradient(${gradient.shape} at ${gradient.centerX}% ${gradient.centerY}%, ${stops})`
      case 'repeating-conic':
        return `repeating-conic-gradient(from ${gradient.startAngle}deg at ${gradient.centerX}% ${gradient.centerY}%, ${stops})`
      case 'mesh':
        return `radial-gradient(at 0% 0%, #ef4444 0px, transparent 50%), radial-gradient(at 100% 0%, #22c55e 0px, transparent 50%), radial-gradient(at 50% 100%, #3b82f6 0px, transparent 50%), #eab308`
      case 'freeform':
        return `radial-gradient(circle at 25% 25%, #ef4444 0%, transparent 45%), radial-gradient(circle at 75% 75%, #3b82f6 0%, transparent 45%), #8b5cf6`
      case 'shape-blur':
        return `radial-gradient(ellipse at 40% 40%, #ff6b6b 0%, #4ecdc4 75%)`
      case 'layered':
        return `linear-gradient(to right, rgba(59,130,246,0.8), rgba(236,72,153,0.8)), linear-gradient(to bottom, #10b981, #6366f1)`
      case 'reflected':
        return `linear-gradient(to right, #3b82f6, #8b5cf6 50%, #3b82f6)`
      case 'aurora':
        return `linear-gradient(180deg, #0f172a 0%, #065f46 40%, #0284c7 70%, #a855f7 100%)`
      case 'holographic':
        return `conic-gradient(from 45deg, #67e8f9, #c084fc, #f9a8d4, #67e8f9)`
      case 'grainy':
        return `linear-gradient(135deg, #f43f5e, #fbbf24)`
      default:
        return `linear-gradient(to right, ${stops})`
    }
  }, [gradient])

  const aspectRatio = canvas.width / canvas.height

  return (
    <div className="relative flex-1 h-full w-full bg-muted/20 flex flex-col items-center justify-center p-3 sm:p-6 overflow-hidden select-none">
      {/* Top badges bar */}
      <div className="absolute top-3 inset-x-3 sm:inset-x-6 flex items-center justify-between text-[11px] text-muted-foreground z-10 pointer-events-none">
        <div className="flex items-center gap-1.5 bg-background/80 backdrop-blur-xs px-2.5 py-1 rounded-full border border-border shadow-2xs font-mono">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{canvas.width} × {canvas.height} px</span>
          <span className="text-muted-foreground/60">•</span>
          <span className="capitalize">{gradient.type}</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 bg-background/80 backdrop-blur-xs px-2.5 py-1 rounded-full border border-border shadow-2xs">
          <Maximize2 className="size-3" />
          <span>Fit Preview</span>
        </div>
      </div>

      {/* Canvas container centered and maintaining aspect ratio */}
      <div className="relative w-full h-full flex items-center justify-center min-h-[220px] max-h-[85vh]">
        <div
          data-testid="preview-canvas"
          className="relative max-w-full max-h-full rounded-xl overflow-hidden shadow-2xl border border-border/80 ring-1 ring-black/5"
          style={{
            aspectRatio: `${canvas.width} / ${canvas.height}`,
            width: aspectRatio >= 1 ? 'min(100%, 780px)' : 'auto',
            height: aspectRatio < 1 ? 'min(100%, 600px)' : 'auto',
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

          {/* Active Gradient Layer */}
          <div
            className="absolute inset-0 w-full h-full transition-all duration-300"
            style={{
              background: gradientStyle,
              opacity: global.opacity,
              filter: global.blur > 0 ? `blur(${global.blur}px)` : undefined,
              mixBlendMode: global.blendMode,
            }}
          />

          {/* Optional Noise layer overlay simulation if enabled */}
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

      {/* Bottom control hints */}
      <div className="absolute bottom-3 text-[11px] text-muted-foreground/70 hidden sm:block">
        Live CSS & Canvas Preview • Scale: Fit
      </div>
    </div>
  )
}
