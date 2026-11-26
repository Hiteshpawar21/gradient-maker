// ---------------------------------------------------------------------------
// TypeSettingsPanel Component
// Dedicated parameter controls for gradient types 1–7 and Type 15 (Grainy).
// ---------------------------------------------------------------------------

import { SlidersHorizontal } from 'lucide-react'
import { AccordionItem } from './Accordion'
import { useStore } from '@/core/store'
import { LinearControls } from './type-settings/LinearControls'
import { RadialControls } from './type-settings/RadialControls'
import { ConicControls } from './type-settings/ConicControls'
import { DiamondControls } from './type-settings/DiamondControls'
import {
  RepeatingLinearControls,
  RepeatingRadialControls,
  RepeatingConicControls,
} from './type-settings/RepeatingControls'
import { GrainyControls } from './type-settings/GrainyControls'
import { ReflectedControls } from './type-settings/ReflectedControls'
import { HolographicControls } from './type-settings/HolographicControls'
import { LayeredControls } from './type-settings/LayeredControls'

export function TypeSettingsPanel({
  isOpen,
  onToggle,
}: {
  isOpen: boolean
  onToggle: () => void
}) {
  const { project, updateGradient } = useStore()
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
      <div className="space-y-4 pt-1">
        {/* Type 1: Linear */}
        {gradient.type === 'linear' && (
          <LinearControls
            config={gradient}
            onChange={(upd) => updateGradient(upd)}
          />
        )}

        {/* Type 2: Radial */}
        {gradient.type === 'radial' && (
          <RadialControls
            config={gradient}
            onChange={(upd) => updateGradient(upd)}
          />
        )}

        {/* Type 3: Conic */}
        {gradient.type === 'conic' && (
          <ConicControls
            config={gradient}
            onChange={(upd) => updateGradient(upd)}
          />
        )}

        {/* Type 4: Diamond */}
        {gradient.type === 'diamond' && (
          <DiamondControls
            config={gradient}
            onChange={(upd) => updateGradient(upd)}
          />
        )}

        {/* Type 5: Repeating Linear */}
        {gradient.type === 'repeating-linear' && (
          <RepeatingLinearControls
            config={gradient}
            onChange={(upd) => updateGradient(upd)}
          />
        )}

        {/* Type 6: Repeating Radial */}
        {gradient.type === 'repeating-radial' && (
          <RepeatingRadialControls
            config={gradient}
            onChange={(upd) => updateGradient(upd)}
          />
        )}

        {/* Type 7: Repeating Conic */}
        {gradient.type === 'repeating-conic' && (
          <RepeatingConicControls
            config={gradient}
            onChange={(upd) => updateGradient(upd)}
          />
        )}

        {/* Type 11: Layered */}
        {gradient.type === 'layered' && (
          <LayeredControls
            config={gradient}
            onChange={(upd) => updateGradient(upd)}
          />
        )}

        {/* Type 12: Reflected */}
        {gradient.type === 'reflected' && (
          <ReflectedControls
            config={gradient}
            onChange={(upd) => updateGradient(upd)}
          />
        )}

        {/* Type 14: Holographic */}
        {gradient.type === 'holographic' && (
          <HolographicControls
            config={gradient}
            onChange={(upd) => updateGradient(upd)}
          />
        )}

        {/* Type 15: Grainy */}
        {gradient.type === 'grainy' && (
          <GrainyControls
            config={gradient}
            onChange={(upd) => updateGradient(upd)}
          />
        )}

        {/* Placeholder for remaining types */}
        {![
          'linear',
          'radial',
          'conic',
          'diamond',
          'repeating-linear',
          'repeating-radial',
          'repeating-conic',
          'layered',
          'reflected',
          'holographic',
          'grainy',
        ].includes(gradient.type) && (
          <div className="text-xs text-slate-400 py-2 italic">
            Settings for {gradient.type} gradient will be available in subsequent phases.
          </div>
        )}
      </div>
    </AccordionItem>
  )
}
