import * as React from 'react'

import { cn } from '../lib/utils'

interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

export function Kbd({ children, className, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center rounded border border-[var(--border)] bg-[var(--bg-tertiary)] px-1.5 py-0.5 font-mono text-xs text-[var(--text-muted)]',
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  )
}
