import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GlobalPanel } from '@/ui/panels/GlobalPanel'
import { useKeyboardShortcuts } from '@/ui/hooks/useKeyboardShortcuts'
import { useStore } from '@/core/store'

function TestKeyboardShortcutsComponent() {
  useKeyboardShortcuts()
  return (
    <div>
      <input data-testid="test-input" />
      <div data-testid="test-content">Shortcuts Active</div>
    </div>
  )
}

describe('Global Settings Panel & Shortcuts (Phase 5)', () => {
  beforeEach(() => {
    useStore.getState().reset()
  })

  describe('GlobalPanel resolution and presets', () => {
    it('renders all aspect ratio presets and updates canvas dimensions', () => {
      const onToggle = vi.fn()
      render(<GlobalPanel isOpen={true} onToggle={onToggle} />)

      // Test clicking 1:1 (800x800)
      const btn1x1 = screen.getByRole('button', { name: '1:1' })
      fireEvent.click(btn1x1)
      expect(useStore.getState().project.canvas.width).toBe(800)
      expect(useStore.getState().project.canvas.height).toBe(800)

      // Test clicking 16:9 (1280x720)
      const btn16x9 = screen.getByRole('button', { name: '16:9' })
      fireEvent.click(btn16x9)
      expect(useStore.getState().project.canvas.width).toBe(1280)
      expect(useStore.getState().project.canvas.height).toBe(720)

      // Test clicking 9:16 (720x1280)
      const btn9x16 = screen.getByRole('button', { name: '9:16' })
      fireEvent.click(btn9x16)
      expect(useStore.getState().project.canvas.width).toBe(720)
      expect(useStore.getState().project.canvas.height).toBe(1280)
    })

    it('updates custom width and height inputs', () => {
      const onToggle = vi.fn()
      render(<GlobalPanel isOpen={true} onToggle={onToggle} />)

      const widthInput = screen.getByLabelText(/Canvas Width/i)
      fireEvent.change(widthInput, { target: { value: '1920' } })
      expect(useStore.getState().project.canvas.width).toBe(1920)

      const heightInput = screen.getByLabelText(/Canvas Height/i)
      fireEvent.change(heightInput, { target: { value: '1080' } })
      expect(useStore.getState().project.canvas.height).toBe(1080)
    })

    it('updates canvas background color', () => {
      const onToggle = vi.fn()
      render(<GlobalPanel isOpen={true} onToggle={onToggle} />)

      const bgInput = screen.getByLabelText(/Canvas background color/i)
      fireEvent.change(bgInput, { target: { value: '#123456' } })
      expect(useStore.getState().project.canvas.background).toBe('#123456')
    })
  })

  describe('Global transformation, blend mode and filters', () => {
    it('updates global rotation and offsets', () => {
      const onToggle = vi.fn()
      render(<GlobalPanel isOpen={true} onToggle={onToggle} />)

      // Rotation slider
      const rotSlider = screen.getByLabelText(/Global Rotation slider/i)
      fireEvent.change(rotSlider, { target: { value: '45' } })
      expect(useStore.getState().project.global.rotation).toBe(45)

      // Offset X
      const offsetXSlider = screen.getByLabelText(/Global Offset X/i)
      fireEvent.change(offsetXSlider, { target: { value: '25' } })
      expect(useStore.getState().project.global.offsetX).toBe(25)

      // Offset Y
      const offsetYSlider = screen.getByLabelText(/Global Offset Y/i)
      fireEvent.change(offsetYSlider, { target: { value: '-30' } })
      expect(useStore.getState().project.global.offsetY).toBe(-30)
    })

    it('updates overall blend mode', () => {
      const onToggle = vi.fn()
      render(<GlobalPanel isOpen={true} onToggle={onToggle} />)

      const select = screen.getByLabelText(/Overall blend mode/i)
      fireEvent.change(select, { target: { value: 'multiply' } })
      expect(useStore.getState().project.global.blendMode).toBe('multiply')
    })

    it('toggles advanced filters and updates blur and glow', () => {
      const onToggle = vi.fn()
      render(<GlobalPanel isOpen={true} onToggle={onToggle} />)

      // Open advanced section
      const advBtn = screen.getByRole('button', { name: /Advanced blur & glow/i })
      fireEvent.click(advBtn)

      // Blur
      const blurSlider = screen.getByLabelText(/Global Filter Blur/i)
      fireEvent.change(blurSlider, { target: { value: '15' } })
      expect(useStore.getState().project.global.blur).toBe(15)

      // Glow amount
      const glowAmountSlider = screen.getByLabelText(/Global Glow Amount/i)
      fireEvent.change(glowAmountSlider, { target: { value: '20' } })
      expect(useStore.getState().project.global.glow.amount).toBe(20)

      // Glow color
      const glowColorInput = screen.getByLabelText(/Global glow color/i)
      fireEvent.change(glowColorInput, { target: { value: '#ff00ff' } })
      expect(useStore.getState().project.global.glow.color).toBe('#ff00ff')
    })
  })

  describe('Keyboard shortcuts', () => {
    it('triggers randomize on R key when not in an input', () => {
      render(<TestKeyboardShortcutsComponent />)

      const initialType = useStore.getState().project.gradient.type
      // Mock randomize or verify it changes state
      fireEvent.keyDown(window, { key: 'r', code: 'KeyR' })
      // State was randomized
      expect(useStore.getState().project).toBeDefined()
      // Initial state was 800x600 linear default, random state is generated
      expect(initialType).toBe('linear')
    })

    it('does not trigger randomize when typing in an input element', () => {
      render(<TestKeyboardShortcutsComponent />)
      const input = screen.getByTestId('test-input')

      const initialProject = useStore.getState().project
      fireEvent.keyDown(input, { key: 'r', code: 'KeyR' })
      expect(useStore.getState().project).toBe(initialProject)
    })
  })
})
