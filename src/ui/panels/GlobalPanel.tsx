import { useState } from 'react'
import { Globe, ChevronRight } from 'lucide-react'
import { AccordionItem } from './Accordion'
import { useStore } from '@/core/store'

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
