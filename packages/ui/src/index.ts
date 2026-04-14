// Utility
export { cn } from './lib/utils'

// Components
export { Button, buttonVariants } from './components/Button'
export type { ButtonProps } from './components/Button'

export { Input } from './components/Input'
export type { InputProps } from './components/Input'

export { Textarea } from './components/Textarea'
export type { TextareaProps } from './components/Textarea'

export { Label } from './components/Label'

export { Card, CardHeader, CardContent, CardFooter } from './components/Card'

export { Badge, badgeVariants } from './components/Badge'
export type { BadgeProps } from './components/Badge'

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './components/Dialog'

export {
  Dropdown,
  DropdownTrigger,
  DropdownPortal,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
} from './components/Dropdown'

export {
  Sidebar,
  SidebarNavItem,
  SidebarSection,
  SidebarLogo,
  useSidebar,
} from './components/Sidebar'

export { AppShell } from './components/AppShell'

export { EmptyState } from './components/EmptyState'

export { LoadingSpinner, LoadingScreen } from './components/LoadingSpinner'

export { Toaster, toast } from './components/Toast'

export { Kbd } from './components/Kbd'

export { Skeleton } from './components/Skeleton'

// CSS path — consumers import '@micro/ui/src/styles/globals.css' directly in their Vite entry
