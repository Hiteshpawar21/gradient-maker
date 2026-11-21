import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App smoke test', () => {
  it('renders the Gradient Maker heading', () => {
    render(<App />)
    expect(screen.getByText('Gradient Maker')).toBeInTheDocument()
  })

  it('renders the phase placeholder text', () => {
    render(<App />)
    expect(screen.getByText(/Phase 0/)).toBeInTheDocument()
  })
})
