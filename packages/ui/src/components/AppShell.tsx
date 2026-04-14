import * as React from 'react'

import { cn } from '../lib/utils'

interface AppShellProps {
  sidebar: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function AppShell({ sidebar, children, className }: AppShellProps) {
  return (
    <div className={cn('flex h-screen w-full overflow-hidden bg-[var(--bg-primary)]', className)}>
      {sidebar}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
