import { useState } from 'react'
import { Palette, ChevronRight } from 'lucide-react'
import { AccordionItem } from './Accordion'
import { useStore } from '@/core/store'
import { hasStops } from '@/core/types'
import type { Interpolation } from '@/core/types'
import { StopEditor } from '@/ui/controls/StopEditor'
import { ColorPicker } from '@/ui/controls/ColorPicker'
import { isGamutValid } from '@/color/convert'

export function ColorsPanel({
  isOpen,
  onToggle,
}: {
  isOpen: boolean
  onToggle: () => void
}) {
  const {
    project,
    selectedStopId,
    setSelectedStopId,
    addStop,
    removeStop,
    moveStop,
    updateStopColor,
    updateStopOpacity,
    distributeStops,
    reverseStops,
    updateGlobal,
    updateCanvas,
  } = useStore()

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [activePickerTarget, setActivePickerTarget] = useState<'stop' | 'background'>('stop')

  const { gradient, global, canvas } = project
  const stops = hasStops(gradient) ? gradient.stops : []

  // Ensure an active stop is selected if stops exist
  const effectiveSelectedId = selectedStopId && stops.some((s) => s.id === selectedStopId)
    ? selectedStopId
    : stops.length > 0
      ? stops[0].id
      : null

  const selectedStop = stops.find((s) => s.id === effectiveSelectedId)

  const activeColor =
    activePickerTarget === 'background'
      ? canvas.background
      : (selectedStop?.color ?? '#3b82f6')

  const handleColorChange = (newColor: string) => {
    if (activePickerTarget === 'background') {
      updateCanvas({ background: newColor })
    } else if (selectedStop) {
      updateStopColor(selectedStop.id, newColor)
    }
  }

  const interpolationOptions: { value: Interpolation; label: string; desc: string }[] = [
    { value: 'srgb', label: 'sRGB', desc: 'Standard gamma web interpolation' },
    { value: 'srgb-linear', label: 'Linear RGB', desc: 'Physically linear blending (no dark middle)' },
    { value: 'hsl', label: 'HSL', desc: 'Hue-wheel rainbow interpolation' },
    { value: 'oklab', label: 'OKLab', desc: 'Perceptually uniform brightness' },
  ]

  return (
    <AccordionItem
      id="colors"
      title="Colors"
      icon={<Palette className="size-4" />}
      badge={`${stops.length} stops`}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-4 pt-1">
        {/* Interactive Stop Editor (for gradients with stops) */}
        {hasStops(gradient) ? (
          <StopEditor
            stops={stops}
            selectedId={effectiveSelectedId}
            onSelect={(id) => {
              setSelectedStopId(id)
              setActivePickerTarget('stop')
            }}
            onAdd={(pos, col) => {
              addStop(col, pos)
              setActivePickerTarget('stop')
            }}
            onRemove={removeStop}
            onMove={moveStop}
            onUpdateOpacity={updateStopOpacity}
            onDistribute={distributeStops}
            onReverse={reverseStops}
          />
        ) : (
          <div className="p-3 rounded-lg border border-border/60 bg-muted/20 text-center text-xs text-muted-foreground">
            {gradient.type} gradient uses node or point colors configured in Type settings.
          </div>
        )}

        {/* Color Picker Target Header */}
        <div className="space-y-2 pt-1 border-t border-border/60">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-foreground">Color Palette Picker</span>
            <div className="flex gap-1 text-[10px]">
              <button
                type="button"
                onClick={() => {
                  setActivePickerTarget('stop')
                }}
                disabled={!hasStops(gradient)}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  activePickerTarget === 'stop'
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                Selected Stop
              </button>
              <button
                type="button"
                onClick={() => {
                  setActivePickerTarget('background')
                }}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  activePickerTarget === 'background'
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                Canvas BG
              </button>
            </div>
          </div>

          {/* Color Picker Component */}
          <ColorPicker
            color={activeColor}
            onChange={handleColorChange}
          />
        </div>

        {/* Global Color Settings: Interpolation, Overall Opacity, Background */}
        <div className="space-y-3 pt-2 border-t border-border/60 text-xs">
          {/* Interpolation Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-muted-foreground">
              <label htmlFor="interpolation-select" className="font-medium text-foreground">
                Interpolation Color Space
              </label>
              <span className="font-mono text-[10px] uppercase text-primary">
                {global.interpolation}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {interpolationOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    updateGlobal({ interpolation: opt.value })
                  }}
                  className={`p-1.5 rounded-lg border text-left transition-all ${
                    global.interpolation === opt.value
                      ? 'border-primary bg-primary/10 ring-1 ring-primary text-primary font-semibold'
                      : 'border-border/70 bg-card hover:bg-muted text-foreground'
                  }`}
                >
                  <p className="text-[11px] font-semibold leading-tight">{opt.label}</p>
                  <p className="text-[9px] text-muted-foreground leading-tight truncate">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Overall Gradient Opacity */}
          <div className="space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <label htmlFor="overall-opacity-slider">Overall Gradient Opacity</label>
              <span className="font-mono text-foreground">{Math.round(global.opacity * 100)}%</span>
            </div>
            <input
              id="overall-opacity-slider"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={global.opacity}
              onChange={(e) => {
                updateGlobal({ opacity: Number(e.target.value) })
              }}
              className="w-full accent-primary h-1.5 rounded cursor-pointer"
            />
          </div>

          {/* Canvas Background Color Quick Swatch */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-muted-foreground">Background Color</span>
            <div className="flex items-center gap-2">
              <span
                className="size-4 rounded-full border border-black/20 shadow-2xs shrink-0"
                style={{ backgroundColor: canvas.background }}
              />
              <span className="font-mono text-[11px] text-foreground">{canvas.background}</span>
            </div>
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
            Advanced color info & gamut
          </button>
          {showAdvanced && (
            <div className="mt-2 space-y-2 pl-3 border-l-2 border-border/60 text-[11px]">
              <div className="flex items-center justify-between">
                <span>Active Target Gamut</span>
                <span className={`font-mono ${isGamutValid(activeColor) ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {isGamutValid(activeColor) ? 'In sRGB Gamut' : 'Wide Gamut'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total Stops</span>
                <span className="font-mono text-foreground">{stops.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AccordionItem>
  )
}
