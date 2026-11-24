import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import {
  Undo2,
  Redo2,
  Shuffle,
  RotateCcw,
  Upload,
  Download,
  Sun,
  Moon,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react'
import { useStore } from '@/core/store'
import { Button } from '@/components/ui/button'

export default function TopBar() {
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    randomize,
    reset,
    loadProject,
    theme,
    toggleTheme,
    exportPanelOpen,
    setExportPanelOpen,
    mobileDrawerOpen,
    setMobileDrawerOpen,
  } = useStore()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json: unknown = JSON.parse(event.target?.result as string)
        const res = loadProject(json)
        if (!res.success) {
          alert(`Invalid project file: ${res.error ?? 'Unknown error'}`)
        }
      } catch {
        alert('Could not parse JSON file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <header className="h-14 border-b border-border/80 bg-background/95 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between gap-2 shrink-0 z-20">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-xs">
          <Sparkles className="size-4 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
            Gradient Maker
            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-full bg-primary/10 text-primary border border-primary/20">
              v1.0
            </span>
          </h1>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={undo}
          disabled={!canUndo()}
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
          className="text-muted-foreground hover:text-foreground"
        >
          <Undo2 className="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={redo}
          disabled={!canRedo()}
          title="Redo (Ctrl+Shift+Z)"
          aria-label="Redo"
          className="text-muted-foreground hover:text-foreground"
        >
          <Redo2 className="size-4" />
        </Button>

        <div className="h-4 w-px bg-border/80 mx-0.5 sm:mx-1" />

        <Button
          variant="outline"
          size="sm"
          onClick={randomize}
          title="Randomize palette & gradient (R)"
          className="h-8 gap-1.5 text-xs font-medium"
        >
          <Shuffle className="size-3.5 text-indigo-500" />
          <span className="hidden sm:inline">Randomize</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          title="Reset to default project"
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </Button>

        <div className="h-4 w-px bg-border/80 mx-0.5 sm:mx-1" />

        {/* Import JSON */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImport}
          className="hidden"
          aria-label="Import Project JSON"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          title="Import JSON Project"
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Upload className="size-3.5" />
          <span className="hidden md:inline">Import</span>
        </Button>

        {/* Export trigger */}
        <Button
          variant={exportPanelOpen ? 'default' : 'outline'}
          size="sm"
          onClick={() => setExportPanelOpen(!exportPanelOpen)}
          title="Export Gradient"
          className="h-8 gap-1.5 text-xs font-semibold"
        >
          <Download className="size-3.5" />
          <span>Export</span>
        </Button>

        <div className="h-4 w-px bg-border/80 mx-0.5 sm:mx-1" />

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
          className="text-muted-foreground hover:text-foreground"
        >
          {theme === 'dark' ? (
            <Sun className="size-4 text-amber-400" />
          ) : (
            <Moon className="size-4 text-slate-700" />
          )}
        </Button>

        {/* Mobile controls drawer toggle */}
        <Button
          variant={mobileDrawerOpen ? 'default' : 'outline'}
          size="icon-sm"
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="lg:hidden"
          title="Toggle controls drawer"
          aria-label="Toggle controls drawer"
        >
          <SlidersHorizontal className="size-4" />
        </Button>
      </div>
    </header>
  )
}
