import type { NoiseConfig } from '@/core/types'

interface NoiseAdvancedSettingsProps {
  noise: NoiseConfig
  onUpdate: (patch: Partial<NoiseConfig>) => void
}

export function NoiseAdvancedSettings({
  noise,
  onUpdate,
}: NoiseAdvancedSettingsProps) {
  return (
    <div className="mt-3 space-y-3 pl-3 border-l-2 border-slate-700/60 text-xs">
      {/* Noise Type */}
      <div className="flex items-center justify-between">
        <label htmlFor="noise-type-sel" className="font-medium text-slate-300">
          Distribution Type
        </label>
        <select
          id="noise-type-sel"
          value={noise.type}
          onChange={(e) =>
            onUpdate({
              type: e.target.value as NoiseConfig['type'],
            })
          }
          className="px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 capitalize focus:outline-none focus:border-blue-500"
        >
          <option value="gaussian">Gaussian</option>
          <option value="uniform">Uniform</option>
          <option value="monochromatic">Monochromatic</option>
          <option value="colored-rgb">Colored RGB</option>
        </select>
      </div>

      {/* Density */}
      <div className="flex items-center justify-between">
        <label htmlFor="noise-density-sel" className="font-medium text-slate-300">
          Density
        </label>
        <select
          id="noise-density-sel"
          value={noise.density}
          onChange={(e) =>
            onUpdate({
              density: e.target.value as NoiseConfig['density'],
            })
          }
          className="px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 capitalize focus:outline-none focus:border-blue-500"
        >
          <option value="sparse">Sparse (35%)</option>
          <option value="balanced">Balanced (70%)</option>
          <option value="dense">Dense (100%)</option>
        </select>
      </div>

      {/* Color Mode */}
      <div className="flex items-center justify-between">
        <label htmlFor="noise-color-sel" className="font-medium text-slate-300">
          Color Palette
        </label>
        <select
          id="noise-color-sel"
          value={noise.color}
          onChange={(e) =>
            onUpdate({
              color: e.target.value as NoiseConfig['color'],
            })
          }
          className="px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 capitalize focus:outline-none focus:border-blue-500"
        >
          <option value="monochrome">Monochrome</option>
          <option value="black">Black Grain</option>
          <option value="white">White Grain</option>
          <option value="colored">Colored RGB</option>
        </select>
      </div>

      {/* CSS Blend Mode */}
      <div className="flex items-center justify-between">
        <label htmlFor="noise-blend-sel" className="font-medium text-slate-300">
          Blend Mode
        </label>
        <select
          id="noise-blend-sel"
          value={noise.blendMode}
          onChange={(e) =>
            onUpdate({
              blendMode: e.target.value as NoiseConfig['blendMode'],
            })
          }
          className="px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 capitalize focus:outline-none focus:border-blue-500"
        >
          <option value="overlay">Overlay</option>
          <option value="soft-light">Soft Light</option>
          <option value="multiply">Multiply</option>
          <option value="screen">Screen</option>
          <option value="normal">Normal</option>
        </select>
      </div>
    </div>
  )
}
