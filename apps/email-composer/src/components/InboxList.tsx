import { useState } from 'react'
import { Archive, Plus } from 'lucide-react'
import { Badge, Button, EmptyState, Input, Label, Textarea, Dialog, DialogContent, DialogHeader, DialogTitle, toast } from '@micro/ui'
import { useEmails, type Email } from '@micro/storage'
import { emit } from '@micro/data-bus'
import { useEmailStore } from '../store'

const STATUS_BADGE: Record<Email['status'], React.ReactElement> = {
  inbox: <Badge variant="info">Inbox</Badge>,
  'draft-replied': <Badge variant="warning">Draft</Badge>,
  archived: <Badge variant="default">Archived</Badge>,
}

export function InboxList() {
  const { data: emails, add, update } = useEmails()
  const { filter, setFilter, selectEmail } = useEmailStore()
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newSubject, setNewSubject] = useState('')
  const [newFrom, setNewFrom] = useState('')
  const [newBody, setNewBody] = useState('')

  const filtered = emails.filter((e) => {
    if (filter === 'needs-reply') return e.status === 'inbox'
    if (filter === 'archived') return e.status === 'archived'
    return true
  })

  const handleArchive = async (e: React.MouseEvent, email: Email) => {
    e.stopPropagation()
    if (!email.id) return
    await update(email.id, { status: 'archived' })
    emit('email:archived', { id: email.id })
    toast.success('Archived')
  }

  const handleAddEmail = async () => {
    if (!newSubject.trim() || !newFrom.trim()) {
      toast.error('Subject and sender are required')
      return
    }
    await add({
      subject: newSubject,
      from: newFrom,
      to: 'me@example.com',
      date: new Date().toISOString(),
      labels: [],
      threadId: `manual-${Date.now().toString()}`,
      status: 'inbox',
      body: newBody,
    })
    setAddDialogOpen(false)
    setNewSubject('')
    setNewFrom('')
    setNewBody('')
    toast.success('Email added')
  }

  return (
    <div className="flex h-full flex-col">
      {/* Filter tabs */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-3">
        <div className="flex gap-1">
          {(['all', 'needs-reply', 'archived'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-[var(--accent-muted)] text-[var(--accent-hover)]'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              {f === 'all' ? 'All' : f === 'needs-reply' ? 'Needs reply' : 'Archived'}
            </button>
          ))}
        </div>
        <Button size="sm" variant="outline" onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add email
        </Button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
        {filtered.length === 0 ? (
          <EmptyState
            heading="No emails"
            subtext="Add an email to start drafting replies."
            action={{ label: 'Add email', onClick: () => setAddDialogOpen(true) }}
          />
        ) : (
          filtered.map((email) => (
            <button
              key={email.id}
              onClick={() => selectEmail(email.id!)}
              className="flex w-full items-start gap-3 px-6 py-4 text-left hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {email.from}
                  </p>
                  {STATUS_BADGE[email.status]}
                </div>
                <p className="text-sm text-[var(--text-secondary)] truncate">{email.subject}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {new Date(email.date).toLocaleDateString()}
                </p>
              </div>
              {email.status !== 'archived' && (
                <button
                  onClick={(e) => void handleArchive(e, email)}
                  className="flex-shrink-0 rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label="Archive"
                >
                  <Archive className="h-4 w-4" />
                </button>
              )}
            </button>
          ))
        )}
      </div>

      {/* Add email dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add email manually</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="email-from">From *</Label>
              <Input
                id="email-from"
                value={newFrom}
                onChange={(e) => setNewFrom(e.target.value)}
                placeholder="sender@company.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email-subject">Subject *</Label>
              <Input
                id="email-subject"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Re: Your application…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email-body">Body (paste email content)</Label>
              <Textarea
                id="email-body"
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                placeholder="Paste the email body here…"
                className="min-h-[120px]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => void handleAddEmail()}>Add email</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
