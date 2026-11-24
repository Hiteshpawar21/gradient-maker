import { useEffect, useState } from 'react'
import TopBar from './TopBar'
import Preview from './Preview'
import TypePicker from './TypePicker'
import {
  ColorsPanel,
  TypeSettingsPanel,
  GlobalPanel,
  NoisePanel,
  ExportPanel,
} from './panels'
import { useStore } from '@/core/store'
import { X, Layers, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Shell() {
  const {
    theme,
    exportPanelOpen,
    setExportPanelOpen,
    mobileDrawerOpen,
    setMobileDrawerOpen,
  } = useStore()

  // Manage open state for each of the 5 accordions (Colors & Type settings open by default)
  const [openPanels, setOpenPanels] = useState({
    colors: true,
    'type-settings': true,
    global: false,
    noise: false,
    export: false,
  })

  const togglePanel = (panelId: 'colors' | 'type-settings' | 'global' | 'noise' | 'export') => {
    setOpenPanels((prev) => ({
      ...prev,
      [panelId]: !prev[panelId],
    }))
  }

  // Synchronize document theme class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  // Keyboard shortcuts (Ctrl+Z, Shift+Z, R)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger when typing in input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault()
          useStore.getState().redo()
        } else {
          e.preventDefault()
          useStore.getState().undo()
        }
      } else if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        useStore.getState().randomize()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground font-sans">
      {/* Top Bar */}
      <TopBar />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Sidebar (Desktop): TypePicker + Accordions */}
        <aside
          aria-label="Gradient controls sidebar"
          className="hidden lg:flex flex-col w-96 shrink-0 border-r border-border/80 bg-sidebar/50 backdrop-blur-xs overflow-y-auto overflow-x-hidden p-4 space-y-5"
        >
          {/* Section: Gradient Type Selector */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 px-0.5">
              <Layers className="size-3.5" />
              Gradient Types
            </h2>
            <TypePicker />
          </div>

          <div className="h-px bg-border/60" />

          {/* Section: Accordion Control Panels */}
          <div className="space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 px-0.5">
              Configuration Panels
            </h2>
            <ColorsPanel
              isOpen={openPanels.colors}
              onToggle={() => togglePanel('colors')}
            />
            <TypeSettingsPanel
              isOpen={openPanels['type-settings']}
              onToggle={() => togglePanel('type-settings')}
            />
            <GlobalPanel
              isOpen={openPanels.global}
              onToggle={() => togglePanel('global')}
            />
            <NoisePanel
              isOpen={openPanels.noise}
              onToggle={() => togglePanel('noise')}
            />
            <ExportPanel
              isOpen={openPanels.export}
              onToggle={() => togglePanel('export')}
            />
          </div>
        </aside>

        {/* Center: Live Preview Stage */}
        <main
          aria-label="Gradient preview area"
          className="flex-1 flex flex-col min-w-0 min-h-0 relative overflow-hidden"
        >
          <Preview />
        </main>

        {/* Right Sidebar / Slide-over Panel for Export (Desktop) */}
        {exportPanelOpen && (
          <aside
            aria-label="Export sidebar"
            className="hidden lg:flex flex-col w-84 shrink-0 border-l border-border/80 bg-sidebar/95 backdrop-blur-md p-4 overflow-y-auto space-y-4 animate-in slide-in-from-right duration-200 z-10"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border/80">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Download className="size-4 text-primary" />
                <span>Export Gradient</span>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setExportPanelOpen(false)}
                title="Close export panel"
                aria-label="Close export panel"
              >
                <X className="size-4" />
              </Button>
            </div>
            <ExportPanel
              isOpen={true}
              onToggle={() => {
                // persistent open in right sidebar
              }}
            />
          </aside>
        )}

        {/* Mobile Layout: Controls in bottom drawer / sheet (< 1024px) */}
        <div
          className={`lg:hidden fixed inset-x-0 bottom-0 bg-background/95 backdrop-blur-xl border-t border-border shadow-2xl transition-transform duration-300 ease-in-out z-30 flex flex-col ${
            mobileDrawerOpen
              ? 'translate-y-0 h-[65vh]'
              : 'translate-y-[calc(100%-48px)] h-[65vh]'
          }`}
        >
          {/* Drawer Handle / Header */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="h-12 w-full px-4 flex items-center justify-between border-b border-border/60 bg-muted/30 select-none"
            aria-label={mobileDrawerOpen ? 'Collapse controls' : 'Expand controls'}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 rounded-full bg-muted-foreground/30 mx-auto" />
              <span className="text-xs font-semibold text-foreground">
                {mobileDrawerOpen ? 'Gradient Controls' : 'Tap to open Controls'}
              </span>
            </div>
            <span className="text-[11px] text-primary font-medium">
              {mobileDrawerOpen ? 'Collapse' : 'Expand'}
            </span>
          </button>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Gradient Type
              </h2>
              <TypePicker />
            </div>

            <div className="h-px bg-border/60" />

            <div className="space-y-2.5 pb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Panels
              </h2>
              <ColorsPanel
                isOpen={openPanels.colors}
                onToggle={() => togglePanel('colors')}
              />
              <TypeSettingsPanel
                isOpen={openPanels['type-settings']}
                onToggle={() => togglePanel('type-settings')}
              />
              <GlobalPanel
                isOpen={openPanels.global}
                onToggle={() => togglePanel('global')}
              />
              <NoisePanel
                isOpen={openPanels.noise}
                onToggle={() => togglePanel('noise')}
              />
              <ExportPanel
                isOpen={openPanels.export}
                onToggle={() => togglePanel('export')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
