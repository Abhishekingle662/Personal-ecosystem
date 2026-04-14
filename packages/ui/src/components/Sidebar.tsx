import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '../lib/utils'

interface SidebarContextValue {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
}

const SidebarContext = React.createContext<SidebarContextValue>({
  collapsed: false,
  setCollapsed: () => undefined,
})

export function useSidebar() {
  return React.useContext(SidebarContext)
}

interface SidebarProps {
  children: React.ReactNode
  defaultCollapsed?: boolean
  className?: string
}

export function Sidebar({ children, defaultCollapsed = false, className }: SidebarProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <aside
        className={cn(
          'relative flex h-full flex-col border-r border-[var(--border)] bg-[var(--bg-secondary)] transition-all duration-200',
          collapsed ? 'w-14' : 'w-60',
          className,
        )}
      >
        {children}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </aside>
    </SidebarContext.Provider>
  )
}

interface SidebarNavItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
  className?: string
}

export function SidebarNavItem({
  icon,
  label,
  active = false,
  onClick,
  className,
}: SidebarNavItemProps) {
  const { collapsed } = useSidebar()

  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={cn(
        'flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors',
        active
          ? 'bg-[var(--accent-muted)] text-[var(--accent-hover)]'
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]',
        collapsed && 'justify-center px-2',
        className,
      )}
    >
      <span className="flex-shrink-0">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  )
}

export function SidebarSection({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-0.5 px-2', className)}>{children}</div>
  )
}

export function SidebarLogo({ collapsed }: { collapsed?: boolean }) {
  const ctx = useSidebar()
  const isCollapsed = collapsed ?? ctx.collapsed

  return (
    <div className="flex h-14 items-center px-4 border-b border-[var(--border)]">
      <span
        className={cn(
          'font-mono font-bold text-[var(--accent)] tracking-tight transition-all',
          isCollapsed ? 'text-sm' : 'text-base',
        )}
      >
        {isCollapsed ? 'μ' : 'micro-os'}
      </span>
    </div>
  )
}
