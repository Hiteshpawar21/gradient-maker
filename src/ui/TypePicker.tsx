import type { GradientType } from '@/core/types'
import { useStore } from '@/core/store'
import { cn } from '@/lib/utils'

interface TypeOption {
  type: GradientType
  name: string
  thumbnailStyle: string
}

const BASIC_TYPES: TypeOption[] = [
  {
    type: 'linear',
    name: 'Linear',
    thumbnailStyle: 'linear-gradient(135deg, #3b82f6, #ec4899)',
  },
  {
    type: 'radial',
    name: 'Radial',
    thumbnailStyle: 'radial-gradient(circle at center, #3b82f6, #8b5cf6)',
  },
  {
    type: 'conic',
    name: 'Conic',
    thumbnailStyle:
      'conic-gradient(from 0deg at 50% 50%, #3b82f6, #ec4899, #3b82f6)',
  },
  {
    type: 'diamond',
    name: 'Diamond',
    thumbnailStyle:
      'linear-gradient(45deg, #3b82f6 25%, #8b5cf6 25%, #8b5cf6 50%, #3b82f6 50%, #3b82f6 75%, #8b5cf6 75%)',
  },
  {
    type: 'repeating-linear',
    name: 'Rep. Linear',
    thumbnailStyle:
      'repeating-linear-gradient(45deg, #3b82f6, #3b82f6 4px, #8b5cf6 4px, #8b5cf6 8px)',
  },
  {
    type: 'repeating-radial',
    name: 'Rep. Radial',
    thumbnailStyle:
      'repeating-radial-gradient(circle, #3b82f6, #3b82f6 3px, #8b5cf6 3px, #8b5cf6 6px)',
  },
  {
    type: 'repeating-conic',
    name: 'Rep. Conic',
    thumbnailStyle:
      'repeating-conic-gradient(#3b82f6 0% 25%, #8b5cf6 0% 50%)',
  },
]

const ADVANCED_TYPES: TypeOption[] = [
  {
    type: 'mesh',
    name: 'Mesh',
    thumbnailStyle:
      'radial-gradient(at 0% 0%, #ef4444 0px, transparent 50%), radial-gradient(at 100% 0%, #22c55e 0px, transparent 50%), radial-gradient(at 50% 100%, #3b82f6 0px, transparent 50%), #eab308',
  },
  {
    type: 'freeform',
    name: 'Freeform',
    thumbnailStyle:
      'radial-gradient(circle at 25% 25%, #ef4444 0%, transparent 45%), radial-gradient(circle at 75% 75%, #3b82f6 0%, transparent 45%), #8b5cf6',
  },
  {
    type: 'shape-blur',
    name: 'Shape Blur',
    thumbnailStyle:
      'radial-gradient(ellipse at 40% 40%, #ff6b6b 0%, #4ecdc4 75%)',
  },
  {
    type: 'layered',
    name: 'Layered',
    thumbnailStyle:
      'linear-gradient(to right, rgba(59,130,246,0.8), rgba(236,72,153,0.8)), linear-gradient(to bottom, #10b981, #6366f1)',
  },
  {
    type: 'reflected',
    name: 'Reflected',
    thumbnailStyle:
      'linear-gradient(to right, #3b82f6, #8b5cf6 50%, #3b82f6)',
  },
  {
    type: 'aurora',
    name: 'Aurora',
    thumbnailStyle:
      'linear-gradient(180deg, #0f172a 0%, #065f46 40%, #0284c7 70%, #a855f7 100%)',
  },
  {
    type: 'holographic',
    name: 'Holographic',
    thumbnailStyle:
      'conic-gradient(from 45deg, #67e8f9, #c084fc, #f9a8d4, #67e8f9)',
  },
  {
    type: 'grainy',
    name: 'Grainy',
    thumbnailStyle:
      'linear-gradient(135deg, #f43f5e, #fbbf24)',
  },
]

export default function TypePicker() {
  const currentType = useStore((state) => state.project.gradient.type)
  const setType = useStore((state) => state.setType)

  const renderGroup = (title: string, types: TypeOption[]) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <span className="text-[10px] text-muted-foreground font-mono">
          {types.length} types
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {types.map((item) => {
          const isActive = currentType === item.type
          return (
            <button
              key={item.type}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => setType(item.type)}
              className={cn(
                'group relative flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all outline-none',
                isActive
                  ? 'border-primary bg-primary/10 ring-1 ring-primary shadow-xs'
                  : 'border-border/60 bg-card hover:bg-muted/50 hover:border-border',
              )}
            >
              <div
                className="size-7 rounded-md shrink-0 shadow-xs border border-black/10 transition-transform group-hover:scale-105"
                style={{ background: item.thumbnailStyle }}
              />
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'text-[11px] font-medium truncate leading-tight',
                    isActive ? 'text-primary font-semibold' : 'text-foreground',
                  )}
                >
                  {item.name}
                </p>
                <p className="text-[9px] text-muted-foreground capitalize truncate">
                  {item.type.includes('repeating') ? 'Pattern' : 'Gradient'}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {renderGroup('Basic Gradients', BASIC_TYPES)}
      {renderGroup('Advanced Gradients', ADVANCED_TYPES)}
    </div>
  )
}
