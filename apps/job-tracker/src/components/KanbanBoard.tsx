import { useState } from 'react'
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { useJobs } from '@micro/storage'
import { EmptyState } from '@micro/ui'
import { Briefcase } from 'lucide-react'
import { KanbanColumn } from './KanbanColumn'
import { JobCard } from './JobCard'
import { JOB_COLUMNS, type JobStatus, type Job } from '../types'
import { useJobTrackerStore } from '../store'

export function KanbanBoard() {
  const { data: jobs, update } = useJobs()
  const { openDrawer } = useJobTrackerStore()
  const [activeJob, setActiveJob] = useState<Job | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    const job = jobs.find((j) => j.id === event.active.id)
    setActiveJob(job ?? null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveJob(null)
    const { active, over } = event
    if (!over) return

    const jobId = active.id as number
    const overId = over.id

    // over.id is either a column status string or another job's id
    const targetStatus = JOB_COLUMNS.includes(overId as JobStatus)
      ? (overId as JobStatus)
      : jobs.find((j) => j.id === overId)?.status

    if (!targetStatus) return

    const job = jobs.find((j) => j.id === jobId)
    if (!job || job.status === targetStatus) return

    await update(jobId, { status: targetStatus })
  }

  const jobsByStatus = (status: JobStatus) =>
    jobs.filter((j) => j.status === status)

  const totalJobs = jobs.length

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={(e) => void handleDragEnd(e)}
    >
      {totalJobs === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-5 w-5" />}
          heading="No jobs tracked yet"
          subtext="Add your first application to start tracking your pipeline."
          action={{ label: 'Add job', onClick: () => openDrawer(null) }}
        />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {JOB_COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              jobs={jobsByStatus(status)}
              onCardClick={(id) => openDrawer(id)}
              onAddClick={() => openDrawer(null)}
            />
          ))}
        </div>
      )}

      <DragOverlay>
        {activeJob && (
          <JobCard job={activeJob} onClick={() => undefined} />
        )}
      </DragOverlay>
    </DndContext>
  )
}
