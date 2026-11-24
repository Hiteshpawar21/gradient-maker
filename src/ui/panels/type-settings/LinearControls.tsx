import type { LinearConfig } from '@/core/types'
import { AnglePicker } from '@/ui/controls/AnglePicker'

export function LinearControls({
  config,
  onChange,
}: {
  config: LinearConfig
  onChange: (update: Partial<LinearConfig>) => void
}) {
  return (
    <div className="space-y-3">
      <AnglePicker
        value={config.angle}
        onChange={(val: number) => {
          onChange({ angle: val })
        }}
      />
    </div>
  )
}
