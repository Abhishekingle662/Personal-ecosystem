import { useState } from 'react'
import { ArrowLeft, Sparkles, Save, Send } from 'lucide-react'
import { Button, Textarea, Label, toast } from '@micro/ui'
import { useEmails } from '@micro/storage'
import { useAI } from '@micro/ai'
import { emit } from '@micro/data-bus'
import { useEmailStore } from '../store'

type Tone = 'professional' | 'friendly' | 'direct' | 'brief'

const TONE_LABELS: Record<Tone, string> = {
  professional: 'Professional',
  friendly: 'Friendly',
  direct: 'Direct',
  brief: 'Brief',
}

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

function readingTime(words: number): string {
  const mins = Math.ceil(words / 200)
  return mins <= 1 ? '< 1 min read' : `${mins.toString()} min read`
}

export function ComposeView() {
  const { data: emails, update } = useEmails()
  const { loading: aiLoading, run: runAI } = useAI()
  const {
    selectedEmailId,
    tone,
    context,
    draftVariants,
    selectedVariant,
    setView,
    setTone,
    setContext,
    setDraftVariants,
    setSelectedVariant,
  } = useEmailStore()

  const email = emails.find((e) => e.id === selectedEmailId)
  const [editedDraft, setEditedDraft] = useState(draftVariants[selectedVariant])

  const handleGenerate = async () => {
    if (!email) return

    const systemPrompt = `You are an expert email writer. Write concise, ${tone} email replies. Return exactly 2 variants separated by the delimiter "---VARIANT---". No preamble, no explanation.`
    const prompt = `Original email:
From: ${email.from}
Subject: ${email.subject}
Body: ${email.body ?? '(no body)'}

${context ? `My goal for this reply: ${context}` : ''}

Write 2 different ${tone} reply variants.`

    const result = await runAI({ prompt, systemPrompt, tier: 'free', taskType: 'draft' })

    if (result.error) {
      toast.error('AI unavailable — check your API key in Settings')
      return
    }

    const parts = result.content.split('---VARIANT---').map((s) => s.trim())
    const v1 = parts[0] ?? ''
    const v2 = parts[1] ?? parts[0] ?? ''
    setDraftVariants([v1, v2])
    setEditedDraft(v1)
    setSelectedVariant(0)
  }

  const handleVariantSelect = (i: 0 | 1) => {
    setSelectedVariant(i)
    setEditedDraft(draftVariants[i])
  }

  const handleSaveDraft = async () => {
    if (!email?.id || !editedDraft.trim()) return
    await update(email.id, { status: 'draft-replied', draftReply: editedDraft })
    emit('email:draft-created', { emailId: email.id })
    toast.success('Draft saved')
  }

  const handleSendToGmail = () => {
    // TODO: wire to n8n webhook at localhost:5678
    // Payload: { type: 'create-draft', to: email?.from, subject: `Re: ${email?.subject}`, body: editedDraft, threadId: email?.threadId }
    toast.info('n8n webhook not configured — see Settings')
  }

  const words = wordCount(editedDraft)

  if (!email) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-[var(--text-muted)]">No email selected</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[var(--border)] px-6 py-3">
        <button
          onClick={() => setView('inbox')}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
            {email.subject}
          </p>
          <p className="text-xs text-[var(--text-muted)]">From: {email.from}</p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: original email */}
        <div className="w-1/2 overflow-y-auto border-r border-[var(--border)] p-5">
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
            Original
          </p>
          <div className="space-y-2 text-sm text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
            {email.body ?? '(No body — add email content when creating)'}
          </div>
        </div>

        {/* Right: AI draft area */}
        <div className="flex w-1/2 flex-col overflow-y-auto p-5 space-y-4">
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            AI Draft
          </p>

          {/* Context + tone */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="reply-context">Goal of this reply (optional)</Label>
              <Textarea
                id="reply-context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g. Confirm the interview time and ask about the tech stack"
                className="min-h-[60px] text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Tone</Label>
              <div className="flex gap-1.5 flex-wrap">
                {(Object.keys(TONE_LABELS) as Tone[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`rounded-md border px-3 py-1 text-xs transition-colors ${
                      tone === t
                        ? 'border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent-hover)]'
                        : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
                    }`}
                  >
                    {TONE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => void handleGenerate()}
              disabled={aiLoading}
              className="w-full"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {aiLoading ? 'Generating…' : 'Generate 2 variants'}
            </Button>
          </div>

          {/* Variants */}
          {(draftVariants[0] || draftVariants[1]) && (
            <div className="space-y-2">
              <div className="flex gap-2">
                {([0, 1] as const).map((i) => (
                  <button
                    key={i}
                    onClick={() => handleVariantSelect(i)}
                    className={`flex-1 rounded-md border px-3 py-1.5 text-xs transition-colors ${
                      selectedVariant === i
                        ? 'border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent-hover)]'
                        : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)]'
                    }`}
                  >
                    Variant {(i + 1).toString()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Edit area */}
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="draft-edit">Edit draft</Label>
              {editedDraft && (
                <span className="text-xs text-[var(--text-muted)] font-mono">
                  {words.toString()} words · {readingTime(words)}
                </span>
              )}
            </div>
            <Textarea
              id="draft-edit"
              value={editedDraft}
              onChange={(e) => setEditedDraft(e.target.value)}
              placeholder="Generate a draft above, or write your reply here…"
              className="min-h-[200px] text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleSaveDraft()}
              disabled={!editedDraft.trim()}
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Save draft
            </Button>
            <Button
              size="sm"
              onClick={handleSendToGmail}
              disabled={!editedDraft.trim()}
            >
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Send to Gmail
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
