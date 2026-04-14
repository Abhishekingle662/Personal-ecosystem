import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import type { Job, JobStatus } from '../types'
import { COLUMN_LABELS, COLUMN_COLORS } from '../types'
import { JobCard } from './JobCard'

interface KanbanColumnProps {
  status: JobStatus
  jobs: Job[]
  onCardClick: (id: number) => void
  onAddClick: () => void
}

export function KanbanColumn({ status, jobs, onCardClick, onAddClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div className="flex w-64 flex-shrink-0 flex-col">
      {/* Column header */}
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: COLUMN_COLORS[status] }}
          />
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            {COLUMN_LABELS[status]}
          </span>
          <span className="rounded-full bg-[var(--bg-tertiary)] px-1.5 py-0.5 text-xs text-[var(--text-muted)]">
            {jobs.length}
          </span>
        </div>
        <button
          onClick={onAddClick}
          className="rounded p-0.5 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          aria-label={`Add job to ${COLUMN_LABELS[status]}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col gap-2 rounded-lg p-2 min-h-24 transition-colors ${
          isOver ? 'bg-[var(--accent-muted)]' : 'bg-[var(--bg-tertiary)]/40'
        }`}
      >
        <SortableContext
          items={jobs.map((j) => j.id!)}
          strategy={verticalListSortingStrategy}
        >
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onClick={() => onCardClick(job.id!)}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}
