import { useState } from 'react'
import { Sparkles, ChevronRight } from 'lucide-react'
import { AccordionItem } from './Accordion'
import { useStore } from '@/core/store'
import { Button } from '@/components/ui/button'

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
