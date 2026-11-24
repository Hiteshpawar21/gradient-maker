// ---------------------------------------------------------------------------
// Keyboard Shortcuts Hook
// Handles global shortcuts:
// - Ctrl/Cmd + Z: Undo
// - Ctrl/Cmd + Shift + Z / Shift + Z (outside inputs): Redo
// - R: Randomize (outside inputs)
// ---------------------------------------------------------------------------

import { useEffect } from 'react'
import { useStore } from '@/core/store'

export function useKeyboardShortcuts() {
  const { undo, redo, randomize } = useStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)

      const isMac = typeof navigator !== 'undefined' && /Macintosh|Mac OS X/i.test(navigator.userAgent)
      const modifier = isMac ? e.metaKey : e.ctrlKey

      // Undo: Ctrl+Z or Cmd+Z (without Shift)
      if (modifier && !e.shiftKey && e.key.toLowerCase() === 'z') {
        if (!isInput) {
          e.preventDefault()
          undo()
          return
        }
      }

      // Redo: Ctrl+Shift+Z, Cmd+Shift+Z, or Ctrl+Y
      if ((modifier && e.shiftKey && e.key.toLowerCase() === 'z') || (modifier && e.key.toLowerCase() === 'y')) {
        if (!isInput) {
          e.preventDefault()
          redo()
          return
        }
      }

      // If user is inside an input, don't intercept non-modifier keys
      if (isInput) return

      // Shift + Z (when not in input) as alternate redo
      if (e.shiftKey && !modifier && e.key === 'Z') {
        e.preventDefault()
        redo()
        return
      }

      // R for Randomize (when not in input and without modifiers)
      if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault()
        randomize()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [undo, redo, randomize])
}
