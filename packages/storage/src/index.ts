// Database instance
export { db } from './db'

// Types
export type {
  Email,
  EmailStatus,
  Job,
  JobStatus,
  JobContact,
  Post,
  PostPlatform,
  PostStatus,
  JournalEntry,
  Mood,
  Habit,
  HabitFrequency,
  Snippet,
  AiCacheEntry,
  SearchResult,
  SearchResultType,
  TableHook,
} from './types'

// Hooks
export { useEmails } from './hooks/useEmails'
export { useJobs } from './hooks/useJobs'
export { usePosts } from './hooks/usePosts'
export { useJournal } from './hooks/useJournal'
export { useHabits } from './hooks/useHabits'
export { useSnippets } from './hooks/useSnippets'

// Global search
export { globalSearch } from './globalSearch'

// Seed
export { seedIfNeeded } from './seed'
