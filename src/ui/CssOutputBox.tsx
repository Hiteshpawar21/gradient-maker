// ---------------------------------------------------------------------------
// CssOutputBox Component
// Displays read-only generated CSS rule with one-click copy button.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { Copy, Check, Code } from 'lucide-react'

interface CssOutputBoxProps {
  css: string | null
  gradientType: string
}

export function CssOutputBox({ css, gradientType }: CssOutputBoxProps) {
  const [copied, setCopied] = useState(false)

  const cssRule = css
    ? `background: ${css};`
    : `/* ${gradientType} gradient is rendered via Canvas 2D */`

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(cssRule)
      }
    } catch {
      // Graceful fallback for non-permissioned environments
    }
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <div className="w-full max-w-2xl bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-2.5 shadow-xl flex items-center justify-between gap-3 text-xs font-mono">
      <div className="flex items-center gap-2 overflow-hidden flex-1">
        <Code className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <span
          data-testid="css-output-code"
          className="truncate text-slate-300 select-all"
          title={cssRule}
        >
          {cssRule}
        </span>
      </div>

      <button
        type="button"
        onClick={() => {
          void handleCopy()
        }}
        aria-label="Copy CSS code"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors flex-shrink-0"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] text-emerald-400 font-medium">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px]">Copy CSS</span>
          </>
        )}
      </button>
    </div>
  )
}
