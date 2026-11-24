import { useState } from 'react'
import { Download, ChevronRight, Copy } from 'lucide-react'
import { AccordionItem } from './Accordion'
import { useStore } from '@/core/store'
import { hasStops } from '@/core/types'
import { Button } from '@/components/ui/button'

export function ExportPanel({
  isOpen,
  onToggle,
}: {
  isOpen: boolean
  onToggle: () => void
}) {
  const { project } = useStore()
  const [copied, setCopied] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Minimal CSS representation for preview
  const sampleCSS = `background: linear-gradient(${
    hasStops(project.gradient)
      ? project.gradient.stops.map((s) => `${s.color} ${s.position}%`).join(', ')
      : '#3b82f6, #8b5cf6'
  });`

  const handleCopy = () => {
    void navigator.clipboard.writeText(sampleCSS)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <AccordionItem
      id="export"
      title="Export"
      icon={<Download className="size-4" />}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-3 pt-1">
        <div className="flex flex-wrap gap-1.5">
          {['CSS', 'Tailwind', 'SVG', 'PNG', 'JSON'].map((fmt) => (
            <span
              key={fmt}
              className="px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground border border-border"
            >
              {fmt}
            </span>
          ))}
        </div>

        <div className="relative rounded-md border border-border bg-muted/60 p-2 font-mono text-[10px] text-foreground overflow-x-auto">
          <code>{sampleCSS}</code>
        </div>

        <div className="flex gap-2">
          <Button
            variant="default"
            size="xs"
            onClick={handleCopy}
            className="flex-1 h-7 text-[11px] gap-1"
          >
            <Copy className="size-3" />
            {copied ? 'Copied!' : 'Copy CSS'}
          </Button>
          <Button
            variant="outline"
            size="xs"
            className="h-7 text-[11px] gap-1"
          >
            <Download className="size-3" />
            Download
          </Button>
        </div>

        {/* Advanced sub-controls (collapsed by default) */}
        <div className="pt-2 border-t border-border/50">
          <button
            type="button"
            onClick={() => {
              setShowAdvanced(!showAdvanced)
            }}
            className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight
              className={`size-3 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
            />
            Advanced export options
          </button>
          {showAdvanced && (
            <div className="mt-2 space-y-2 pl-3 border-l-2 border-border/60 text-[11px]">
              <div className="flex items-center justify-between">
                <span>Raster Scale Factor</span>
                <span className="font-mono text-foreground">2x (Retina)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Embed Noise in SVG</span>
                <span className="font-mono text-foreground">Yes (feTurbulence)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AccordionItem>
  )
}
