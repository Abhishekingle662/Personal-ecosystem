import { useState } from 'react'
import { Plus, Trash2, Flame, Sparkles } from 'lucide-react'
import { Button, Input, Badge, EmptyState, Dialog, DialogContent, DialogHeader, DialogTitle, toast } from '@micro/ui'
import { useHabits, type Habit, type HabitFrequency } from '@micro/storage'
import { useAI } from '@micro/ai'
import { emit } from '@micro/data-bus'

function todayStr(): string { return new Date().toISOString().split('T')[0]! }

function calcStreak(completions: string[], frequency: HabitFrequency): number {
  if (completions.length === 0) return 0
  const sorted = [...completions].sort().reverse()
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    if (frequency === 'daily') {
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]!
      if (sorted.includes(key)) { streak++ } else if (i > 0) { break }
    } else {
      // weekly: check if any completion in this week
      d.setDate(d.getDate() - i * 7)
      const weekStart = new Date(d); weekStart.setDate(d.getDate() - d.getDay())
      const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 7)
      const hasCompletion = sorted.some((c) => { const cd = new Date(c); return cd >= weekStart && cd < weekEnd })
      if (hasCompletion) { streak++ } else if (i > 0) { break }
    }
  }
  return streak
}

export default function HabitsApp() {
  const { data: habits, add, update, remove } = useHabits()
  const { loading: aiLoading, run: runAI } = useAI()
  const [newName, setNewName] = useState('')
  const [newFreq, setNewFreq] = useState<HabitFrequency>('daily')
  const [addOpen, setAddOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [encouragement, setEncouragement] = useState('')

  const today = todayStr()

  const isCompletedToday = (habit: Habit) => habit.completions.includes(today)

  const handleToggle = async (habit: Habit) => {
    if (!habit.id) return
    const alreadyDone = isCompletedToday(habit)
    const newCompletions = alreadyDone
      ? habit.completions.filter((c) => c !== today)
      : [...habit.completions, today]
    const newStreak = calcStreak(newCompletions, habit.frequency)
    await update(habit.id, { completions: newCompletions, streak: newStreak })
    if (!alreadyDone) emit('habit:completed', { habitId: habit.id, name: habit.name })
  }

  const handleAdd = async () => {
    if (!newName.trim()) { toast.error('Habit name required'); return }
    await add({ name: newName.trim(), frequency: newFreq, completions: [], streak: 0, createdAt: new Date().toISOString() })
    setNewName(''); setAddOpen(false); toast.success('Habit added')
  }

  const handleDelete = async () => {
    if (deleteId === null) return
    await remove(deleteId); setDeleteId(null); toast.success('Habit deleted')
  }

  const handleEncouragement = async () => {
    const summary = habits.map((h) => `${h.name}: ${h.streak.toString()} streak, ${isCompletedToday(h) ? 'done today' : 'not done today'}`).join('\n')
    const result = await runAI({
      prompt: `Here's my habit progress this week:\n${summary}\n\nWrite a brief (2-3 sentence) motivational message based on my progress.`,
      systemPrompt: 'You are an encouraging productivity coach. Be specific, genuine, and brief.',
      tier: 'free', taskType: 'generate',
    })
    if (result.error) { toast.error('AI unavailable'); return }
    setEncouragement(result.content.trim())
  }

  const daily = habits.filter((h) => h.frequency === 'daily')
  const weekly = habits.filter((h) => h.frequency === 'weekly')
  const completedToday = habits.filter(isCompletedToday).length

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-3">
        <h1 className="text-base font-semibold text-[var(--text-primary)]">Habits</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => void handleEncouragement()} disabled={aiLoading || habits.length === 0}>
            <Sparkles className="h-3.5 w-3.5 mr-1" />{aiLoading ? '…' : 'Encourage me'}
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />Add habit
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-2xl mx-auto w-full">
        {habits.length === 0 ? (
          <EmptyState icon={<Flame className="h-5 w-5" />} heading="No habits yet" subtext="Add your first habit to start building streaks." action={{ label: 'Add habit', onClick: () => setAddOpen(true) }} />
        ) : (
          <>
            {/* Progress summary */}
            <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
              <Flame className="h-5 w-5 text-[var(--warning)]" />
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {completedToday}/{habits.length} habits done today
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {completedToday === habits.length ? 'Perfect day! 🎉' : `${(habits.length - completedToday).toString()} remaining`}
                </p>
              </div>
            </div>

            {encouragement && (
              <div className="rounded-lg border border-[var(--success)]/30 bg-[var(--success-muted)] p-4">
                <p className="text-sm text-[var(--text-secondary)]">{encouragement}</p>
              </div>
            )}

            {[['Daily', daily], ['Weekly', weekly]].map(([label, list]) => {
              const habits = list as Habit[]
              if (habits.length === 0) return null
              return (
                <div key={String(label)} className="space-y-2">
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{String(label)}</p>
                  {habits.map((habit) => {
                    const done = isCompletedToday(habit)
                    return (
                      <div key={habit.id} className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                        <button onClick={() => void handleToggle(habit)}
                          className={`h-5 w-5 flex-shrink-0 rounded border-2 transition-colors ${done ? 'border-[var(--success)] bg-[var(--success)]' : 'border-[var(--border-hover)] hover:border-[var(--success)]'}`}>
                          {done && <svg viewBox="0 0 12 12" fill="none" className="h-full w-full p-0.5"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium transition-colors ${done ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-primary)]'}`}>{habit.name}</p>
                        </div>
                        {habit.streak > 0 && (
                          <Badge variant={habit.streak >= 7 ? 'success' : 'default'} className="flex items-center gap-1 font-mono">
                            <Flame className="h-3 w-3" />{habit.streak}
                          </Badge>
                        )}
                        <button onClick={() => setDeleteId(habit.id!)} className="text-[var(--text-muted)] hover:text-[var(--destructive)] transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </>
        )}
      </div>

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add habit</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Deep work block (2h)" onKeyDown={(e) => e.key === 'Enter' && void handleAdd()} />
            <div className="flex gap-2">
              {(['daily', 'weekly'] as HabitFrequency[]).map((f) => (
                <button key={f} onClick={() => setNewFreq(f)}
                  className={`flex-1 rounded-md border py-2 text-sm capitalize transition-colors ${newFreq === f ? 'border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent-hover)]' : 'border-[var(--border)] text-[var(--text-secondary)]'}`}>
                  {f}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button onClick={() => void handleAdd()}>Add</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleteId !== null} onOpenChange={(v) => !v && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete habit?</DialogTitle></DialogHeader>
          <p className="text-sm text-[var(--text-muted)] mt-2">All completion history will be lost.</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => void handleDelete()}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
