// ─── Email ────────────────────────────────────────────────────────────────────

export type EmailStatus = 'inbox' | 'draft-replied' | 'archived'

export interface Email {
  id?: number
  subject: string
  from: string
  to: string
  date: string // ISO 8601
  labels: string[]
  threadId: string
  status: EmailStatus
  draftReply?: string
  body?: string
}

// ─── Job ──────────────────────────────────────────────────────────────────────

export type JobStatus =
  | 'wishlist'
  | 'applied'
  | 'screen'
  | 'technical'
  | 'offer'
  | 'rejected'
  | 'withdrawn'

export interface JobContact {
  name: string
  linkedinUrl?: string
  role?: string
}

export interface Job {
  id?: number
  company: string
  role: string
  status: JobStatus
  appliedAt?: string // ISO 8601
  notes?: string
  url?: string
  salary?: string
  contacts: JobContact[]
}

// ─── Post ─────────────────────────────────────────────────────────────────────

export type PostPlatform = 'linkedin' | 'twitter'
export type PostStatus = 'draft' | 'published'

export interface Post {
  id?: number
  platform: PostPlatform
  content: string
  hook?: string
  variants?: string[]
  tags: string[]
  createdAt: string // ISO 8601
  status: PostStatus
}

// ─── Journal ──────────────────────────────────────────────────────────────────

export type Mood = 'great' | 'good' | 'neutral' | 'bad' | 'terrible'

export interface JournalEntry {
  id?: number
  date: string // YYYY-MM-DD
  content: string
  mood: Mood
  tags: string[]
  wordCount: number
}

// ─── Habit ────────────────────────────────────────────────────────────────────

export type HabitFrequency = 'daily' | 'weekly'

export interface Habit {
  id?: number
  name: string
  frequency: HabitFrequency
  completions: string[] // ISO date strings of completed days/weeks
  streak: number
  createdAt: string // ISO 8601
}

// ─── Snippet ──────────────────────────────────────────────────────────────────

export interface Snippet {
  id?: number
  title: string
  content: string
  language: string
  tags: string[]
  createdAt: string // ISO 8601
  lastUsed?: string // ISO 8601
}

// ─── AI Cache ─────────────────────────────────────────────────────────────────

export interface AiCacheEntry {
  id?: number
  hash: string
  prompt: string
  systemPrompt?: string
  model: string
  result: string
  createdAt: number // Unix ms timestamp for TTL comparison
}

// ─── Search ───────────────────────────────────────────────────────────────────

export type SearchResultType = 'email' | 'job' | 'post' | 'journal' | 'habit' | 'snippet'

export interface SearchResult {
  type: SearchResultType
  id: number
  title: string
  subtitle?: string
  item: Email | Job | Post | JournalEntry | Habit | Snippet
}

// ─── Hook return shape ────────────────────────────────────────────────────────

export interface TableHook<T> {
  data: T[]
  loading: boolean
  error: Error | null
  add: (item: Omit<T, 'id'>) => Promise<number>
  update: (id: number, changes: Partial<T>) => Promise<void>
  remove: (id: number) => Promise<void>
  search: (query: string) => T[]
}
