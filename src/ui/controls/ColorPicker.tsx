import { useState, useId } from 'react'
import { HexColorPicker, RgbColorPicker, HslColorPicker } from 'react-colorful'
import {
  toHex,
  toRgb,
  toHsl,
  toOklch,
  fromRgb,
  fromHsl,
  fromOklch,
  isGamutValid,
  clampToRgbHex,
} from '@/color/convert'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'oklch'

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  onPointerUp?: () => void
}

export function ColorPicker({ color, onChange, onPointerUp }: ColorPickerProps) {
  const [format, setFormat] = useState<ColorFormat>('hex')
  const baseId = useId()

  const currentHex = toHex(color)
  const currentRgb = toRgb(color)
  const currentHsl = toHsl(color)
  const currentOklch = toOklch(color)
  const inGamut = isGamutValid(color)

  const handleClamp = () => {
    const clampedHex = clampToRgbHex(color)
    onChange(clampedHex)
  }

  return (
    <div
      className="space-y-3 p-3 rounded-xl border border-border/80 bg-card text-card-foreground shadow-xs select-none"
      onPointerUp={onPointerUp}
    >
      {/* Format Selector Tabs & Preview Swatch */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg border border-border/60">
          {(['hex', 'rgb', 'hsl', 'oklch'] as const).map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => {
                setFormat(fmt)
              }}
              className={`px-2 py-0.5 text-[11px] font-semibold uppercase rounded-md transition-all ${
                format === fmt
                  ? 'bg-background text-foreground shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>

        {/* Current color preview pill */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-border/60 bg-background font-mono text-[11px]">
          <span
            className="size-3.5 rounded-full border border-black/20 shadow-2xs shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-foreground max-w-[90px] truncate">{currentHex}</span>
        </div>
      </div>

      {/* Visual Pickers */}
      <div className="flex justify-center pt-1">
        {format === 'hex' && (
          <HexColorPicker
            color={currentHex}
            onChange={onChange}
            className="!w-full max-w-[240px] !h-36 rounded-lg overflow-hidden"
          />
        )}
        {format === 'rgb' && (
          <RgbColorPicker
            color={{ r: currentRgb.r, g: currentRgb.g, b: currentRgb.b }}
            onChange={(rgbVal) => {
              onChange(fromRgb(rgbVal.r, rgbVal.g, rgbVal.b, currentRgb.a))
            }}
            className="!w-full max-w-[240px] !h-36 rounded-lg overflow-hidden"
          />
        )}
        {format === 'hsl' && (
          <HslColorPicker
            color={{ h: currentHsl.h, s: currentHsl.s, l: currentHsl.l }}
            onChange={(hslVal) => {
              onChange(fromHsl(hslVal.h, hslVal.s, hslVal.l, currentHsl.a))
            }}
            className="!w-full max-w-[240px] !h-36 rounded-lg overflow-hidden"
          />
        )}
        {format === 'oklch' && (
          <div className="w-full space-y-2 py-1">
            {/* L slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <label htmlFor={`${baseId}-oklch-l`}>Lightness (L)</label>
                <span>{Math.round(currentOklch.l * 100)}%</span>
              </div>
              <input
                id={`${baseId}-oklch-l`}
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={currentOklch.l}
                onChange={(e) => {
                  onChange(fromOklch(Number(e.target.value), currentOklch.c, currentOklch.h, currentOklch.a))
                }}
                className="w-full accent-primary h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* C slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <label htmlFor={`${baseId}-oklch-c`}>Chroma (C)</label>
                <span>{currentOklch.c}</span>
              </div>
              <input
                id={`${baseId}-oklch-c`}
                type="range"
                min={0}
                max={0.37}
                step={0.005}
                value={currentOklch.c}
                onChange={(e) => {
                  onChange(fromOklch(currentOklch.l, Number(e.target.value), currentOklch.h, currentOklch.a))
                }}
                className="w-full accent-primary h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* H slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <label htmlFor={`${baseId}-oklch-h`}>Hue (H)</label>
                <span>{currentOklch.h}°</span>
              </div>
              <input
                id={`${baseId}-oklch-h`}
                type="range"
                min={0}
                max={360}
                step={1}
                value={currentOklch.h}
                onChange={(e) => {
                  onChange(fromOklch(currentOklch.l, currentOklch.c, Number(e.target.value), currentOklch.a))
                }}
                className="w-full h-2 rounded-lg cursor-pointer"
                style={{
                  background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Gamut warning banner for OKLCH / out-of-gamut colors */}
      {!inGamut && (
        <div
          role="alert"
          className="flex items-center justify-between gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px]"
        >
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="size-3.5 shrink-0" />
            <span>Outside sRGB gamut</span>
          </div>
          <Button
            variant="outline"
            size="xs"
            onClick={handleClamp}
            className="h-5 text-[10px] border-amber-500/40 text-amber-600 dark:text-amber-300 hover:bg-amber-500/20"
          >
            Clamp
          </Button>
        </div>
      )}

      {/* Numeric Channel Inputs */}
      <div className="pt-2 border-t border-border/50 text-[11px]">
        {format === 'hex' && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-10">HEX:</span>
            <input
              type="text"
              aria-label="HEX color value"
              value={currentHex}
              onChange={(e) => {
                if (e.target.value.startsWith('#') || /^[0-9a-fA-F]{3,8}$/.test(e.target.value)) {
                  onChange(toHex(e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`))
                }
              }}
              className="flex-1 px-2 py-1 rounded border border-border bg-background font-mono text-xs uppercase"
            />
          </div>
        )}

        {format === 'rgb' && (
          <div className="grid grid-cols-3 gap-2">
            {(['r', 'g', 'b'] as const).map((ch) => (
              <div key={ch} className="space-y-0.5">
                <span className="text-[10px] uppercase text-muted-foreground">{ch}</span>
                <input
                  type="number"
                  min={0}
                  max={255}
                  aria-label={`RGB ${ch.toUpperCase()}`}
                  value={currentRgb[ch]}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    onChange(
                      fromRgb(
                        ch === 'r' ? val : currentRgb.r,
                        ch === 'g' ? val : currentRgb.g,
                        ch === 'b' ? val : currentRgb.b,
                        currentRgb.a,
                      ),
                    )
                  }}
                  className="w-full px-1.5 py-1 rounded border border-border bg-background font-mono text-center text-xs"
                />
              </div>
            ))}
          </div>
        )}

        {format === 'hsl' && (
          <div className="grid grid-cols-3 gap-2">
            {(['h', 's', 'l'] as const).map((ch) => (
              <div key={ch} className="space-y-0.5">
                <span className="text-[10px] uppercase text-muted-foreground">
                  {ch === 'h' ? 'H (°)' : `${ch.toUpperCase()} (%)`}
                </span>
                <input
                  type="number"
                  min={0}
                  max={ch === 'h' ? 360 : 100}
                  aria-label={`HSL ${ch.toUpperCase()}`}
                  value={currentHsl[ch]}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    onChange(
                      fromHsl(
                        ch === 'h' ? val : currentHsl.h,
                        ch === 's' ? val : currentHsl.s,
                        ch === 'l' ? val : currentHsl.l,
                        currentHsl.a,
                      ),
                    )
                  }}
                  className="w-full px-1.5 py-1 rounded border border-border bg-background font-mono text-center text-xs"
                />
              </div>
            ))}
          </div>
        )}

        {format === 'oklch' && (
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase text-muted-foreground">L (0–1)</span>
              <input
                type="number"
                min={0}
                max={1}
                step={0.01}
                aria-label="OKLCH Lightness"
                value={currentOklch.l}
                onChange={(e) => {
                  onChange(fromOklch(Number(e.target.value), currentOklch.c, currentOklch.h, currentOklch.a))
                }}
                className="w-full px-1 py-1 rounded border border-border bg-background font-mono text-center text-xs"
              />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase text-muted-foreground">C (Chroma)</span>
              <input
                type="number"
                min={0}
                max={0.4}
                step={0.005}
                aria-label="OKLCH Chroma"
                value={currentOklch.c}
                onChange={(e) => {
                  onChange(fromOklch(currentOklch.l, Number(e.target.value), currentOklch.h, currentOklch.a))
                }}
                className="w-full px-1 py-1 rounded border border-border bg-background font-mono text-center text-xs"
              />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase text-muted-foreground">H (0–360)</span>
              <input
                type="number"
                min={0}
                max={360}
                step={1}
                aria-label="OKLCH Hue"
                value={currentOklch.h}
                onChange={(e) => {
                  onChange(fromOklch(currentOklch.l, currentOklch.c, Number(e.target.value), currentOklch.a))
                }}
                className="w-full px-1 py-1 rounded border border-border bg-background font-mono text-center text-xs"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
