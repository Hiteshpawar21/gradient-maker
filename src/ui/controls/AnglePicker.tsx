// ---------------------------------------------------------------------------
// AnglePicker Component
// Circular dial + slider + numeric input + quick presets (0, 45, 90, 135, 180, 270).
// ---------------------------------------------------------------------------

import { useState, useRef, useCallback, useEffect } from 'react'
import { RotateCw } from 'lucide-react'

interface AnglePickerProps {
  value: number // 0–360
  onChange: (angle: number) => void
  label?: string
}

const PRESETS = [0, 45, 90, 135, 180, 270] as const

export function AnglePicker({
  value,
  onChange,
  label = 'Angle',
}: AnglePickerProps) {
  const dialRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const normalizeAngle = (angle: number): number => {
    const mod = Math.round(angle) % 360
    return mod < 0 ? mod + 360 : mod
  }

  const updateAngleFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      if (!dialRef.current) return
      const rect = dialRef.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = clientX - cx
      const dy = clientY - cy

      // In CSS: 0deg is UP, 90deg is RIGHT, 180deg is DOWN, 270deg is LEFT.
      // Math.atan2(dy, dx): 0 is right, Math.PI/2 is down, -Math.PI/2 is up.
      // So cssAngle = Math.atan2(dx, -dy) * 180 / Math.PI
      let deg = Math.round((Math.atan2(dx, -dy) * 180) / Math.PI)
      if (deg < 0) deg += 360
      onChange(normalizeAngle(deg))
    },
    [onChange],
  )

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    setIsDragging(true)
    updateAngleFromPointer(e.clientX, e.clientY)
  }

  useEffect(() => {
    if (!isDragging) return

    const handlePointerMove = (e: PointerEvent) => {
      updateAngleFromPointer(e.clientX, e.clientY)
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
  }, [isDragging, updateAngleFromPointer])

  // Indicator rotation: 0deg is up (top center)
  const rad = (value * Math.PI) / 180
  const needleX = 50 + 38 * Math.sin(rad)
  const needleY = 50 - 38 * Math.cos(rad)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
          <RotateCw className="w-3.5 h-3.5 text-blue-400" />
          {label}
        </label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={360}
            value={value}
            onChange={(e) => {
              const val = Number(e.target.value)
              if (!Number.isNaN(val)) {
                onChange(normalizeAngle(val))
              }
            }}
            aria-label={`${label} numeric input`}
            className="w-14 px-1.5 py-0.5 text-right text-xs bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
          />
          <span className="text-xs text-slate-400">°</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Circular Dial */}
        <div
          ref={dialRef}
          onPointerDown={handlePointerDown}
          aria-label="Angle dial"
          role="slider"
          aria-valuemin={0}
          aria-valuemax={360}
          aria-valuenow={value}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
              onChange(normalizeAngle(value + 1))
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
              onChange(normalizeAngle(value - 1))
            }
          }}
          className="relative w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 cursor-pointer shadow-inner hover:border-slate-600 transition-colors flex-shrink-0 touch-none"
        >
          {/* Dial ticks */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-slate-500" />
          </div>

          {/* Needle / indicator line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line
              x1="50%"
              y1="50%"
              x2={`${needleX}%`}
              y2={`${needleY}%`}
              stroke="#60a5fa"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle
              cx={`${needleX}%`}
              cy={`${needleY}%`}
              r="3.5"
              fill="#3b82f6"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* Range Slider & Presets */}
        <div className="flex-1 flex flex-col gap-2">
          <input
            type="range"
            min={0}
            max={360}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            aria-label={`${label} slider`}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />

          <div className="flex items-center gap-1 flex-wrap">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onChange(p)}
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                  value === p
                    ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {p}°
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
