// ---------------------------------------------------------------------------
// PositionPad Component
// 2D Center X/Y pad + numeric inputs + presets (Center, Top, Bottom, Left, Right).
// ---------------------------------------------------------------------------

import { useState, useRef, useCallback, useEffect } from 'react'
import { Move } from 'lucide-react'

interface PositionPadProps {
  centerX: number // 0–100
  centerY: number // 0–100
  onChange: (x: number, y: number) => void
  label?: string
}

const PRESETS = [
  { name: 'Center', x: 50, y: 50 },
  { name: 'Top', x: 50, y: 0 },
  { name: 'Bottom', x: 50, y: 100 },
  { name: 'Left', x: 0, y: 50 },
  { name: 'Right', x: 100, y: 50 },
] as const

export function PositionPad({
  centerX,
  centerY,
  onChange,
  label = 'Center Position',
}: PositionPadProps) {
  const padRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const clampPercent = (val: number): number => {
    return Math.max(0, Math.min(100, Math.round(val)))
  }

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      if (!padRef.current) return
      const rect = padRef.current.getBoundingClientRect()
      const x = ((clientX - rect.left) / rect.width) * 100
      const y = ((clientY - rect.top) / rect.height) * 100
      onChange(clampPercent(x), clampPercent(y))
    },
    [onChange],
  )

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    setIsDragging(true)
    updateFromPointer(e.clientX, e.clientY)
  }

  useEffect(() => {
    if (!isDragging) return

    const handlePointerMove = (e: PointerEvent) => {
      updateFromPointer(e.clientX, e.clientY)
    }

    const handlePointerUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [isDragging, updateFromPointer])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
          <Move className="w-3.5 h-3.5 text-blue-400" />
          {label}
        </label>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-mono">X</span>
            <input
              type="number"
              min={0}
              max={100}
              value={centerX}
              onChange={(e) => onChange(clampPercent(Number(e.target.value)), centerY)}
              aria-label="Center X"
              className="w-12 px-1 py-0.5 text-right text-xs bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
            />
            <span className="text-[10px] text-slate-400">%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-mono">Y</span>
            <input
              type="number"
              min={0}
              max={100}
              value={centerY}
              onChange={(e) => onChange(centerX, clampPercent(Number(e.target.value)))}
              aria-label="Center Y"
              className="w-12 px-1 py-0.5 text-right text-xs bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
            />
            <span className="text-[10px] text-slate-400">%</span>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3">
        {/* 2D Interactive Pad */}
        <div
          ref={padRef}
          onPointerDown={handlePointerDown}
          aria-label="Position 2D pad"
          role="region"
          className="relative w-24 h-24 rounded bg-slate-800 border-2 border-slate-700 cursor-crosshair shadow-inner hover:border-slate-600 transition-colors flex-shrink-0 touch-none overflow-hidden"
        >
          {/* Subtle grid lines */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none opacity-20">
            <div className="border-r border-b border-slate-400" />
            <div className="border-b border-slate-400" />
            <div className="border-r border-slate-400" />
            <div />
          </div>

          {/* Indicator Dot */}
          <div
            className="absolute w-3.5 h-3.5 -ml-1.75 -mt-1.75 rounded-full bg-blue-500 border-2 border-white shadow-md pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${centerX}%`, top: `${centerY}%` }}
          />
        </div>

        {/* Position Presets */}
        <div className="flex-1 flex flex-col gap-1.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Presets</span>
          <div className="flex flex-wrap gap-1">
            {PRESETS.map((p) => {
              const isActive = centerX === p.x && centerY === p.y
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => onChange(p.x, p.y)}
                  className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {p.name}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
