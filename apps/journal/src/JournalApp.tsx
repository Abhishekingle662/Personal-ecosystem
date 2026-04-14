import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CalendarDays, List, Sparkles } from 'lucide-react'
import {
  Button,
  Textarea,
  Badge,
  Card,
  CardContent,
  EmptyState,
  toast,
} from '@micro/ui'
import { useJournal, type Mood } from '@micro/storage'
import { useAI } from '@micro/ai'
import { emit } from '@micro/data-bus'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const MOOD_OPTIONS: { value: Mood; emoji: string; label: string }[] = [
  { value: 'great', emoji: '😄', label: 'Great' },
  { value: 'good', emoji: '🙂', label: 'Good' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'bad', emoji: '😕', label: 'Bad' },
  { value: 'terrible', emoji: '😞', label: 'Terrible' },
]

const MOOD_SCORE: Record<Mood, number> = {
  great: 5, good: 4, neutral: 3, bad: 2, terrible: 1,
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]!
}

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export default function JournalApp() {
  const { data: entries, add, update } = useJournal()
  const { loading: aiLoading, run: runAI } = useAI()
  const [searchParams] = useSearchParams()
  const [view, setView] = useState<'today' | 'history'>('today')
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<Mood>('neutral')
  const [tags, setTags] = useState('')
  const [reflectionPrompt, setReflectionPrompt] = useState('')
  const [saveTimer, setSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const currentEntry = entries.find((e) => e.date === selectedDate)

  useEffect(() => {
    if (currentEntry) {
      setContent(currentEntry.content)
      setMood(currentEntry.mood)
      setTags(currentEntry.tags.join(', '))
    } else {
      setContent('')
      setMood('neutral')
      setTags('')
    }
  }, [selectedDate, currentEntry?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      const entry = entries.find((e) => e.id === Number(id))
      if (entry) { setSelectedDate(entry.date); setView('today') }
    }
  }, [searchParams, entries])

  const saveEntry = useCallback(async (text: string, currentMood: Mood, currentTags: string) => {
    const tagList = currentTags.split(',').map((t) => t.trim()).filter(Boolean)
    const wc = wordCount(text)
    if (currentEntry?.id) {
      await update(currentEntry.id, { content: text, mood: currentMood, tags: tagList, wordCount: wc })
    } else if (text.trim()) {
      await add({ date: selectedDate, content: text, mood: currentMood, tags: tagList, wordCount: wc })
    }
    emit('journal:saved', { date: selectedDate })
  }, [currentEntry, selectedDate, add, update])

  const handleContentChange = (text: string) => {
    setContent(text)
    if (saveTimer) clearTimeout(saveTimer)
    const t = setTimeout(() => { void saveEntry(text, mood, tags) }, 500)
    setSaveTimer(t)
  }

  const handleMoodChange = (m: Mood) => { setMood(m); void saveEntry(content, m, tags) }
  const handleTagsBlur = () => { void saveEntry(content, mood, tags) }

  const handleReflectionPrompt = async () => {
    const recent = entries.slice(0, 3).map((e) => e.content.slice(0, 200))
    const result = await runAI({
      prompt: `Based on these recent journal entries, generate one thoughtful journaling prompt:\n\n${recent.map((e, i) => `Entry ${(i + 1).toString()}: "${e}"`).join('\n')}\n\nReturn only the prompt.`,
      systemPrompt: 'You are a thoughtful journaling coach. Generate prompts that encourage self-reflection and growth.',
      tier: 'free', taskType: 'generate',
    })
    if (result.error) { toast.error('AI unavailable — check your API key in Settings'); return }
    setReflectionPrompt(result.content.trim())
  }

  const moodTrendData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i))
    const dateKey = d.toISOString().split('T')[0]!
    const entry = entries.find((e) => e.date === dateKey)
    return { date: `${(d.getMonth() + 1).toString()}/${d.getDate().toString()}`, score: entry ? MOOD_SCORE[entry.mood] : null }
  }).filter((d) => d.score !== null)

  const streak = (() => {
    let count = 0
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]!
      if (entries.find((e) => e.date === key)) { count++ } else if (i > 0) { break }
    }
    return count
  })()

  const totalWords = entries.reduce((sum, e) => sum + e.wordCount, 0)
  const isToday = selectedDate === todayStr()

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-3">
        <h1 className="text-base font-semibold text-[var(--text-primary)]">Journal</h1>
        <div className="flex rounded-md border border-[var(--border)] overflow-hidden">
          {([['today', 'Today', <CalendarDays className="h-3.5 w-3.5" />], ['history', 'History', <List className="h-3.5 w-3.5" />]] as const).map(([v, label, icon], i) => (
            <button key={v} onClick={() => setView(v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${i > 0 ? 'border-l border-[var(--border)]' : ''} ${view === v ? 'bg-[var(--accent-muted)] text-[var(--accent-hover)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)]'}`}>
              {icon}{label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {view === 'today' ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-5 max-w-2xl mx-auto w-full">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-sm text-[var(--text-muted)]">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h2>
              {!isToday && <Badge variant="default">Past entry</Badge>}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-[var(--text-muted)]">How are you feeling?</p>
              <div className="flex gap-2">
                {MOOD_OPTIONS.map((m) => (
                  <button key={m.value} onClick={() => handleMoodChange(m.value)} title={m.label}
                    className={`flex flex-col items-center gap-1 rounded-lg border px-3 py-2 text-lg transition-colors ${mood === m.value ? 'border-[var(--accent)] bg-[var(--accent-muted)]' : 'border-[var(--border)] hover:border-[var(--border-hover)]'}`}>
                    <span>{m.emoji}</span>
                    <span className="text-xs text-[var(--text-muted)]">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {reflectionPrompt && (
              <div className="rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-muted)] p-4">
                <p className="text-xs font-medium text-[var(--accent-hover)] mb-1">Reflection prompt</p>
                <p className="text-sm text-[var(--text-secondary)] italic">{reflectionPrompt}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[var(--text-muted)]">Entry</p>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[var(--text-muted)]">{wordCount(content).toString()} words</span>
                  <Button size="sm" variant="ghost" onClick={() => void handleReflectionPrompt()} disabled={aiLoading} className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />{aiLoading ? 'Thinking…' : 'Prompt me'}
                  </Button>
                </div>
              </div>
              <Textarea value={content} onChange={(e) => handleContentChange(e.target.value)} placeholder="What's on your mind today?" className="min-h-[280px] text-sm leading-relaxed" />
              <p className="text-xs text-[var(--text-muted)]">Auto-saves as you type</p>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-[var(--text-muted)]">Tags (comma-separated)</p>
              <input value={tags} onChange={(e) => setTags(e.target.value)} onBlur={handleTagsBlur} placeholder="work, reflection, goals"
                className="flex h-9 w-full rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" />
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-3 gap-3">
              {[['Entries', entries.length, 'var(--text-primary)'], ['Day streak', streak, 'var(--accent)'], ['Words written', totalWords.toLocaleString(), 'var(--text-primary)']].map(([label, value, color]) => (
                <Card key={String(label)}><CardContent className="pt-4">
                  <p className="text-2xl font-mono font-bold" style={{ color: String(color) }}>{String(value)}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{String(label)}</p>
                </CardContent></Card>
              ))}
            </div>

            {moodTrendData.length > 1 && (
              <Card><CardContent className="pt-4">
                <p className="text-sm font-medium text-[var(--text-primary)] mb-3">Mood trend (30 days)</p>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={moodTrendData}>
                    <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis domain={[1, 5]} hide />
                    <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px' }}
                      formatter={(v: number) => MOOD_OPTIONS.find((m) => MOOD_SCORE[m.value] === v)?.label ?? v} />
                    <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2} dot={false} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent></Card>
            )}

            {entries.length === 0 ? (
              <EmptyState heading="No journal entries yet" subtext="Start writing today." />
            ) : (
              <div className="space-y-2">
                {entries.map((entry) => (
                  <button key={entry.id} onClick={() => { setSelectedDate(entry.date); setView('today') }}
                    className="flex w-full items-start gap-4 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-left hover:border-[var(--border-hover)] transition-colors">
                    <div className="flex-shrink-0 text-center">
                      <p className="font-mono text-xs text-[var(--text-muted)]">
                        {new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-lg mt-0.5">{MOOD_OPTIONS.find((m) => m.value === entry.mood)?.emoji}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{entry.content || '(empty)'}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-[var(--text-muted)] font-mono">{entry.wordCount} words</span>
                        {entry.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="default" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
