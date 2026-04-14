import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BarChart2, Kanban, Plus } from 'lucide-react'
import { Button } from '@micro/ui'
import { KanbanBoard } from './components/KanbanBoard'
import { AnalyticsView } from './components/AnalyticsView'
import { JobDrawer } from './components/JobDrawer'
import { useJobTrackerStore } from './store'

export default function JobTrackerApp() {
  const { view, setView, drawerOpen, selectedJobId, openDrawer, closeDrawer } =
    useJobTrackerStore()
  const [searchParams] = useSearchParams()

  // Support deep-link from command palette: /jobs?id=5
  useEffect(() => {
    const id = searchParams.get('id')
    if (id) openDrawer(Number(id))
  }, [searchParams, openDrawer])

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-3">
        <h1 className="text-base font-semibold text-[var(--text-primary)]">Job Tracker</h1>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-md border border-[var(--border)] overflow-hidden">
            <button
              onClick={() => setView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${
                view === 'kanban'
                  ? 'bg-[var(--accent-muted)] text-[var(--accent-hover)]'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
              Board
            </button>
            <button
              onClick={() => setView('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors border-l border-[var(--border)] ${
                view === 'analytics'
                  ? 'bg-[var(--accent-muted)] text-[var(--accent-hover)]'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5" />
              Analytics
            </button>
          </div>

          <Button size="sm" onClick={() => openDrawer(null)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add job
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {view === 'kanban' ? <KanbanBoard /> : <AnalyticsView />}
      </div>

      {/* Detail drawer */}
      <JobDrawer
        jobId={selectedJobId}
        open={drawerOpen}
        onClose={closeDrawer}
      />
    </div>
  )
}
