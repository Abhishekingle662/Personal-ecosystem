import { useNavigate } from 'react-router-dom'
import {
  Mail,
  Linkedin,
  Briefcase,
  BookOpen,
  CheckSquare,
  Code2,
  ArrowRight,
  Zap,
} from 'lucide-react'
import { Card, CardHeader, CardContent, CardFooter, Button } from '@micro/ui'
import { useJobs, useEmails, usePosts } from '@micro/storage'
import { useBusEvent, type BusEvent } from '@micro/data-bus'
import { useActivityStore, type ActivityEvent } from '../stores/activityStore'

const APP_CARDS = [
  { path: '/email', label: 'Email Composer', description: 'Draft and manage email replies with AI assistance.', icon: <Mail className="h-5 w-5" />, action: 'Open inbox' },
  { path: '/linkedin', label: 'LinkedIn Generator', description: 'Generate posts and build your content library.', icon: <Linkedin className="h-5 w-5" />, action: 'Create post' },
  { path: '/jobs', label: 'Job Tracker', description: 'Track applications through the pipeline.', icon: <Briefcase className="h-5 w-5" />, action: 'View board' },
  { path: '/journal', label: 'Journal', description: 'Daily journaling with mood tracking.', icon: <BookOpen className="h-5 w-5" />, action: "Today's entry" },
  { path: '/habits', label: 'Habits', description: 'Track daily and weekly habits with streaks.', icon: <CheckSquare className="h-5 w-5" />, action: 'Check in' },
  { path: '/snippets', label: 'Snippets', description: 'Personal code snippet library with fuzzy search.', icon: <Code2 className="h-5 w-5" />, action: 'Browse' },
]

const EVENT_LABELS: Record<BusEvent, string> = {
  'job:added': 'Added a job',
  'job:updated': 'Updated a job',
  'email:draft-created': 'Saved an email draft',
  'email:archived': 'Archived an email',
  'post:published': 'Published a post',
  'journal:saved': 'Wrote a journal entry',
  'habit:completed': 'Completed a habit',
  'search:global': 'Searched',
}

const EVENT_ICON: Record<BusEvent, React.ReactNode> = {
  'job:added': <Briefcase className="h-3.5 w-3.5" />,
  'job:updated': <Briefcase className="h-3.5 w-3.5" />,
  'email:draft-created': <Mail className="h-3.5 w-3.5" />,
  'email:archived': <Mail className="h-3.5 w-3.5" />,
  'post:published': <Linkedin className="h-3.5 w-3.5" />,
  'journal:saved': <BookOpen className="h-3.5 w-3.5" />,
  'habit:completed': <CheckSquare className="h-3.5 w-3.5" />,
  'search:global': <Zap className="h-3.5 w-3.5" />,
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins.toString()}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs.toString()}h ago`
  return `${Math.floor(hrs / 24).toString()}d ago`
}

// Separate component so hooks-in-loop is isolated per event
function BusListener({ event }: { event: BusEvent }) {
  const push = useActivityStore((s) => s.push)
  useBusEvent(event, (payload) => push(event, payload))
  return null
}

const TRACKED_EVENTS: BusEvent[] = [
  'job:added', 'job:updated', 'email:draft-created', 'email:archived',
  'post:published', 'journal:saved', 'habit:completed',
]

export default function Home() {
  const navigate = useNavigate()
  const { data: jobs } = useJobs()
  const { data: emails } = useEmails()
  const { data: posts } = usePosts()
  const events = useActivityStore((s) => s.events)

  const openJobs = jobs.filter((j) => !['rejected', 'withdrawn', 'offer'].includes(j.status)).length
  const inboxEmails = emails.filter((e) => e.status === 'inbox').length
  const draftPosts = posts.filter((p) => p.status === 'draft').length
  const recentEvents = events.slice(0, 10)

  return (
    <div className="p-6 space-y-6">
      {/* Mount bus listeners */}
      {TRACKED_EVENTS.map((ev) => <BusListener key={ev} event={ev} />)}

      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] font-mono">micro-os</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Your personal productivity ecosystem.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Open applications', value: openJobs, path: '/jobs' },
          { label: 'Inbox emails', value: inboxEmails, path: '/email' },
          { label: 'Draft posts', value: draftPosts, path: '/linkedin' },
        ].map(({ label, value, path }) => (
          <button key={path} onClick={() => navigate(path)}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-left hover:border-[var(--border-hover)] transition-colors">
            <p className="text-2xl font-mono font-bold text-[var(--text-primary)]">{value}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{label}</p>
          </button>
        ))}
      </div>

      {/* App grid */}
      <div>
        <h2 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Apps</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {APP_CARDS.map((app) => (
            <Card key={app.path} className="cursor-pointer hover:border-[var(--border-hover)] transition-colors" onClick={() => navigate(app.path)}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--accent)]">{app.icon}</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{app.label}</span>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-xs text-[var(--text-muted)]">{app.description}</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="gap-1 text-xs text-[var(--accent)]"
                  onClick={(e) => { e.stopPropagation(); navigate(app.path) }}>
                  {app.action}<ArrowRight className="h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Activity feed */}
      <div>
        <h2 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Recent activity</h2>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] divide-y divide-[var(--border)]">
          {recentEvents.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <div className="text-center space-y-1">
                <p className="text-sm text-[var(--text-muted)]">No recent activity</p>
                <p className="text-xs text-[var(--text-muted)]">Actions across all apps will appear here</p>
              </div>
            </div>
          ) : (
            recentEvents.map((ev: ActivityEvent) => (
              <div key={ev.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex-shrink-0 text-[var(--text-muted)]">{EVENT_ICON[ev.event]}</span>
                <p className="flex-1 text-sm text-[var(--text-secondary)]">{EVENT_LABELS[ev.event]}</p>
                <span className="font-mono text-xs text-[var(--text-muted)]">{timeAgo(ev.timestamp)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
