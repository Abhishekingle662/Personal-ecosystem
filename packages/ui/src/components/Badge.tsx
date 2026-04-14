import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border)]',
        success:
          'bg-[var(--success-muted)] text-[var(--success)] border border-[var(--success)]/20',
        warning:
          'bg-[var(--warning-muted)] text-[var(--warning)] border border-[var(--warning)]/20',
        destructive:
          'bg-[var(--destructive-muted)] text-[var(--destructive)] border border-[var(--destructive)]/20',
        info:
          'bg-[var(--accent-muted)] text-[var(--accent-hover)] border border-[var(--accent)]/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
