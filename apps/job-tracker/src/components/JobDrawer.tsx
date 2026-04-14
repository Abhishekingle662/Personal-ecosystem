import { useState, useEffect } from 'react'
import { X, Plus, Trash2, ExternalLink, Sparkles } from 'lucide-react'
import {
  Button,
  Input,
  Textarea,
  Label,
  toast,
} from '@micro/ui'
import { useJobs, type Job, type JobContact, type JobStatus } from '@micro/storage'
import { useAI } from '@micro/ai'
import { emit } from '@micro/data-bus'
import { COLUMN_LABELS, COLUMN_COLORS, JOB_COLUMNS } from '../types'

interface JobDrawerProps {
  jobId: number | null
  open: boolean
  onClose: () => void
}

const EMPTY_JOB: Omit<Job, 'id'> = {
  company: '',
  role: '',
  status: 'wishlist',
  appliedAt: new Date().toISOString(),
  notes: '',
  url: '',
  salary: '',
  contacts: [],
}

export function JobDrawer({ jobId, open, onClose }: JobDrawerProps) {
  const { data: jobs, add, update, remove } = useJobs()
  const { loading: aiLoading, run: runAI } = useAI()
  const [form, setForm] = useState<Omit<Job, 'id'>>(EMPTY_JOB)
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [newContactName, setNewContactName] = useState('')
  const [newContactUrl, setNewContactUrl] = useState('')

  const isNew = jobId === null
  const job = jobs.find((j) => j.id === jobId)

  useEffect(() => {
    if (open) {
      setForm(job ? { ...job } : { ...EMPTY_JOB })
      setInterviewQuestions([])
      setDeleteConfirm(false)
    }
  }, [open, job])

  if (!open) return null

  const handleSave = async () => {
    if (!form.company.trim() || !form.role.trim()) {
      toast.error('Company and role are required')
      return
    }
    if (isNew) {
      const id = await add(form)
      emit('job:added', { id, company: form.company, role: form.role })
      toast.success('Job added')
    } else if (jobId !== null) {
      await update(jobId, form)
      emit('job:updated', { id: jobId, status: form.status })
      toast.success('Job updated')
    }
    onClose()
  }

  const handleStatusChange = async (status: JobStatus) => {
    setForm((f) => ({ ...f, status }))
    if (!isNew && jobId !== null) {
      await update(jobId, { status })
      emit('job:updated', { id: jobId, status })
      // TODO: wire to n8n webhook when status changes to 'technical' or 'offer'
      // Payload: { type: 'job-status-change', company: form.company, role: form.role, status, jobId }
    }
  }

  const handleDelete = async () => {
    if (!jobId) return
    await remove(jobId)
    toast.success('Job deleted')
    onClose()
  }

  const handleAICoach = async () => {
    const result = await runAI({
      prompt: `I'm interviewing for a ${form.role} role at ${form.company}. Give me exactly 5 likely interview questions I should prepare for. Format as a numbered list, one question per line.`,
      systemPrompt:
        'You are a senior engineering career coach. Be specific and practical. Focus on technical and behavioral questions relevant to the role.',
      tier: 'free',
      taskType: 'generate',
    })
    if (result.error) {
      toast.error('AI unavailable — check your API key in Settings')
      return
    }
    const lines = result.content
      .split('\n')
      .map((l) => l.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean)
      .slice(0, 5)
    setInterviewQuestions(lines)
  }

  const addContact = () => {
    if (!newContactName.trim()) return
    const contact: JobContact = {
      name: newContactName.trim(),
      linkedinUrl: newContactUrl.trim() || undefined,
    }
    setForm((f) => ({ ...f, contacts: [...f.contacts, contact] }))
    setNewContactName('')
    setNewContactUrl('')
  }

  const removeContact = (idx: number) => {
    setForm((f) => ({ ...f, contacts: f.contacts.filter((_, i) => i !== idx) }))
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-[var(--border)] bg-[var(--bg-secondary)] shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            {isNew ? 'Add job' : `${form.role} at ${form.company}`}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 p-5">
          {/* Status pills */}
          <div>
            <Label className="mb-2 block">Status</Label>
            <div className="flex flex-wrap gap-1.5">
              {JOB_COLUMNS.map((s) => (
                <button
                  key={s}
                  onClick={() => void handleStatusChange(s)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors border ${
                    form.status === s
                      ? 'text-white border-transparent'
                      : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
                  }`}
                  style={
                    form.status === s
                      ? { backgroundColor: COLUMN_COLORS[s] }
                      : {}
                  }
                >
                  {COLUMN_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Core fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                placeholder="Stripe"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                placeholder="Senior Engineer"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="salary">Salary range</Label>
              <Input
                id="salary"
                value={form.salary ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))}
                placeholder="$120k–$140k"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="applied-at">Applied date</Label>
              <Input
                id="applied-at"
                type="date"
                value={form.appliedAt ? form.appliedAt.split('T')[0] : ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, appliedAt: new Date(e.target.value).toISOString() }))
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="url">Job URL</Label>
            <div className="relative">
              <Input
                id="url"
                value={form.url ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                placeholder="https://company.com/jobs/…"
                className="pr-9"
              />
              {form.url && (
                <a
                  href={form.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--accent)]"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (markdown)</Label>
            <Textarea
              id="notes"
              value={form.notes ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="## Notes&#10;&#10;Key details, prep notes, follow-ups…"
              className="min-h-[120px] font-mono text-xs"
            />
          </div>

          {/* Contacts */}
          <div className="space-y-2">
            <Label>Contacts</Label>
            {form.contacts.map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-tertiary)] px-3 py-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-primary)] truncate">{c.name}</p>
                  {c.linkedinUrl && (
                    <a
                      href={c.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[var(--accent)] hover:underline truncate block"
                    >
                      {c.linkedinUrl}
                    </a>
                  )}
                </div>
                <button
                  onClick={() => removeContact(i)}
                  className="text-[var(--text-muted)] hover:text-[var(--destructive)] transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                placeholder="Name"
                className="flex-1"
              />
              <Input
                value={newContactUrl}
                onChange={(e) => setNewContactUrl(e.target.value)}
                placeholder="LinkedIn URL"
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={addContact}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* AI Coach */}
          <div className="space-y-3 rounded-lg border border-[var(--border)] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">AI Interview Coach</p>
                <p className="text-xs text-[var(--text-muted)]">
                  5 likely questions for this role
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void handleAICoach()}
                disabled={aiLoading || !form.company || !form.role}
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                {aiLoading ? 'Thinking…' : 'Prep me'}
              </Button>
            </div>
            {interviewQuestions.length > 0 && (
              <ol className="space-y-2">
                {interviewQuestions.map((q, i) => (
                  <li key={i} className="flex gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="font-mono text-xs text-[var(--text-muted)] mt-0.5 flex-shrink-0">
                      {(i + 1).toString()}.
                    </span>
                    <span>{q}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-[var(--border)] p-5 space-y-3">
          <div className="flex gap-3">
            <Button className="flex-1" onClick={() => void handleSave()}>
              {isNew ? 'Add job' : 'Save changes'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
          {!isNew && (
            <div className="flex gap-3">
              {deleteConfirm ? (
                <>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => void handleDelete()}
                  >
                    Confirm delete
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[var(--destructive)] hover:text-[var(--destructive)]"
                  onClick={() => setDeleteConfirm(true)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Delete job
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
