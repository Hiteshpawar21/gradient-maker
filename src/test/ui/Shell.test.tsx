import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Shell from '@/ui/Shell'
import { useStore } from '@/core/store'

describe('UI Shell & Layout', () => {
  beforeEach(() => {
    useStore.getState().reset()
    useStore.getState().setTheme('dark')
  })

  it('renders top bar with all primary controls', () => {
    render(<Shell />)

    expect(screen.getByRole('heading', { name: /Gradient Maker/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/undo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/redo/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /randomize/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /import/i })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /export/i }).length).toBeGreaterThan(0)
    expect(screen.getByLabelText(/toggle theme/i)).toBeInTheDocument()
  })

  it('renders all 15 gradient types in Basic and Advanced groups', () => {
    render(<Shell />)

    const expectedTypes = [
      'Linear',
      'Radial',
      'Conic',
      'Diamond',
      'Rep. Linear',
      'Rep. Radial',
      'Rep. Conic',
      'Mesh',
      'Freeform',
      'Shape Blur',
      'Layered',
      'Reflected',
      'Aurora',
      'Holographic',
      'Grainy',
    ]

    for (const name of expectedTypes) {
      const typeElements = screen.getAllByText(name)
      expect(typeElements.length).toBeGreaterThan(0)
    }
  })

  it('clicking a type in TypePicker updates current gradient in store', () => {
    render(<Shell />)

    const radialButtons = screen.getAllByRole('radio', { name: /Radial/i })
    fireEvent.click(radialButtons[0])

    expect(useStore.getState().project.gradient.type).toBe('radial')
  })

  it('renders all 5 accordion control panels and toggles them', () => {
    render(<Shell />)

    // Check headings / accordion headers
    expect(screen.getAllByRole('button', { name: /Colors/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /Type settings/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /Global/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /Noise & texture/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /Export/i }).length).toBeGreaterThan(0)

    // Toggle global panel
    const globalButton = screen.getAllByRole('button', { name: /Global/i })[0]
    fireEvent.click(globalButton)
    expect(screen.getAllByText(/Canvas Resolution/i).length).toBeGreaterThan(0)
  })

  it('toggles theme when clicking theme toggle button', () => {
    render(<Shell />)

    const initialTheme = useStore.getState().theme
    const toggleBtn = screen.getByLabelText(/toggle theme/i)
    fireEvent.click(toggleBtn)

    expect(useStore.getState().theme).not.toBe(initialTheme)
  })

  it('renders preview canvas frame with dimensions indicator', () => {
    render(<Shell />)

    expect(screen.getByTestId('preview-canvas')).toBeInTheDocument()
    expect(screen.getAllByText(/800/i).length).toBeGreaterThan(0)
  })
})
