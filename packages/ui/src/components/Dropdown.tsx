import * as React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { Check, ChevronRight, Circle } from 'lucide-react'

import { cn } from '../lib/utils'

const Dropdown = DropdownMenuPrimitive.Root
const DropdownTrigger = DropdownMenuPrimitive.Trigger
const DropdownPortal = DropdownMenuPrimitive.Portal
const DropdownSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn('my-1 h-px bg-[var(--border)]', className)}
    {...props}
  />
))
DropdownSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-[8rem] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-1 shadow-xl',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center gap-2 rounded px-2 py-1.5 text-sm text-[var(--text-secondary)] outline-none transition-colors',
      'hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]',
      'focus:bg-[var(--bg-tertiary)] focus:text-[var(--text-primary)]',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
))
DropdownItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      'px-2 py-1.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
))
DropdownLabel.displayName = DropdownMenuPrimitive.Label.displayName

export {
  Dropdown,
  DropdownTrigger,
  DropdownPortal,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  Check,
  ChevronRight,
  Circle,
}
