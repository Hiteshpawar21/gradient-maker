// ---------------------------------------------------------------------------
// GlobalPanel Component
// Settings that apply globally: canvas resolution, aspect presets, rotation,
// positioning offset, overall blend mode, blur, and glow.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { Globe, ChevronRight, Sliders, Sparkles } from 'lucide-react'
import { AccordionItem } from './Accordion'
import { useStore } from '@/core/store'
import { AnglePicker } from '../controls/AnglePicker'
import { BLEND_MODES, type BlendMode } from '@/core/types'

const ASPECT_PRESETS = [
  { label: '1:1', w: 800, h: 800 },
  { label: '16:9', w: 1280, h: 720 },
  { label: '4:3', w: 800, h: 600 },
  { label: '9:16', w: 720, h: 1280 },
] as const

export function GlobalPanel({
  isOpen,
  onToggle,
}: {
  isOpen: boolean
  onToggle: () => void
}) {
  const { project, updateCanvas, updateGlobal } = useStore()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { canvas, global } = project

  const isCurrentPreset = (w: number, h: number) =>
    canvas.width === w && canvas.height === h

  return (
    <AccordionItem
      id="global"
      title="Global"
      icon={<Globe className="size-4" />}
      badge={`${canvas.width}×${canvas.height}`}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-4 pt-1">
        {/* 1. Canvas Resolution & Aspect Presets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300">Canvas Resolution</span>
            <span className="font-mono text-slate-400">
              {canvas.width} × {canvas.height} px
            </span>
          </div>

          <div className="flex gap-1">
            {ASPECT_PRESETS.map((p) => {
              const active = isCurrentPreset(p.w, p.h)
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    updateCanvas({ width: p.w, height: p.h })
                  }}
                  className={`flex-1 py-1 text-[11px] font-medium rounded border transition-colors ${
                    active
                      ? 'border-blue-500 bg-blue-600/20 text-blue-400 font-semibold'
                      : 'border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              )
            })}
          </div>

          {/* Custom Width & Height Inputs */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 px-2 py-1 rounded">
              <span className="text-[10px] text-slate-400">W</span>
              <input
                type="number"
                min={100}
                max={3840}
                value={canvas.width}
                onChange={(e) => {
                  const val = Math.max(100, Math.min(3840, Number(e.target.value)))
                  updateCanvas({ width: val })
                }}
                aria-label="Canvas Width"
                className="w-14 text-right text-xs bg-transparent text-slate-100 font-mono focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 ml-1">px</span>
            </div>

            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 px-2 py-1 rounded">
              <span className="text-[10px] text-slate-400">H</span>
              <input
                type="number"
                min={100}
                max={3840}
                value={canvas.height}
                onChange={(e) => {
                  const val = Math.max(100, Math.min(3840, Number(e.target.value)))
                  updateCanvas({ height: val })
                }}
                aria-label="Canvas Height"
                className="w-14 text-right text-xs bg-transparent text-slate-100 font-mono focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 ml-1">px</span>
            </div>
          </div>
        </div>

        {/* 2. Canvas Background Color */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
          <label htmlFor="canvas-bg-picker" className="text-xs font-medium text-slate-300">
            Background Color
          </label>
          <div className="flex items-center gap-2">
            <input
              id="canvas-bg-picker"
              type="color"
              value={canvas.background.startsWith('#') ? canvas.background : '#ffffff'}
              onChange={(e) => {
                updateCanvas({ background: e.target.value })
              }}
              aria-label="Canvas background color"
              className="size-6 rounded border border-slate-700 bg-transparent cursor-pointer p-0"
            />
            <span className="text-xs font-mono text-slate-400">{canvas.background}</span>
          </div>
        </div>

        {/* 3. Global Rotation */}
        <div className="pt-2 border-t border-slate-800/80">
          <AnglePicker
            label="Global Rotation"
            value={global.rotation}
            onChange={(rotation) => {
              updateGlobal({ rotation })
            }}
          />
        </div>

        {/* 4. Global Position Offset (X / Y) */}
        <div className="space-y-2 pt-1 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300">Position Offset</span>
            <span className="font-mono text-slate-400">
              X: {global.offsetX}px, Y: {global.offsetY}px
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Offset X</span>
                <span>{global.offsetX}px</span>
              </div>
              <input
                type="range"
                min={-200}
                max={200}
                value={global.offsetX}
                onChange={(e) => {
                  updateGlobal({ offsetX: Number(e.target.value) })
                }}
                aria-label="Global Offset X"
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Offset Y</span>
                <span>{global.offsetY}px</span>
              </div>
              <input
                type="range"
                min={-200}
                max={200}
                value={global.offsetY}
                onChange={(e) => {
                  updateGlobal({ offsetY: Number(e.target.value) })
                }}
                aria-label="Global Offset Y"
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 5. Overall Blend Mode */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
          <label htmlFor="global-blend-mode-select" className="text-xs font-medium text-slate-300">
            Blend Mode
          </label>
          <select
            id="global-blend-mode-select"
            value={global.blendMode}
            onChange={(e) => {
              updateGlobal({ blendMode: e.target.value as BlendMode })
            }}
            aria-label="Overall blend mode"
            className="px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 capitalize focus:outline-none focus:border-blue-500"
          >
            {BLEND_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>

        {/* 6. Advanced Filters: Blur & Glow */}
        <div className="pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => {
              setShowAdvanced(!showAdvanced)
            }}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ChevronRight
              className={`size-3.5 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
            />
            <Sparkles className="size-3.5 text-blue-400" />
            Advanced blur & glow
          </button>

          {showAdvanced && (
            <div className="mt-3 space-y-3 pl-3 border-l-2 border-slate-700/60 text-xs">
              {/* Blur */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span className="flex items-center gap-1">
                    <Sliders className="size-3 text-slate-400" />
                    Filter Blur
                  </span>
                  <span className="font-mono text-slate-400">{global.blur}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={global.blur}
                  onChange={(e) => {
                    updateGlobal({ blur: Number(e.target.value) })
                  }}
                  aria-label="Global Filter Blur"
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Glow Amount */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Glow Amount</span>
                  <span className="font-mono text-slate-400">{global.glow.amount}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={global.glow.amount}
                  onChange={(e) => {
                    updateGlobal({
                      glow: { ...global.glow, amount: Number(e.target.value) },
                    })
                  }}
                  aria-label="Global Glow Amount"
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Glow Color */}
              <div className="flex items-center justify-between pt-1">
                <label htmlFor="global-glow-color" className="text-slate-300">
                  Glow Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="global-glow-color"
                    type="color"
                    value={global.glow.color.startsWith('#') ? global.glow.color : '#60a5fa'}
                    onChange={(e) => {
                      updateGlobal({
                        glow: { ...global.glow, color: e.target.value },
                      })
                    }}
                    aria-label="Global glow color"
                    className="size-6 rounded border border-slate-700 bg-transparent cursor-pointer p-0"
                  />
                  <span className="font-mono text-slate-400">{global.glow.color}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AccordionItem>
  )
}
