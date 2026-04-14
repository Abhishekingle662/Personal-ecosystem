import { Sparkles, ArrowRight } from 'lucide-react'
import { Button, Textarea, Label } from '@micro/ui'
import { useAI } from '@micro/ai'
import { toast } from '@micro/ui'
import { useLinkedInStore } from '../store'

type PostFormat = 'story' | 'insight' | 'list' | 'hot-take' | 'behind-the-scenes'
type PostAudience = 'engineers' | 'hiring-managers' | 'founders' | 'general'

const FORMAT_LABELS: Record<PostFormat, string> = {
  story: 'Story',
  insight: 'Insight',
  list: 'List',
  'hot-take': 'Hot take',
  'behind-the-scenes': 'Behind the scenes',
}

const AUDIENCE_LABELS: Record<PostAudience, string> = {
  engineers: 'Engineers',
  'hiring-managers': 'Hiring managers',
  founders: 'Founders',
  general: 'General',
}

export function IdeaGenerator() {
  const { loading, run: runAI } = useAI()
  const {
    format, audience, ideaPrompt, hooks,
    setFormat, setAudience, setIdeaPrompt, setHooks, selectHook,
  } = useLinkedInStore()

  const handleGenerate = async () => {
    if (!ideaPrompt.trim()) {
      toast.error('Enter an idea or experience first')
      return
    }

    const result = await runAI({
      prompt: `Create 3 compelling LinkedIn post opening lines (hooks) for this idea:

"${ideaPrompt}"

Format: ${FORMAT_LABELS[format]}
Target audience: ${AUDIENCE_LABELS[audience]}

Return exactly 3 hooks, one per line, numbered 1-3. Each hook should be 1-2 sentences max. Make them attention-grabbing and specific.`,
      systemPrompt:
        'You are a LinkedIn content strategist who writes high-engagement posts for technical professionals. Write hooks that are specific, credible, and create curiosity without being clickbait.',
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
      .slice(0, 3)

    setHooks(lines)
  }

  const handleSelectHook = async (hook: string) => {
    const { setPostContent, setPostVariants, setHashtags } = useLinkedInStore.getState()

    const result = await runAI({
      prompt: `Expand this LinkedIn post hook into a full post:

Hook: "${hook}"

Original idea: "${ideaPrompt}"
Format: ${FORMAT_LABELS[format]}
Audience: ${AUDIENCE_LABELS[audience]}

Write a complete LinkedIn post (max 3000 chars). Use line breaks for readability. End with a question to drive engagement. Then on a new line write "---HASHTAGS---" followed by 5 relevant hashtags.`,
      systemPrompt:
        'You are a LinkedIn content strategist. Write authentic, value-driven posts that perform well with technical audiences. No fluff, no generic advice.',
      tier: 'free',
      taskType: 'draft',
    })

    if (result.error) {
      toast.error('AI unavailable — check your API key in Settings')
      selectHook(hook)
      setPostContent(hook)
      return
    }

    const [postPart, hashtagPart] = result.content.split('---HASHTAGS---')
    const post = postPart?.trim() ?? hook
    const tags = hashtagPart
      ? hashtagPart
          .trim()
          .split(/[\s,]+/)
          .map((t) => t.replace(/^#/, '').trim())
          .filter(Boolean)
          .slice(0, 5)
      : []

    setPostContent(post)
    setHashtags(tags)
    selectHook(hook)

    // Generate 2 variants
    const variantResult = await runAI({
      prompt: `Write 2 alternative versions of this LinkedIn post, each with a different angle or tone:

Original: "${post}"

Return variant 1, then "---VARIANT---", then variant 2.`,
      tier: 'free',
      taskType: 'generate',
      cache: false,
    })

    if (!variantResult.error) {
      const parts = variantResult.content.split('---VARIANT---').map((s) => s.trim())
      setPostVariants(parts.slice(0, 2))
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Generate a post</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Describe your idea and get 3 opening hooks to choose from.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="idea-prompt">What's the core idea or experience?</Label>
        <Textarea
          id="idea-prompt"
          value={ideaPrompt}
          onChange={(e) => setIdeaPrompt(e.target.value)}
          placeholder="e.g. I spent a weekend building a type-safe event bus and learned something surprising about discriminated unions…"
          className="min-h-[80px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Format</Label>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(FORMAT_LABELS) as PostFormat[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                  format === f
                    ? 'border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent-hover)]'
                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
                }`}
              >
                {FORMAT_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Audience</Label>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(AUDIENCE_LABELS) as PostAudience[]).map((a) => (
              <button
                key={a}
                onClick={() => setAudience(a)}
                className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                  audience === a
                    ? 'border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent-hover)]'
                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
                }`}
              >
                {AUDIENCE_LABELS[a]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button
        onClick={() => void handleGenerate()}
        disabled={loading || !ideaPrompt.trim()}
        className="w-full"
      >
        <Sparkles className="h-3.5 w-3.5 mr-1.5" />
        {loading ? 'Generating hooks…' : 'Generate 3 hooks'}
      </Button>

      {hooks.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Choose a hook to expand
          </p>
          {hooks.map((hook, i) => (
            <button
              key={i}
              onClick={() => void handleSelectHook(hook)}
              disabled={loading}
              className="flex w-full items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-left hover:border-[var(--accent)] hover:bg-[var(--accent-muted)] transition-colors group"
            >
              <span className="font-mono text-xs text-[var(--text-muted)] mt-0.5 flex-shrink-0">
                {(i + 1).toString()}.
              </span>
              <p className="flex-1 text-sm text-[var(--text-primary)]">{hook}</p>
              <ArrowRight className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors mt-0.5" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
