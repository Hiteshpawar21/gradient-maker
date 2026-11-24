import { useRef, useCallback } from 'react'
import type { ColorStop } from '@/core/types'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, Trash2, ArrowLeftRight, AlignJustify, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StopEditorProps {
  stops: ColorStop[]
  selectedId: string | null
  onSelect: (id: string) => void
  onAdd: (position?: number, color?: string) => void
  onRemove: (id: string) => void
  onMove: (id: string, position: number) => void
  onUpdateOpacity: (id: string, opacity: number) => void
  onDistribute: () => void
  onReverse: () => void
}

function SortableStopItem({
  stop,
  isSelected,
  onSelect,
  onRemove,
  canRemove,
}: {
  stop: ColorStop
  isSelected: boolean
  onSelect: () => void
  onRemove: () => void
  canRemove: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: stop.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-1.5 p-1 rounded-lg border text-xs transition-all ${
        isSelected
          ? 'border-primary bg-primary/10 ring-1 ring-primary'
          : 'border-border/70 bg-card hover:border-border'
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground/60 hover:text-muted-foreground p-0.5"
        aria-label="Drag to reorder stop"
      >
        <GripVertical className="size-3" />
      </button>

      <button
        type="button"
        onClick={onSelect}
        className="flex items-center gap-1.5 text-left focus:outline-none"
      >
        <span
          className="size-4 rounded-full border border-black/20 shadow-2xs shrink-0"
          style={{ backgroundColor: stop.color, opacity: stop.opacity }}
        />
        <span className="font-mono text-[11px] text-foreground">{stop.position}%</span>
      </button>

      <button
        type="button"
        disabled={!canRemove}
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        title={canRemove ? 'Remove stop' : 'Minimum 2 stops required'}
        className={`p-0.5 rounded text-muted-foreground hover:text-destructive transition-colors ${
          !canRemove ? 'opacity-30 cursor-not-allowed' : ''
        }`}
        aria-label="Remove stop"
      >
        <Trash2 className="size-3" />
      </button>
    </div>
  )
}

export function StopEditor({
  stops,
  selectedId,
  onSelect,
  onAdd,
  onRemove,
  onMove,
  onUpdateOpacity,
  onDistribute,
  onReverse,
}: StopEditorProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const selectedStop = stops.find((s) => s.id === selectedId) ?? stops[0]

  // Click on the gradient bar to add a new stop at that exact position
  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current) return
    const rect = barRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = Math.max(0, Math.min(100, Math.round((x / rect.width) * 100)))
    onAdd(percent)
  }

  // Pointer drag for handles on the gradient bar
  const handleHandlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>, stopId: string) => {
      e.stopPropagation()
      onSelect(stopId)
      const target = e.currentTarget
      target.setPointerCapture(e.pointerId)

      const onPointerMove = (moveEv: PointerEvent) => {
        if (!barRef.current) return
        const rect = barRef.current.getBoundingClientRect()
        const x = moveEv.clientX - rect.left
        const percent = Math.max(0, Math.min(100, Math.round((x / rect.width) * 100)))
        onMove(stopId, percent)
      }

      const onPointerUp = (upEv: PointerEvent) => {
        target.releasePointerCapture(upEv.pointerId)
        target.removeEventListener('pointermove', onPointerMove)
        target.removeEventListener('pointerup', onPointerUp)
      }

      target.addEventListener('pointermove', onPointerMove)
      target.addEventListener('pointerup', onPointerUp)
    },
    [onMove, onSelect],
  )

  // Drag reordering with dnd-kit
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = stops.findIndex((s) => s.id === active.id)
      const newIndex = stops.findIndex((s) => s.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1) {
        // Swap or reorder positions
        const targetPos = stops[newIndex].position
        onMove(stops[oldIndex].id, targetPos)
      }
    }
  }

  const gradientCss =
    stops.length > 0
      ? `linear-gradient(to right, ${stops
          .map((s) => `${s.color} ${s.position}%`)
          .join(', ')})`
      : '#3b82f6'

  return (
    <div className="space-y-4">
      {/* Visual Interactive Gradient Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Gradient Stops Bar</span>
          <span className="text-[10px]">Click anywhere to add stop</span>
        </div>

        <div className="relative pt-2 pb-5 px-1 select-none">
          {/* Gradient Track */}
          <div
            ref={barRef}
            onClick={handleBarClick}
            className="h-7 w-full rounded-lg border border-border shadow-inner cursor-crosshair relative overflow-hidden"
          >
            {/* Checkerboard behind semi-transparent stops */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, rgba(0,0,0,0.08) 25%, transparent 25%),
                  linear-gradient(-45deg, rgba(0,0,0,0.08) 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.08) 75%),
                  linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.08) 75%)
                `,
                backgroundSize: '12px 12px',
                backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
              }}
            />
            {/* Gradient Fill */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{ background: gradientCss }}
            />
          </div>

          {/* Draggable Stop Handles positioned along the track */}
          {stops.map((stop) => {
            const isSelected = stop.id === selectedId
            return (
              <button
                key={stop.id}
                type="button"
                role="slider"
                aria-label={`Color stop at ${stop.position}%`}
                aria-valuenow={stop.position}
                aria-valuemin={0}
                aria-valuemax={100}
                onPointerDown={(e) => {
                  handleHandlePointerDown(e, stop.id)
                }}
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-5 rounded-full border-2 shadow-md transition-transform cursor-ew-resize focus:outline-none ${
                  isSelected
                    ? 'border-white ring-2 ring-primary scale-125 z-20'
                    : 'border-white/90 hover:scale-110 z-10'
                }`}
                style={{
                  left: `${stop.position}%`,
                  backgroundColor: stop.color,
                }}
              />
            )
          })}
        </div>
      </div>

      {/* Selected Stop Details (Position, Opacity, Actions) */}
      {stops.length > 0 && (
        <div className="p-2.5 rounded-lg border border-border/80 bg-muted/30 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <span
                className="size-3 rounded-full border border-black/20 shrink-0"
                style={{ backgroundColor: selectedStop.color, opacity: selectedStop.opacity }}
              />
              Selected Stop
            </span>
            <Button
              variant="ghost"
              size="xs"
              disabled={stops.length <= 2}
              onClick={() => {
                onRemove(selectedStop.id)
              }}
              className="h-6 text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 text-[11px]"
            >
              <Trash2 className="size-3" />
              Delete Stop
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Position numeric input & slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <label htmlFor="stop-pos-input">Position</label>
                <span className="font-mono">{selectedStop.position}%</span>
              </div>
              <input
                id="stop-pos-input"
                type="range"
                min={0}
                max={100}
                value={selectedStop.position}
                onChange={(e) => {
                  onMove(selectedStop.id, Number(e.target.value))
                }}
                className="w-full accent-primary h-1.5 rounded cursor-pointer"
              />
            </div>

            {/* Per-stop opacity numeric input & slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <label htmlFor="stop-opacity-input">Stop Opacity</label>
                <span className="font-mono">{Math.round(selectedStop.opacity * 100)}%</span>
              </div>
              <input
                id="stop-opacity-input"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={selectedStop.opacity}
                onChange={(e) => {
                  onUpdateOpacity(selectedStop.id, Number(e.target.value))
                }}
                className="w-full accent-primary h-1.5 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Stop List (Sortable via dnd-kit) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">All Stops ({stops.length})</span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="xs"
              onClick={onDistribute}
              title="Distribute stops evenly (0% to 100%)"
              className="h-6 text-[10px] gap-1"
            >
              <AlignJustify className="size-3" />
              Distribute
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={onReverse}
              title="Reverse gradient stop colors"
              className="h-6 text-[10px] gap-1"
            >
              <ArrowLeftRight className="size-3" />
              Reverse
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => {
                onAdd()
              }}
              className="h-6 text-[10px] gap-1 text-primary border-primary/40"
            >
              <Plus className="size-3" />
              Add Stop
            </Button>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={stops} strategy={horizontalListSortingStrategy}>
            <div className="flex flex-wrap gap-1.5">
              {stops.map((stop) => (
                <SortableStopItem
                  key={stop.id}
                  stop={stop}
                  isSelected={stop.id === selectedId}
                  onSelect={() => {
                    onSelect(stop.id)
                  }}
                  onRemove={() => {
                    onRemove(stop.id)
                  }}
                  canRemove={stops.length > 2}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}
