import * as React from 'react'

import { cn } from '../lib/utils'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  heading: string
  subtext?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon, heading, subtext, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16 px-6 text-center',
        className,
      )}
    >
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <p className="text-sm font-medium text-[var(--text-primary)]">{heading}</p>
        {subtext && (
          <p className="text-sm text-[var(--text-muted)] max-w-xs">{subtext}</p>
        )}
      </div>
      {action && (
        <Button size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
