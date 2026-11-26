import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NoisePanel } from '@/ui/panels/NoisePanel'
import { useStore } from '@/core/store'

describe('NoisePanel Component (Phase 6)', () => {
  beforeEach(() => {
    useStore.getState().reset()
  })

  it('renders noise panel with enable button and presets', () => {
    const onToggle = vi.fn()
    render(<NoisePanel isOpen={true} onToggle={onToggle} />)

    expect(screen.getByText('Noise Effect')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Toggle noise/i })).toHaveTextContent('Disabled')

    // Presets
    expect(screen.getByText('Film Grain')).toBeInTheDocument()
    expect(screen.getByText('Analog')).toBeInTheDocument()
    expect(screen.getByText('Digital')).toBeInTheDocument()
    expect(screen.getByText('Paper')).toBeInTheDocument()
  })

  it('toggles noise enabled in store', () => {
    const onToggle = vi.fn()
    render(<NoisePanel isOpen={true} onToggle={onToggle} />)

    const toggleBtn = screen.getByRole('button', { name: /Toggle noise/i })
    fireEvent.click(toggleBtn)
    expect(useStore.getState().project.effects.noise.enabled).toBe(true)

    fireEvent.click(toggleBtn)
    expect(useStore.getState().project.effects.noise.enabled).toBe(false)
  })

  it('applies texture style preset when clicked', () => {
    const onToggle = vi.fn()
    render(<NoisePanel isOpen={true} onToggle={onToggle} />)

    const analogBtn = screen.getByRole('button', { name: /Analog/i })
    fireEvent.click(analogBtn)

    const { noise } = useStore.getState().project.effects
    expect(noise.enabled).toBe(true)
    expect(noise.textureStyle).toBe('analog')
    expect(noise.grainSize).toBe('small')
  })

  it('updates grain size, opacity, intensity and scale sliders', () => {
    const onToggle = vi.fn()
    render(<NoisePanel isOpen={true} onToggle={onToggle} />)

    // Grain size button
    const medBtn = screen.getByRole('button', { name: 'Med' })
    fireEvent.click(medBtn)
    expect(useStore.getState().project.effects.noise.grainSize).toBe('medium')

    // Opacity
    const opacitySlider = screen.getByLabelText(/Noise opacity/i)
    fireEvent.change(opacitySlider, { target: { value: '0.85' } })
    expect(useStore.getState().project.effects.noise.opacity).toBe(0.85)

    // Intensity
    const intensitySlider = screen.getByLabelText(/Noise intensity/i)
    fireEvent.change(intensitySlider, { target: { value: '0.6' } })
    expect(useStore.getState().project.effects.noise.intensity).toBe(0.6)

    // Scale
    const scaleSlider = screen.getByLabelText(/Noise scale/i)
    fireEvent.change(scaleSlider, { target: { value: '2.5' } })
    expect(useStore.getState().project.effects.noise.scale).toBe(2.5)
  })

  it('updates layer position and preserve transparency', () => {
    const onToggle = vi.fn()
    render(<NoisePanel isOpen={true} onToggle={onToggle} />)

    // Underlay button
    const underlayBtn = screen.getByRole('button', { name: 'Underlay' })
    fireEvent.click(underlayBtn)
    expect(useStore.getState().project.effects.noise.blending).toBe('underlay')

    // Preserve transparency checkbox
    const initialPreserve = useStore.getState().project.effects.noise.preserveTransparency
    const preserveChk = screen.getByLabelText(/Preserve transparency/i)
    fireEvent.click(preserveChk)
    expect(useStore.getState().project.effects.noise.preserveTransparency).toBe(!initialPreserve)
  })

  it('updates seed and rolls new random seed', () => {
    const onToggle = vi.fn()
    render(<NoisePanel isOpen={true} onToggle={onToggle} />)

    const seedInput = screen.getByLabelText(/Noise seed/i)
    fireEvent.change(seedInput, { target: { value: '1234' } })
    expect(useStore.getState().project.effects.noise.seed).toBe(1234)

    const rollBtn = screen.getByRole('button', { name: /Roll new seed/i })
    fireEvent.click(rollBtn)
    expect(useStore.getState().project.effects.noise.seed).not.toBe(1234)
  })
})
