import { useState } from 'react'
import { SlidersHorizontal, ChevronRight } from 'lucide-react'
import { AccordionItem } from './Accordion'
import { useStore } from '@/core/store'

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
