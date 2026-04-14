import { useState } from 'react'
import { AlertTriangle, Eye, EyeOff } from 'lucide-react'
import {
  Button,
  Input,
  Label,
  Card,
  CardHeader,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  toast,
} from '@micro/ui'
import { db } from '@micro/storage'

type AiTierPref = 'local' | 'free' | 'paid'

const GROQ_KEY = 'micro-os-groq-key'
const ANTHROPIC_KEY = 'micro-os-anthropic-key'
const TIER_PREF_KEY = 'micro-os-ai-tier'

export default function Settings() {
  const [groqKey, setGroqKey] = useState(localStorage.getItem(GROQ_KEY) ?? '')
  const [anthropicKey, setAnthropicKey] = useState(localStorage.getItem(ANTHROPIC_KEY) ?? '')
  const [tierPref, setTierPref] = useState<AiTierPref>(
    (localStorage.getItem(TIER_PREF_KEY) as AiTierPref) ?? 'free',
  )
  const [showGroq, setShowGroq] = useState(false)
  const [showAnthropic, setShowAnthropic] = useState(false)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)

  const saveKeys = () => {
    localStorage.setItem(GROQ_KEY, groqKey)
    localStorage.setItem(ANTHROPIC_KEY, anthropicKey)
    localStorage.setItem(TIER_PREF_KEY, tierPref)
    toast.success('Settings saved')
  }

  const handleClearAll = async () => {
    await db.delete()
    localStorage.clear()
    setClearDialogOpen(false)
    toast.success('All data cleared — reload to reinitialize')
    setTimeout(() => window.location.reload(), 1500)
  }

  const handleExport = async () => {
    const [emails, jobs, posts, journal, habits, snippets] = await Promise.all([
      db.emails.toArray(),
      db.jobs.toArray(),
      db.posts.toArray(),
      db.journal.toArray(),
      db.habits.toArray(),
      db.snippets.toArray(),
    ])

    const data = { emails, jobs, posts, journal, habits, snippets, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `micro-os-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Data exported')
  }

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Configure AI providers and manage your data.
        </p>
      </div>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">AI API Keys</h2>
          <div className="flex items-start gap-2 rounded-md bg-[var(--warning-muted)] border border-[var(--warning)]/20 p-3 mt-2">
            <AlertTriangle className="h-4 w-4 text-[var(--warning)] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--warning)]">
              Keys are stored in <code className="font-mono">localStorage</code> — client-side only.
              Never share your browser storage or use this on a shared machine.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="groq-key">Groq API Key</Label>
            <div className="relative">
              <Input
                id="groq-key"
                type={showGroq ? 'text' : 'password'}
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_…"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowGroq((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                {showGroq ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Free tier — llama3-8b-8192. Get a key at console.groq.com
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="anthropic-key">Anthropic API Key</Label>
            <div className="relative">
              <Input
                id="anthropic-key"
                type={showAnthropic ? 'text' : 'password'}
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                placeholder="sk-ant-…"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowAnthropic((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                {showAnthropic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Paid fallback — claude-haiku-3-5-20241022. Get a key at console.anthropic.com
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Default AI Tier</Label>
            <div className="flex gap-2">
              {(['local', 'free', 'paid'] as AiTierPref[]).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setTierPref(tier)}
                  className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                    tierPref === tier
                      ? 'border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent-hover)]'
                      : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              local = Ollama (localhost:11434) · free = Groq · paid = Anthropic
            </p>
          </div>

          <Button onClick={saveKeys}>Save settings</Button>
        </CardContent>
      </Card>

      {/* Data management */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Data</h2>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button variant="outline" onClick={() => void handleExport()}>
            Export all data as JSON
          </Button>
          <Button variant="destructive" onClick={() => setClearDialogOpen(true)}>
            Clear all data
          </Button>
        </CardContent>
      </Card>

      {/* Confirm clear dialog */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear all data?</DialogTitle>
            <DialogDescription>
              This permanently deletes all jobs, emails, posts, journal entries, habits, and
              snippets from IndexedDB. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void handleClearAll()}>
              Delete everything
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
