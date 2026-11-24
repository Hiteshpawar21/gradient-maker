import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TypeSettingsPanel } from '@/ui/panels/TypeSettingsPanel'
import { CssOutputBox } from '@/ui/CssOutputBox'
import { AnglePicker } from '@/ui/controls/AnglePicker'
import { PositionPad } from '@/ui/controls/PositionPad'
import Preview from '@/ui/Preview'
import { useStore } from '@/core/store'

describe('TypeSettingsPanel and Controls (Phase 4)', () => {
  beforeEach(() => {
    useStore.getState().reset()
  })

  describe('AnglePicker control', () => {
    it('renders with dial, slider and presets', () => {
      let currentAngle = 90
      const { rerender } = render(
        <AnglePicker
          value={currentAngle}
          onChange={(a) => {
            currentAngle = a
          }}
        />,
      )

      expect(screen.getByLabelText(/Angle dial/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Angle numeric input/i)).toHaveValue(90)

      // Test preset button click (e.g. 180°)
      const btn180 = screen.getByRole('button', { name: '180°' })
      fireEvent.click(btn180)
      expect(currentAngle).toBe(180)

      rerender(
        <AnglePicker
          value={currentAngle}
          onChange={(a) => {
            currentAngle = a
          }}
        />,
      )
      expect(screen.getByLabelText(/Angle numeric input/i)).toHaveValue(180)
    })
  })

  describe('PositionPad control', () => {
    it('renders 2D pad, inputs and presets', () => {
      let posX = 50
      let posY = 50
      render(
        <PositionPad
          centerX={posX}
          centerY={posY}
          onChange={(x, y) => {
            posX = x
            posY = y
          }}
        />,
      )

      expect(screen.getByLabelText(/Center X/i)).toHaveValue(50)
      expect(screen.getByLabelText(/Center Y/i)).toHaveValue(50)

      // Test preset button click (Top -> 50, 0)
      const topBtn = screen.getByRole('button', { name: 'Top' })
      fireEvent.click(topBtn)
      expect(posX).toBe(50)
      expect(posY).toBe(0)
    })
  })

  describe('TypeSettingsPanel interactive updates', () => {
    it('updates linear angle in store when changed', () => {
      useStore.getState().setType('linear')
      const onToggle = vi.fn()
      render(<TypeSettingsPanel isOpen={true} onToggle={onToggle} />)

      const numInput = screen.getByLabelText(/Angle numeric input/i)
      fireEvent.change(numInput, { target: { value: '45' } })

      const { gradient } = useStore.getState().project
      if (gradient.type === 'linear') {
        expect(gradient.angle).toBe(45)
      }
    })

    it('updates radial shape and size in store', () => {
      useStore.getState().setType('radial')
      const onToggle = vi.fn()
      render(<TypeSettingsPanel isOpen={true} onToggle={onToggle} />)

      const ellipseBtn = screen.getByRole('button', { name: 'Ellipse' })
      fireEvent.click(ellipseBtn)

      let { gradient } = useStore.getState().project
      if (gradient.type === 'radial') {
        expect(gradient.shape).toBe('ellipse')
      }

      const sizeSelect = screen.getByLabelText(/Size/i)
      fireEvent.change(sizeSelect, { target: { value: 'closest-side' } })
      gradient = useStore.getState().project.gradient
      if (gradient.type === 'radial') {
        expect(gradient.size).toBe('closest-side')
      }
    })

    it('updates diamond falloff and dimensions', () => {
      useStore.getState().setType('diamond')
      const onToggle = vi.fn()
      render(<TypeSettingsPanel isOpen={true} onToggle={onToggle} />)

      const falloffSlider = screen.getByLabelText(/Diamond Falloff/i)
      fireEvent.change(falloffSlider, { target: { value: '2.5' } })

      const { gradient } = useStore.getState().project
      if (gradient.type === 'diamond') {
        expect(gradient.falloff).toBe(2.5)
      }
    })
  })

  describe('CssOutputBox', () => {
    it('displays CSS string for CSS types and fallback for Canvas types', () => {
      const { rerender } = render(
        <CssOutputBox
          css="linear-gradient(90deg, #ff0000 0%, #0000ff 100%)"
          gradientType="linear"
        />,
      )

      expect(screen.getByTestId('css-output-code')).toHaveTextContent(
        'background: linear-gradient(90deg, #ff0000 0%, #0000ff 100%);',
      )

      rerender(<CssOutputBox css={null} gradientType="diamond" />)
      expect(screen.getByTestId('css-output-code')).toHaveTextContent(
        '/* diamond gradient is rendered via Canvas 2D */',
      )
    })
  })

  describe('Preview component tier rendering', () => {
    it('renders CSS container for linear and canvas element for diamond', () => {
      useStore.getState().setType('linear')
      const { rerender } = render(<Preview />)
      expect(screen.getByTestId('css-renderer')).toBeInTheDocument()

      useStore.getState().setType('diamond')
      rerender(<Preview />)
      expect(screen.getByTestId('canvas-renderer')).toBeInTheDocument()
    })
  })
})
