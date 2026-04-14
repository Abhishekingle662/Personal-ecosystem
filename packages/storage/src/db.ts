import Dexie, { type Table } from 'dexie'

import type {
  Email,
  Job,
  Post,
  JournalEntry,
  Habit,
  Snippet,
  AiCacheEntry,
} from './types'

export class MicroOsDatabase extends Dexie {
  emails!: Table<Email, number>
  jobs!: Table<Job, number>
  posts!: Table<Post, number>
  journal!: Table<JournalEntry, number>
  habits!: Table<Habit, number>
  snippets!: Table<Snippet, number>
  ai_cache!: Table<AiCacheEntry, number>

  constructor() {
    super('micro-os-db')

    this.version(1).stores({
      emails: '++id, subject, from, to, date, threadId, status',
      jobs: '++id, company, role, status, appliedAt',
      posts: '++id, platform, status, createdAt',
      journal: '++id, date, mood',
      habits: '++id, name, frequency, createdAt',
      snippets: '++id, title, language, createdAt, lastUsed',
      ai_cache: '++id, hash, createdAt',
    })
  }
}

// Singleton — safe to import anywhere; Dexie handles multiple open calls
export const db = new MicroOsDatabase()
