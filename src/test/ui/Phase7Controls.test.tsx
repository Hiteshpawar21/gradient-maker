import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ReflectedControls } from '@/ui/panels/type-settings/ReflectedControls'
import { HolographicControls } from '@/ui/panels/type-settings/HolographicControls'
import { LayeredControls } from '@/ui/panels/type-settings/LayeredControls'
import type { ReflectedConfig, HolographicConfig, LayeredConfig } from '@/core/types'
import { defaultGradientConfig } from '@/core/defaults'

describe('Phase 7 UI Controls', () => {
  describe('ReflectedControls', () => {
    it('renders angle, symmetry buttons, and mirror center', () => {
      const cfg = defaultGradientConfig('reflected') as ReflectedConfig
      const onChange = vi.fn()

      render(<ReflectedControls config={cfg} onChange={onChange} />)

      // Symmetry buttons
      expect(screen.getByRole('button', { name: 'Horizontal' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Vertical' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Both/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'None' })).toBeInTheDocument()

      // Click Vertical symmetry
      fireEvent.click(screen.getByRole('button', { name: 'Vertical' }))
      expect(onChange).toHaveBeenCalledWith({ symmetry: 'vertical' })

      // Center slider
      const centerSlider = screen.getByLabelText(/Mirror center point/i)
      fireEvent.change(centerSlider, { target: { value: '65' } })
      expect(onChange).toHaveBeenCalledWith({ centerX: 65 })
    })
  })

  describe('HolographicControls', () => {
    it('renders highlight slider, hue range sliders, and blend mode', () => {
      const cfg = defaultGradientConfig('holographic') as HolographicConfig
      const onChange = vi.fn()

      render(<HolographicControls config={cfg} onChange={onChange} />)

      // Highlight intensity
      const highlightSlider = screen.getByLabelText(/Highlight intensity/i)
      fireEvent.change(highlightSlider, { target: { value: '0.9' } })
      expect(onChange).toHaveBeenCalledWith({ highlightIntensity: 0.9 })

      // Hue sliders
      const startHue = screen.getByLabelText(/Start hue/i)
      fireEvent.change(startHue, { target: { value: '120' } })
      expect(onChange).toHaveBeenCalledWith({ hueRange: [120, cfg.hueRange[1]] })

      // Blend mode select
      const blendSelect = screen.getByLabelText(/Holographic blend mode/i)
      fireEvent.change(blendSelect, { target: { value: 'overlay' } })
      expect(onChange).toHaveBeenCalledWith({ blendMode: 'overlay' })
    })
  })

  describe('LayeredControls', () => {
    it('renders layers stack, allows adding, reordering, and deleting layers', () => {
      const cfg = defaultGradientConfig('layered') as LayeredConfig
      const onChange = vi.fn()

      render(<LayeredControls config={cfg} onChange={onChange} />)

      expect(screen.getByText(/Layers Stack/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Add layer/i })).toBeInTheDocument()

      // Add a layer
      fireEvent.click(screen.getByRole('button', { name: /Add layer/i }))
      expect(onChange).toHaveBeenCalled()

      // Move layer 2 up
      const moveUpBtn = screen.getByLabelText(/Move layer 2 up/i)
      fireEvent.click(moveUpBtn)
      expect(onChange).toHaveBeenCalled()

      // Duplicate layer 1
      const dupBtn = screen.getByLabelText(/Duplicate layer 1/i)
      fireEvent.click(dupBtn)
      expect(onChange).toHaveBeenCalled()
    })
  })
})
