import type { ReflectedConfig } from '@/core/types'
import { AnglePicker } from '@/ui/controls/AnglePicker'

const SYMMETRIES: { id: ReflectedConfig['symmetry']; label: string }[] = [
  { id: 'horizontal', label: 'Horizontal' },
  { id: 'vertical', label: 'Vertical' },
  { id: 'both', label: 'Both (Cross)' },
  { id: 'none', label: 'None' },
]

export function ReflectedControls({
  config,
  onChange,
}: {
  config: ReflectedConfig
  onChange: (update: Partial<ReflectedConfig>) => void
}) {
  return (
    <div className="space-y-3.5">
      {/* 1. Angle */}
      <AnglePicker
        value={config.angle}
        onChange={(val: number) => {
          onChange({ angle: val })
        }}
      />

      {/* 2. Symmetry Mode */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-300">
          Reflection Symmetry
        </label>
        <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded border border-slate-700">
          {SYMMETRIES.map((sym) => (
            <button
              key={sym.id}
              type="button"
              onClick={() => onChange({ symmetry: sym.id })}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                config.symmetry === sym.id
                  ? 'bg-blue-600 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {sym.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Center Mirror Point */}
      {config.symmetry !== 'none' && (
        <div className="space-y-2 pt-1 border-t border-slate-800">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">
              {config.symmetry === 'vertical' ? 'Vertical Center' : 'Mirror Center'}
            </span>
            <span className="font-mono text-slate-400">
              {config.symmetry === 'vertical' ? config.centerY : config.centerX}%
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={90}
            step={1}
            value={config.symmetry === 'vertical' ? config.centerY : config.centerX}
            onChange={(e) => {
              const val = Number(e.target.value)
              if (config.symmetry === 'vertical') {
                onChange({ centerY: val })
              } else {
                onChange({ centerX: val })
              }
            }}
            aria-label="Mirror center point"
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      )}
    </div>
  )
}
