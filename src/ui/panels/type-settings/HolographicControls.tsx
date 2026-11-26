import type { HolographicConfig, BlendMode } from '@/core/types'
import { BLEND_MODES } from '@/core/types'
import { AnglePicker } from '@/ui/controls/AnglePicker'

export function HolographicControls({
  config,
  onChange,
}: {
  config: HolographicConfig
  onChange: (update: Partial<HolographicConfig>) => void
}) {
  const [h0, h1] = config.hueRange

  return (
    <div className="space-y-3.5">
      {/* 1. Angle */}
      <AnglePicker
        value={config.angle}
        onChange={(val: number) => {
          onChange({ angle: val })
        }}
      />

      {/* 2. Highlight Intensity */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-300">Specular Highlight</span>
          <span className="font-mono text-slate-400">
            {Math.round(config.highlightIntensity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={config.highlightIntensity}
          onChange={(e) =>
            onChange({ highlightIntensity: Number(e.target.value) })
          }
          aria-label="Highlight intensity"
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      {/* 3. Hue Range */}
      <div className="space-y-2 pt-1 border-t border-slate-800">
        <div className="flex justify-between text-xs">
          <span className="text-slate-300 font-medium">Spectral Hue Range</span>
          <span className="font-mono text-slate-400">
            {h0}° – {h1}°
          </span>
        </div>

        {/* Rainbow indicator preview */}
        <div
          className="h-2 w-full rounded-full border border-slate-700/60"
          style={{
            background: `linear-gradient(to right, hsl(${h0}, 80%, 65%), hsl(${(h0 + (h1 - h0) / 2) % 360}, 80%, 65%), hsl(${h1}, 80%, 65%))`,
          }}
        />

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label
              htmlFor="hue-start-slider"
              className="text-[11px] text-slate-400 block mb-0.5"
            >
              Start Hue
            </label>
            <input
              id="hue-start-slider"
              type="range"
              min={0}
              max={360}
              step={5}
              value={h0}
              onChange={(e) =>
                onChange({ hueRange: [Number(e.target.value), h1] })
              }
              aria-label="Start hue"
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="hue-end-slider"
              className="text-[11px] text-slate-400 block mb-0.5"
            >
              End Hue
            </label>
            <input
              id="hue-end-slider"
              type="range"
              min={0}
              max={360}
              step={5}
              value={h1}
              onChange={(e) =>
                onChange({ hueRange: [h0, Number(e.target.value)] })
              }
              aria-label="End hue"
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 4. Blend Mode */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800">
        <label
          htmlFor="holographic-blend-mode"
          className="text-xs font-medium text-slate-300"
        >
          Blend Mode
        </label>
        <select
          id="holographic-blend-mode"
          value={config.blendMode}
          onChange={(e) => onChange({ blendMode: e.target.value as BlendMode })}
          aria-label="Holographic blend mode"
          className="px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 capitalize focus:outline-none focus:border-blue-500"
        >
          {BLEND_MODES.map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
