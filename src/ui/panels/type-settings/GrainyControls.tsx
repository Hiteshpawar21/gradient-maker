import type { GrainyConfig } from '@/core/types'
import { defaultGradientConfig } from '@/core/defaults'
import { Sparkles } from 'lucide-react'

export function GrainyControls({
  config,
  onChange,
}: {
  config: GrainyConfig
  onChange: (update: Partial<GrainyConfig>) => void
}) {
  const baseTypes = ['linear', 'radial', 'conic'] as const

  return (
    <div className="space-y-3">
      <div className="text-xs text-slate-300">
        Grainy gradient applies procedural noise texture to a base gradient.
      </div>

      <div className="flex items-center justify-between">
        <label htmlFor="grainy-base-type" className="text-xs font-medium text-slate-300">
          Base Gradient
        </label>
        <select
          id="grainy-base-type"
          value={config.baseGradient.type}
          onChange={(e) => {
            const newType = e.target.value as 'linear' | 'radial' | 'conic'
            const newBase = defaultGradientConfig(newType)
            onChange({ baseGradient: newBase })
          }}
          className="px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 capitalize focus:outline-none focus:border-blue-500"
        >
          {baseTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
        <Sparkles className="size-3.5 text-amber-400 shrink-0 mt-0.5" />
        <span>
          Adjust grain size, intensity, and texture styles in the{' '}
          <strong className="text-slate-200">Noise & texture</strong> panel below.
        </span>
      </div>
    </div>
  )
}
