import { useState } from 'react'
import { Sparkles, Dices, ChevronRight, Sliders, Layers } from 'lucide-react'
import { AccordionItem } from './Accordion'
import { useStore } from '@/core/store'
import { Button } from '@/components/ui/button'
import { TEXTURE_STYLE_PRESETS } from '@/engine/noise'
import type { NoiseConfig } from '@/core/types'
import { NoiseAdvancedSettings } from './noise/NoiseAdvancedSettings'

interface TextureStyleOption {
  id: NoiseConfig['textureStyle']
  label: string
  desc: string
}

interface GrainSizeOption {
  id: NoiseConfig['grainSize']
  label: string
}

interface BlendingOption {
  id: NoiseConfig['blending']
  label: string
}

const TEXTURE_STYLES: TextureStyleOption[] = [
  { id: 'film-grain', label: 'Film Grain', desc: 'Fine 35mm cinematic grain' },
  { id: 'analog', label: 'Analog', desc: 'Soft organic vintage noise' },
  { id: 'digital', label: 'Digital', desc: 'Sharp high-contrast pixel grain' },
  { id: 'paper', label: 'Paper', desc: 'Tactile textured surface' },
]

const GRAIN_SIZES: GrainSizeOption[] = [
  { id: 'fine', label: 'Fine (1px)' },
  { id: 'small', label: 'Small (2px)' },
  { id: 'medium', label: 'Med (4px)' },
  { id: 'coarse', label: 'Coarse (8px)' },
]

const BLENDING_POSITIONS: BlendingOption[] = [
  { id: 'overlay', label: 'Overlay (Top)' },
  { id: 'underlay', label: 'Underlay (Bottom)' },
  { id: 'embedded', label: 'Embedded' },
]

export function NoisePanel({
  isOpen,
  onToggle,
}: {
  isOpen: boolean
  onToggle: () => void
}) {
  const { project, updateNoise } = useStore()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { noise } = project.effects

  const handleApplyPreset = (style: NoiseConfig['textureStyle']) => {
    const preset = TEXTURE_STYLE_PRESETS[style]
    updateNoise({
      ...preset,
      textureStyle: style,
      enabled: true,
    })
  }

  const handleRollSeed = () => {
    const newSeed = Math.floor(Math.random() * 100000) + 1
    updateNoise({ seed: newSeed })
  }

  return (
    <AccordionItem
      id="noise"
      title="Noise & texture"
      icon={<Sparkles className="size-4" />}
      badge={noise.enabled ? 'On' : 'Off'}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-4 pt-1">
        {/* 1. Main Enable Toggle */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
          <span className="text-xs font-medium text-slate-300">
            Noise Effect
          </span>
          <Button
            variant={noise.enabled ? 'default' : 'outline'}
            size="xs"
            onClick={() => {
              updateNoise({ enabled: !noise.enabled })
            }}
            aria-label="Toggle noise"
            className="h-6 text-[11px]"
          >
            {noise.enabled ? 'Enabled' : 'Disabled'}
          </Button>
        </div>

        {/* 2. Texture Style Presets */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">
            Texture Style Presets
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {TEXTURE_STYLES.map((t) => {
              const active = noise.enabled && noise.textureStyle === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleApplyPreset(t.id)}
                  title={t.desc}
                  className={`px-2 py-1.5 text-left rounded border transition-colors ${
                    active
                      ? 'border-blue-500 bg-blue-600/20 text-blue-300 font-semibold'
                      : 'border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-[11px] font-medium">{t.label}</div>
                  <div className="text-[9px] text-slate-500 truncate">
                    {t.desc}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 3. Seed & Roll */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
          <label
            htmlFor="noise-seed-input"
            className="text-xs font-medium text-slate-300 flex items-center gap-1.5"
          >
            Seed (PRNG)
          </label>
          <div className="flex items-center gap-1.5">
            <input
              id="noise-seed-input"
              type="number"
              value={noise.seed}
              onChange={(e) => {
                updateNoise({ seed: Number(e.target.value) })
              }}
              aria-label="Noise seed"
              className="w-20 px-1.5 py-0.5 text-right text-xs bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleRollSeed}
              title="Generate new random seed"
              aria-label="Roll new seed"
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <Dices className="size-3.5" />
            </button>
          </div>
        </div>

        {/* 4. Grain Size */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-300">Grain Size</span>
            <span className="font-mono text-slate-400 capitalize">
              {noise.grainSize}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {GRAIN_SIZES.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => updateNoise({ grainSize: g.id })}
                className={`py-1 text-[10px] font-medium rounded border transition-colors ${
                  noise.grainSize === g.id
                    ? 'border-blue-500 bg-blue-600/20 text-blue-400 font-semibold'
                    : 'border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {g.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Sliders: Opacity, Intensity, Scale */}
        <div className="space-y-2.5 pt-1 border-t border-slate-800/80">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Opacity</span>
              <span className="font-mono text-slate-400">
                {Math.round(noise.opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={noise.opacity}
              onChange={(e) => updateNoise({ opacity: Number(e.target.value) })}
              aria-label="Noise opacity"
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Intensity</span>
              <span className="font-mono text-slate-400">
                {Math.round(noise.intensity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={noise.intensity}
              onChange={(e) =>
                updateNoise({ intensity: Number(e.target.value) })
              }
              aria-label="Noise intensity"
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Tile Scale</span>
              <span className="font-mono text-slate-400">{noise.scale}×</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={4}
              step={0.1}
              value={noise.scale}
              onChange={(e) => updateNoise({ scale: Number(e.target.value) })}
              aria-label="Noise scale"
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        {/* 6. Blending Position (Overlay vs Underlay vs Embedded) */}
        <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Layers className="size-3.5 text-blue-400" />
            Layer Position
          </label>
          <div className="grid grid-cols-3 gap-1">
            {BLENDING_POSITIONS.map((pos) => (
              <button
                key={pos.id}
                type="button"
                onClick={() => updateNoise({ blending: pos.id })}
                className={`py-1 text-[10px] font-medium rounded border transition-colors ${
                  noise.blending === pos.id
                    ? 'border-blue-500 bg-blue-600/20 text-blue-400 font-semibold'
                    : 'border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {pos.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* 7. Preserve Transparency */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
          <div>
            <label
              htmlFor="preserve-transparency-chk"
              className="text-xs font-medium text-slate-300 block"
            >
              Preserve Transparency
            </label>
            <span className="text-[10px] text-slate-500">
              Masks grain by gradient alpha
            </span>
          </div>
          <input
            id="preserve-transparency-chk"
            type="checkbox"
            checked={noise.preserveTransparency}
            onChange={(e) =>
              updateNoise({ preserveTransparency: e.target.checked })
            }
            aria-label="Preserve transparency"
            className="size-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer"
          />
        </div>

        {/* 8. Advanced Noise Options (Type, Density, Color, Blend Mode) */}
        <div className="pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ChevronRight
              className={`size-3.5 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
            />
            <Sliders className="size-3.5 text-blue-400" />
            Advanced algorithm & color
          </button>

          {showAdvanced && (
            <NoiseAdvancedSettings noise={noise} onUpdate={updateNoise} />
          )}
        </div>
      </div>
    </AccordionItem>
  )
}
