import { useState } from 'react'
import {
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  Copy,
  ChevronRight,
  Layers,
} from 'lucide-react'
import type {
  LayeredConfig,
  GradientLayer,
  BlendMode,
  GradientConfig,
} from '@/core/types'
import { BLEND_MODES } from '@/core/types'
import { generateId } from '@/lib/utils'
import { defaultGradientConfig } from '@/core/defaults'

const LAYER_TYPES = ['linear', 'radial', 'conic'] as const

export function LayeredControls({
  config,
  onChange,
}: {
  config: LayeredConfig
  onChange: (update: Partial<LayeredConfig>) => void
}) {
  const [expandedLayerId, setExpandedLayerId] = useState<string | null>(
    config.layers[0]?.id ?? null,
  )

  const handleAddLayer = () => {
    const newLayer: GradientLayer = {
      id: generateId(),
      gradient: defaultGradientConfig('linear'),
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      opacity: 0.8,
      blendMode: 'screen',
    }
    const updated = [...config.layers, newLayer]
    onChange({ layers: updated })
    setExpandedLayerId(newLayer.id)
  }

  const handleDuplicateLayer = (layer: GradientLayer) => {
    const duplicate: GradientLayer = {
      ...layer,
      id: generateId(),
      gradient: JSON.parse(JSON.stringify(layer.gradient)) as GradientConfig,
    }
    const updated = [...config.layers, duplicate]
    onChange({ layers: updated })
    setExpandedLayerId(duplicate.id)
  }

  const handleRemoveLayer = (id: string) => {
    if (config.layers.length <= 1) return
    const updated = config.layers.filter((l) => l.id !== id)
    onChange({ layers: updated })
    if (expandedLayerId === id) {
      setExpandedLayerId(updated[0]?.id ?? null)
    }
  }

  const handleMoveLayer = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= config.layers.length) return
    const newLayers = [...config.layers]
    const temp = newLayers[index]
    newLayers[index] = newLayers[targetIndex]
    newLayers[targetIndex] = temp
    onChange({ layers: newLayers })
  }

  const handleUpdateLayer = (
    id: string,
    patch: Partial<Omit<GradientLayer, 'id'>>,
  ) => {
    const updated = config.layers.map((l) =>
      l.id === id ? { ...l, ...patch } : l,
    )
    onChange({ layers: updated })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
          <Layers className="size-3.5 text-blue-400" />
          Layers Stack ({config.layers.length})
        </label>
        <button
          type="button"
          onClick={handleAddLayer}
          className="flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
          aria-label="Add layer"
        >
          <Plus className="size-3" />
          Add Layer
        </button>
      </div>

      <div className="space-y-2">
        {config.layers.map((layer, index) => {
          const isExpanded = expandedLayerId === layer.id
          return (
            <div
              key={layer.id}
              className="rounded border border-slate-700/80 bg-slate-900 overflow-hidden text-xs"
            >
              {/* Layer Header */}
              <div className="flex items-center justify-between p-2 hover:bg-slate-800/50 transition-colors">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedLayerId(isExpanded ? null : layer.id)
                  }
                  className="flex items-center gap-1.5 text-slate-200 font-medium flex-1 text-left"
                >
                  <ChevronRight
                    className={`size-3 text-slate-400 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                  <span>
                    Layer {index + 1} ({layer.gradient.type})
                  </span>
                  <span className="text-[10px] text-slate-500 capitalize ml-1 font-mono">
                    {layer.blendMode} • {Math.round(layer.opacity * 100)}%
                  </span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveLayer(index, 'up')}
                    aria-label={`Move layer ${index + 1} up`}
                    className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronUp className="size-3" />
                  </button>
                  <button
                    type="button"
                    disabled={index === config.layers.length - 1}
                    onClick={() => handleMoveLayer(index, 'down')}
                    aria-label={`Move layer ${index + 1} down`}
                    className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronDown className="size-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicateLayer(layer)}
                    aria-label={`Duplicate layer ${index + 1}`}
                    className="p-1 rounded text-slate-400 hover:text-white"
                  >
                    <Copy className="size-3" />
                  </button>
                  <button
                    type="button"
                    disabled={config.layers.length <= 1}
                    onClick={() => handleRemoveLayer(layer.id)}
                    aria-label={`Delete layer ${index + 1}`}
                    className="p-1 rounded text-slate-400 hover:text-red-400 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>

              {/* Layer Controls Body */}
              {isExpanded && (
                <div className="p-2.5 pt-1 space-y-2.5 border-t border-slate-800 bg-slate-950/40">
                  {/* Layer Type */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Gradient Type</span>
                    <select
                      value={layer.gradient.type}
                      onChange={(e) => {
                        const newType = e.target.value as (typeof LAYER_TYPES)[number]
                        handleUpdateLayer(layer.id, {
                          gradient: defaultGradientConfig(newType),
                        })
                      }}
                      className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-200 capitalize focus:outline-none focus:border-blue-500"
                    >
                      {LAYER_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Opacity Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Opacity</span>
                      <span className="font-mono text-slate-400">
                        {Math.round(layer.opacity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={layer.opacity}
                      onChange={(e) =>
                        handleUpdateLayer(layer.id, {
                          opacity: Number(e.target.value),
                        })
                      }
                      aria-label={`Layer ${index + 1} opacity`}
                      className="w-full h-1 bg-slate-700 rounded appearance-none accent-blue-500"
                    />
                  </div>

                  {/* Blend Mode */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Blend Mode</span>
                    <select
                      value={layer.blendMode}
                      onChange={(e) =>
                        handleUpdateLayer(layer.id, {
                          blendMode: e.target.value as BlendMode,
                        })
                      }
                      aria-label={`Layer ${index + 1} blend mode`}
                      className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-200 capitalize focus:outline-none focus:border-blue-500"
                    >
                      {BLEND_MODES.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Position & Size */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">
                        Position X / Y
                      </span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={layer.x}
                          onChange={(e) =>
                            handleUpdateLayer(layer.id, {
                              x: Number(e.target.value),
                            })
                          }
                          aria-label={`Layer ${index + 1} X position`}
                          className="w-full px-1.5 py-0.5 text-right bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono"
                        />
                        <input
                          type="number"
                          value={layer.y}
                          onChange={(e) =>
                            handleUpdateLayer(layer.id, {
                              y: Number(e.target.value),
                            })
                          }
                          aria-label={`Layer ${index + 1} Y position`}
                          className="w-full px-1.5 py-0.5 text-right bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">
                        Size W / H (%)
                      </span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={layer.width}
                          onChange={(e) =>
                            handleUpdateLayer(layer.id, {
                              width: Number(e.target.value),
                            })
                          }
                          aria-label={`Layer ${index + 1} width`}
                          className="w-full px-1.5 py-0.5 text-right bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono"
                        />
                        <input
                          type="number"
                          value={layer.height}
                          onChange={(e) =>
                            handleUpdateLayer(layer.id, {
                              height: Number(e.target.value),
                            })
                          }
                          aria-label={`Layer ${index + 1} height`}
                          className="w-full px-1.5 py-0.5 text-right bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
