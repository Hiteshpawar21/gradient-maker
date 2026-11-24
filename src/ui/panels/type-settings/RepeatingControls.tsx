import type {
  RepeatingLinearConfig,
  RepeatingRadialConfig,
  RepeatingConicConfig,
} from '@/core/types'
import { AnglePicker } from '@/ui/controls/AnglePicker'
import { PositionPad } from '@/ui/controls/PositionPad'

export function RepeatingLinearControls({
  config,
  onChange,
}: {
  config: RepeatingLinearConfig
  onChange: (update: Partial<RepeatingLinearConfig>) => void
}) {
  return (
    <div className="space-y-3">
      <AnglePicker
        value={config.angle}
        onChange={(val: number) => {
          onChange({ angle: val })
        }}
      />

      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-300">Stripe Width</span>
          <span className="font-mono text-slate-400">{config.stripeWidth}px</span>
        </div>
        <input
          type="range"
          min={5}
          max={200}
          value={config.stripeWidth}
          onChange={(e) => {
            onChange({ stripeWidth: Number(e.target.value) })
          }}
          aria-label="Stripe Width"
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-300">Repeat Interval</span>
          <span className="font-mono text-slate-400">{config.repeatInterval}px</span>
        </div>
        <input
          type="range"
          min={5}
          max={300}
          value={config.repeatInterval}
          onChange={(e) => {
            onChange({ repeatInterval: Number(e.target.value) })
          }}
          aria-label="Repeat Interval"
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>
    </div>
  )
}

export function RepeatingRadialControls({
  config,
  onChange,
}: {
  config: RepeatingRadialConfig
  onChange: (update: Partial<RepeatingRadialConfig>) => void
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

      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-300">Shape</label>
        <div className="flex rounded border border-slate-700 p-0.5 bg-slate-900">
          <button
            type="button"
            onClick={() => {
              onChange({ shape: 'circle' })
            }}
            className={`px-2.5 py-0.5 text-xs rounded transition-colors ${
              config.shape === 'circle'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Circle
          </button>
          <button
            type="button"
            onClick={() => {
              onChange({ shape: 'ellipse' })
            }}
            className={`px-2.5 py-0.5 text-xs rounded transition-colors ${
              config.shape === 'ellipse'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ellipse
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-300">Ring Size</span>
          <span className="font-mono text-slate-400">{config.ringSize}px</span>
        </div>
        <input
          type="range"
          min={5}
          max={200}
          value={config.ringSize}
          onChange={(e) => {
            onChange({ ringSize: Number(e.target.value) })
          }}
          aria-label="Ring Size"
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-300">Repeat Interval</span>
          <span className="font-mono text-slate-400">{config.repeatInterval}px</span>
        </div>
        <input
          type="range"
          min={5}
          max={300}
          value={config.repeatInterval}
          onChange={(e) => {
            onChange({ repeatInterval: Number(e.target.value) })
          }}
          aria-label="Repeat Interval"
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>
    </div>
  )
}

export function RepeatingConicControls({
  config,
  onChange,
}: {
  config: RepeatingConicConfig
  onChange: (update: Partial<RepeatingConicConfig>) => void
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

      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-300">Segment Size</span>
          <span className="font-mono text-slate-400">{config.segmentSize}°</span>
        </div>
        <input
          type="range"
          min={10}
          max={360}
          value={config.segmentSize}
          onChange={(e) => {
            onChange({ segmentSize: Number(e.target.value) })
          }}
          aria-label="Segment Size"
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>
    </div>
  )
}
