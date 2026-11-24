import type { ConicConfig } from '@/core/types'
import { AnglePicker } from '@/ui/controls/AnglePicker'
import { PositionPad } from '@/ui/controls/PositionPad'

export function ConicControls({
  config,
  onChange,
}: {
  config: ConicConfig
  onChange: (update: Partial<ConicConfig>) => void
}) {
  return (
    <div className="space-y-3">
      <PositionPad
        centerX={config.centerX}
        centerY={config.centerY}
        onChange={(x: number, y: number) => {
          onChange({ centerX: x, centerY: y })
        }}
      />
      <AnglePicker
        label="Start Angle"
        value={config.startAngle}
        onChange={(val: number) => {
          onChange({ startAngle: val })
        }}
      />
    </div>
  )
}
