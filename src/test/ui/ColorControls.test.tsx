import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ColorPicker } from '@/ui/controls/ColorPicker'
import { StopEditor } from '@/ui/controls/StopEditor'
import type { ColorStop } from '@/core/types'

describe('UI Color Controls', () => {
  describe('ColorPicker', () => {
    it('renders color format tabs (HEX, RGB, HSL, OKLCH)', () => {
      render(<ColorPicker color="#3b82f6" onChange={vi.fn()} />)

      expect(screen.getByRole('button', { name: /hex/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /rgb/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /hsl/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /oklch/i })).toBeInTheDocument()
    })

    it('switches between tabs and displays relevant inputs', () => {
      render(<ColorPicker color="#ff0000" onChange={vi.fn()} />)

      // Click RGB tab
      fireEvent.click(screen.getByRole('button', { name: /rgb/i }))
      expect(screen.getByLabelText(/rgb r/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/rgb g/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/rgb b/i)).toBeInTheDocument()

      // Click HSL tab
      fireEvent.click(screen.getByRole('button', { name: /hsl/i }))
      expect(screen.getByLabelText(/hsl h/i)).toBeInTheDocument()

      // Click OKLCH tab
      fireEvent.click(screen.getByRole('button', { name: /oklch/i }))
      expect(screen.getByLabelText(/oklch lightness/i)).toBeInTheDocument()
    })

    it('shows gamut warning alert and clamp button for wide-gamut OKLCH colors', () => {
      const handleChange = vi.fn()
      // Out of sRGB gamut high-chroma color
      render(<ColorPicker color="oklch(0.85 0.35 140)" onChange={handleChange} />)

      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/outside srgb gamut/i)).toBeInTheDocument()

      // Click clamp button
      const clampBtn = screen.getByRole('button', { name: /clamp/i })
      fireEvent.click(clampBtn)
      expect(handleChange).toHaveBeenCalled()
    })
  })

  describe('StopEditor', () => {
    const stops: ColorStop[] = [
      { id: 'stop-1', color: '#ff0000', position: 0, opacity: 1 },
      { id: 'stop-2', color: '#00ff00', position: 50, opacity: 0.8 },
      { id: 'stop-3', color: '#0000ff', position: 100, opacity: 1 },
    ]

    it('renders draggable stop handles for all stops', () => {
      render(
        <StopEditor
          stops={stops}
          selectedId="stop-2"
          onSelect={vi.fn()}
          onAdd={vi.fn()}
          onRemove={vi.fn()}
          onMove={vi.fn()}
          onUpdateOpacity={vi.fn()}
          onDistribute={vi.fn()}
          onReverse={vi.fn()}
        />,
      )

      const handles = screen.getAllByLabelText(/Color stop at/i)
      expect(handles).toHaveLength(3)
    })

    it('shows position and opacity inputs for selected stop', () => {
      const handleMove = vi.fn()
      const handleOpacity = vi.fn()

      render(
        <StopEditor
          stops={stops}
          selectedId="stop-2"
          onSelect={vi.fn()}
          onAdd={vi.fn()}
          onRemove={vi.fn()}
          onMove={handleMove}
          onUpdateOpacity={handleOpacity}
          onDistribute={vi.fn()}
          onReverse={vi.fn()}
        />,
      )

      expect(screen.getByText('Selected Stop')).toBeInTheDocument()
      expect(screen.getByLabelText('Position')).toBeInTheDocument()
      expect(screen.getByLabelText('Stop Opacity')).toBeInTheDocument()

      // Change position
      fireEvent.change(screen.getByLabelText('Position'), { target: { value: '75' } })
      expect(handleMove).toHaveBeenCalledWith('stop-2', 75)

      // Change opacity
      fireEvent.change(screen.getByLabelText('Stop Opacity'), { target: { value: '0.5' } })
      expect(handleOpacity).toHaveBeenCalledWith('stop-2', 0.5)
    })

    it('triggers distribute and reverse callbacks', () => {
      const handleDistribute = vi.fn()
      const handleReverse = vi.fn()

      render(
        <StopEditor
          stops={stops}
          selectedId="stop-1"
          onSelect={vi.fn()}
          onAdd={vi.fn()}
          onRemove={vi.fn()}
          onMove={vi.fn()}
          onUpdateOpacity={vi.fn()}
          onDistribute={handleDistribute}
          onReverse={handleReverse}
        />,
      )

      fireEvent.click(screen.getByRole('button', { name: /distribute/i }))
      expect(handleDistribute).toHaveBeenCalled()

      fireEvent.click(screen.getByRole('button', { name: /reverse/i }))
      expect(handleReverse).toHaveBeenCalled()
    })
  })
})
