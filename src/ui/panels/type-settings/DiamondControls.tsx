import type { DiamondConfig } from '@/core/types'
import { AnglePicker } from '@/ui/controls/AnglePicker'
import { PositionPad } from '@/ui/controls/PositionPad'

export function DiamondControls({
  config,
  onChange,
}: {
  config: DiamondConfig
  onChange: (update: Partial<DiamondConfig>) => void
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

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">Width</span>
            <span className="font-mono text-slate-400">{config.width}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={200}
            value={config.width}
            onChange={(e) => {
              onChange({ width: Number(e.target.value) })
            }}
            aria-label="Diamond Width"
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">Height</span>
            <span className="font-mono text-slate-400">{config.height}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={200}
            value={config.height}
            onChange={(e) => {
              onChange({ height: Number(e.target.value) })
            }}
            aria-label="Diamond Height"
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>

      <AnglePicker
        label="Rotation"
        value={config.rotation}
        onChange={(val: number) => {
          onChange({ rotation: val })
        }}
      />

      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-300">Falloff (exponent)</span>
          <span className="font-mono text-slate-400">{config.falloff}</span>
        </div>
        <input
          type="range"
          min={0.5}
          max={4}
          step={0.1}
          value={config.falloff}
          onChange={(e) => {
            onChange({ falloff: Number(e.target.value) })
          }}
          aria-label="Diamond Falloff"
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>
    </div>
  )
}
