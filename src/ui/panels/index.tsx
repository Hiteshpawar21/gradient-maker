import { useState } from 'react'
import {
  Palette,
  SlidersHorizontal,
  Globe,
  Sparkles,
  Download,
  ChevronRight,
  Plus,
  Copy,
} from 'lucide-react'
import { AccordionItem } from './Accordion'
import { useStore } from '@/core/store'
import { hasStops } from '@/core/types'
import { Button } from '@/components/ui/button'

export { AccordionItem }

export function ColorsPanel({
  isOpen,
  onToggle,
}: {
  isOpen: boolean
  onToggle: () => void
}) {
  const { project, addStop } = useStore()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const stops = hasStops(project.gradient) ? project.gradient.stops : []

  return (
    <AccordionItem
      id="colors"
      title="Colors"
      icon={<Palette className="size-4" />}
      badge={`${stops.length} stops`}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-foreground">Color Stops</span>
          <Button
            variant="outline"
            size="xs"
            onClick={() => {
              addStop()
            }}
            className="h-6 gap-1 text-[11px]"
          >
            <Plus className="size-3" /> Add Stop
          </Button>
        </div>

        {/* Gradient stop bar preview */}
        <div className="h-6 w-full rounded-md border border-border/80 p-0.5 bg-muted/40 relative flex items-center">
          <div
            className="w-full h-full rounded-xs shadow-inner"
            style={{
              background:
                stops.length > 0
                  ? `linear-gradient(to right, ${stops.map((s) => `${s.color} ${s.position}%`).join(', ')})`
                  : '#3b82f6',
            }}
          />
        </div>

        {/* Stops list overview */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {stops.map((stop) => (
            <div
              key={stop.id}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-border bg-background text-[11px] font-mono"
            >
              <span
                className="size-3 rounded-full border border-black/20 shrink-0"
                style={{ backgroundColor: stop.color }}
              />
              <span className="text-foreground">{stop.color}</span>
              <span className="text-muted-foreground">{stop.position}%</span>
            </div>
          ))}
          {stops.length === 0 && (
            <span className="text-muted-foreground italic text-[11px]">
              No standard stops for {project.gradient.type} (uses nodes or shapes)
            </span>
          )}
        </div>

        {/* Advanced sub-controls (collapsed by default) */}
        <div className="pt-2 border-t border-border/50">
          <button
            type="button"
            onClick={() => {
              setShowAdvanced(!showAdvanced)
            }}
            className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight
              className={`size-3 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
            />
            Advanced color controls
          </button>
          {showAdvanced && (
            <div className="mt-2 space-y-2 pl-3 border-l-2 border-border/60 text-[11px]">
              <div className="flex items-center justify-between">
                <span>Color Space</span>
                <span className="font-mono text-foreground">{project.global.interpolation.toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Overall Opacity</span>
                <span className="font-mono text-foreground">{Math.round(project.global.opacity * 100)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AccordionItem>
  )
}

export function TypeSettingsPanel({
  isOpen,
  onToggle,
}: {
  isOpen: boolean
  onToggle: () => void
}) {
  const { project } = useStore()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { gradient } = project

  return (
    <AccordionItem
      id="type-settings"
      title="Type settings"
      icon={<SlidersHorizontal className="size-4" />}
      badge={gradient.type}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-3 pt-1">
        <div className="text-[11px] text-muted-foreground">
          Configuring <span className="font-semibold text-foreground capitalize">{gradient.type.replace('-', ' ')}</span> gradient parameters.
        </div>

        {gradient.type === 'linear' && (
          <div className="flex items-center justify-between">
            <span>Angle</span>
            <span className="font-mono text-foreground">{gradient.angle}°</span>
          </div>
        )}

        {(gradient.type === 'radial' || gradient.type === 'conic') && (
          <div className="flex items-center justify-between">
            <span>Center position</span>
            <span className="font-mono text-foreground">
              {gradient.centerX}%, {gradient.centerY}%
            </span>
          </div>
        )}

        {gradient.type === 'diamond' && (
          <div className="flex items-center justify-between">
            <span>Width / Height</span>
            <span className="font-mono text-foreground">{gradient.width}% × {gradient.height}%</span>
          </div>
        )}

        {gradient.type === 'mesh' && (
          <div className="flex items-center justify-between">
            <span>Grid resolution</span>
            <span className="font-mono text-foreground">{gradient.rows} × {gradient.columns} nodes</span>
          </div>
        )}

        {/* Advanced sub-controls (collapsed by default) */}
        <div className="pt-2 border-t border-border/50">
          <button
            type="button"
            onClick={() => {
              setShowAdvanced(!showAdvanced)
            }}
            className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight
              className={`size-3 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
            />
            Advanced geometry & smoothing
          </button>
          {showAdvanced && (
            <div className="mt-2 space-y-2 pl-3 border-l-2 border-border/60 text-[11px]">
              <div className="flex items-center justify-between">
                <span>Rotation / Offset</span>
                <span className="font-mono text-foreground">{project.global.rotation}°</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Blend Mode</span>
                <span className="font-mono text-foreground">{project.global.blendMode}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AccordionItem>
  )
}

export function GlobalPanel({
  isOpen,
  onToggle,
}: {
  isOpen: boolean
  onToggle: () => void
}) {
  const { project, updateCanvas } = useStore()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { canvas, global } = project

  return (
    <AccordionItem
      id="global"
      title="Global"
      icon={<Globe className="size-4" />}
      badge={`${canvas.width}×${canvas.height}`}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-3 pt-1">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span>Canvas Resolution</span>
            <span className="font-mono text-foreground">{canvas.width} × {canvas.height} px</span>
          </div>
          <div className="flex gap-1">
            {[
              { label: '1:1', w: 800, h: 800 },
              { label: '16:9', w: 1280, h: 720 },
              { label: '4:3', w: 800, h: 600 },
              { label: '9:16', w: 720, h: 1280 },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  updateCanvas({ width: preset.w, height: preset.h })
                }}
                className={`flex-1 py-1 text-[10px] font-medium rounded border transition-colors ${
                  canvas.width === preset.w && canvas.height === preset.h
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-background hover:bg-muted text-muted-foreground'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span>Background</span>
          <div className="flex items-center gap-1.5 font-mono text-foreground">
            <span
              className="size-3 rounded-full border border-border"
              style={{ backgroundColor: canvas.background }}
            />
            {canvas.background}
          </div>
        </div>

        {/* Advanced sub-controls (collapsed by default) */}
        <div className="pt-2 border-t border-border/50">
          <button
            type="button"
            onClick={() => {
              setShowAdvanced(!showAdvanced)
            }}
            className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight
              className={`size-3 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
            />
            Advanced filters & glow
          </button>
          {showAdvanced && (
            <div className="mt-2 space-y-2 pl-3 border-l-2 border-border/60 text-[11px]">
              <div className="flex items-center justify-between">
                <span>Filter Blur</span>
                <span className="font-mono text-foreground">{global.blur}px</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Glow amount</span>
                <span className="font-mono text-foreground">{global.glow.amount}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AccordionItem>
  )
}

export function NoisePanel({
  isOpen,
  onToggle,
}: {
  isOpen: boolean
  onToggle: () => void
}) {
  const { project, updateNoise } = useStore()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { noise } = project.effects

  return (
    <AccordionItem
      id="noise"
      title="Noise & texture"
      icon={<Sparkles className="size-4" />}
      badge={noise.enabled ? 'On' : 'Off'}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <span>Enable noise overlay</span>
          <Button
            variant={noise.enabled ? 'default' : 'outline'}
            size="xs"
            onClick={() => {
              updateNoise({ enabled: !noise.enabled })
            }}
            className="h-6 text-[11px]"
          >
            {noise.enabled ? 'Enabled' : 'Disabled'}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <span>Noise Type</span>
          <span className="font-mono text-foreground capitalize">{noise.type}</span>
        </div>

        <div className="flex items-center justify-between">
          <span>Grain size</span>
          <span className="font-mono text-foreground capitalize">{noise.grainSize}</span>
        </div>

        {/* Advanced sub-controls (collapsed by default) */}
        <div className="pt-2 border-t border-border/50">
          <button
            type="button"
            onClick={() => {
              setShowAdvanced(!showAdvanced)
            }}
            className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight
              className={`size-3 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
            />
            Advanced grain & animation
          </button>
          {showAdvanced && (
            <div className="mt-2 space-y-2 pl-3 border-l-2 border-border/60 text-[11px]">
              <div className="flex items-center justify-between">
                <span>Texture Style</span>
                <span className="font-mono text-foreground capitalize">{noise.textureStyle}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Blending</span>
                <span className="font-mono text-foreground capitalize">{noise.blending}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Seed</span>
                <span className="font-mono text-foreground">{noise.seed}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AccordionItem>
  )
}

export function ExportPanel({
  isOpen,
  onToggle,
}: {
  isOpen: boolean
  onToggle: () => void
}) {
  const { project } = useStore()
  const [copied, setCopied] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Minimal CSS representation for preview
  const sampleCSS = `background: linear-gradient(${
    hasStops(project.gradient)
      ? project.gradient.stops.map((s) => `${s.color} ${s.position}%`).join(', ')
      : '#3b82f6, #8b5cf6'
  });`

  const handleCopy = () => {
    void navigator.clipboard.writeText(sampleCSS)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <AccordionItem
      id="export"
      title="Export"
      icon={<Download className="size-4" />}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-3 pt-1">
        <div className="flex flex-wrap gap-1.5">
          {['CSS', 'Tailwind', 'SVG', 'PNG', 'JSON'].map((fmt) => (
            <span
              key={fmt}
              className="px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground border border-border"
            >
              {fmt}
            </span>
          ))}
        </div>

        <div className="relative rounded-md border border-border bg-muted/60 p-2 font-mono text-[10px] text-foreground overflow-x-auto">
          <code>{sampleCSS}</code>
        </div>

        <div className="flex gap-2">
          <Button
            variant="default"
            size="xs"
            onClick={handleCopy}
            className="flex-1 h-7 text-[11px] gap-1"
          >
            <Copy className="size-3" />
            {copied ? 'Copied!' : 'Copy CSS'}
          </Button>
          <Button
            variant="outline"
            size="xs"
            className="h-7 text-[11px] gap-1"
          >
            <Download className="size-3" />
            Download
          </Button>
        </div>

        {/* Advanced sub-controls (collapsed by default) */}
        <div className="pt-2 border-t border-border/50">
          <button
            type="button"
            onClick={() => {
              setShowAdvanced(!showAdvanced)
            }}
            className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight
              className={`size-3 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
            />
            Advanced export options
          </button>
          {showAdvanced && (
            <div className="mt-2 space-y-2 pl-3 border-l-2 border-border/60 text-[11px]">
              <div className="flex items-center justify-between">
                <span>Raster Scale Factor</span>
                <span className="font-mono text-foreground">2x (Retina)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Embed Noise in SVG</span>
                <span className="font-mono text-foreground">Yes (feTurbulence)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AccordionItem>
  )
}
