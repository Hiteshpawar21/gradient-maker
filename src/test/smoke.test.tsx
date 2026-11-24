import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App smoke test', () => {
  it('renders Gradient Maker application shell', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /Gradient Maker/i })).toBeInTheDocument()
  })

  it('renders the preview canvas frame', () => {
    render(<App />)
    expect(screen.getByTestId('preview-canvas')).toBeInTheDocument()
  })
})
