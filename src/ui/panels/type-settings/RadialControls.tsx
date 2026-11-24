import type { RadialConfig } from '@/core/types'
import { PositionPad } from '@/ui/controls/PositionPad'

export function RadialControls({
  config,
  onChange,
}: {
  config: RadialConfig
  onChange: (update: Partial<RadialConfig>) => void
}) {
  const sizes = [
    { id: 'farthest-corner', label: 'Farthest Corner' },
    { id: 'closest-side', label: 'Closest Side' },
    { id: 'closest-corner', label: 'Closest Corner' },
    { id: 'farthest-side', label: 'Farthest Side' },
  ] as const

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

      <div className="flex items-center justify-between">
        <label htmlFor="radial-size-select" className="text-xs font-medium text-slate-300">Size</label>
        <select
          id="radial-size-select"
          value={config.size}
          onChange={(e) => {
            const val = e.target.value
            if (
              val === 'farthest-corner' ||
              val === 'closest-side' ||
              val === 'closest-corner' ||
              val === 'farthest-side'
            ) {
              onChange({ size: val })
            }
          }}
          className="px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-blue-500"
        >
          {sizes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
