import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccordionItemProps {
  id: string
  title: string
  icon?: ReactNode
  badge?: string
  isOpen: boolean
  onToggle: () => void
  children: ReactNode
  className?: string
}

export function AccordionItem({
  id,
  title,
  icon,
  badge,
  isOpen,
  onToggle,
  children,
  className,
}: AccordionItemProps) {
  const contentId = `panel-content-${id}`
  const buttonId = `panel-header-${id}`

  return (
    <div
      className={cn(
        'border border-border/70 rounded-xl bg-card text-card-foreground shadow-xs overflow-hidden transition-colors',
        isOpen ? 'border-primary/30 ring-1 ring-primary/10' : 'hover:border-border',
        className,
      )}
    >
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={onToggle}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left font-medium text-sm transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring select-none"
        >
          <span className="flex items-center gap-2.5 truncate">
            {icon && <span className="text-muted-foreground shrink-0">{icon}</span>}
            <span className="font-semibold text-foreground tracking-tight">{title}</span>
            {badge && (
              <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border/50">
                {badge}
              </span>
            )}
          </span>
          <ChevronDown
            className={cn(
              'size-4 text-muted-foreground transition-transform duration-200 shrink-0',
              isOpen ? 'rotate-180 text-foreground' : '',
            )}
            aria-hidden="true"
          />
        </button>
      </h3>
      <div
        id={contentId}
        role="region"
        aria-labelledby={buttonId}
        className={cn(
          'grid transition-all duration-200 ease-in-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none',
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-1 border-t border-border/40 text-xs text-muted-foreground space-y-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
