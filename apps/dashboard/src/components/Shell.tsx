import { type ReactNode, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home,
  Mail,
  Linkedin,
  Briefcase,
  BookOpen,
  CheckSquare,
  Code2,
  Settings,
} from 'lucide-react'
import {
  AppShell,
  Sidebar,
  SidebarLogo,
  SidebarNavItem,
  SidebarSection,
  Kbd,
} from '@micro/ui'

import { CommandPalette } from './CommandPalette'
import { PWAInstallBanner } from './PWAInstallBanner'

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: <Home className="h-4 w-4" /> },
  { path: '/email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
  { path: '/linkedin', label: 'LinkedIn', icon: <Linkedin className="h-4 w-4" /> },
  { path: '/jobs', label: 'Jobs', icon: <Briefcase className="h-4 w-4" /> },
  { path: '/journal', label: 'Journal', icon: <BookOpen className="h-4 w-4" /> },
  { path: '/habits', label: 'Habits', icon: <CheckSquare className="h-4 w-4" /> },
  { path: '/snippets', label: 'Snippets', icon: <Code2 className="h-4 w-4" /> },
]

interface ShellProps {
  children: ReactNode
}

export function Shell({ children }: ShellProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [paletteOpen, setPaletteOpen] = useState(false)

  // ⌘K / Ctrl+K listener
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setPaletteOpen(true)
    }
  }

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const sidebar = (
    <Sidebar>
      <SidebarLogo />
      <div className="flex flex-1 flex-col justify-between py-3">
        <SidebarSection>
          {NAV_ITEMS.map((item) => (
            <SidebarNavItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              active={isActive(item.path)}
              onClick={() => navigate(item.path)}
            />
          ))}
        </SidebarSection>

        <SidebarSection>
          <SidebarNavItem
            icon={<Settings className="h-4 w-4" />}
            label="Settings"
            active={isActive('/settings')}
            onClick={() => navigate('/settings')}
          />
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex w-full items-center justify-between rounded-md px-2 py-2 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <span className="truncate">Search</span>
            <Kbd>⌘K</Kbd>
          </button>
        </SidebarSection>
      </div>
    </Sidebar>
  )

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div className="h-screen w-full" onKeyDown={handleKeyDown}>
      <PWAInstallBanner />
      <AppShell sidebar={sidebar}>{children}</AppShell>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}
