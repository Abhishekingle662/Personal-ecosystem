import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ExternalLink } from 'lucide-react'
import { Badge } from '@micro/ui'
import type { Job } from '../types'
import { COLUMN_COLORS } from '../types'

interface JobCardProps {
  job: Job
  onClick: () => void
}

function daysSince(dateStr: string | undefined): number {
  if (!dateStr) return 0
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
}

export function JobCard({ job, onClick }: JobCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: job.id! })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const initials = job.company
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const days = daysSince(job.appliedAt)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3 cursor-pointer hover:border-[var(--border-hover)] transition-colors select-none"
    >
      <div className="flex items-start gap-2.5">
        {/* Company initial avatar */}
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
          style={{ backgroundColor: COLUMN_COLORS[job.status] }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[var(--text-primary)]">
            {job.role}
          </p>
          <p className="truncate text-xs text-[var(--text-muted)]">{job.company}</p>
        </div>
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
      {job.appliedAt && (
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          {days === 0 ? 'Applied today' : `${days.toString()}d ago`}
        </p>
      )}
      {job.salary && (
        <Badge variant="default" className="mt-2 text-xs font-mono">
          {job.salary}
        </Badge>
      )}
    </div>
  )
}
