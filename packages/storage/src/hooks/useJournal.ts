import { useLiveQuery } from 'dexie-react-hooks'
import Fuse, { type IFuseOptions } from 'fuse.js'

import { db } from '../db'
import type { JournalEntry, TableHook } from '../types'

const FUSE_OPTIONS: IFuseOptions<JournalEntry> = {
  keys: ['content', 'tags', 'date'],
  threshold: 0.35,
  includeScore: true,
}

export function useJournal(): TableHook<JournalEntry> {
  const data = useLiveQuery(
    () => db.journal.orderBy('date').reverse().toArray(),
    [],
    [],
  )
  const loading = data === undefined
  const resolved = data ?? []

  const fuse = new Fuse(resolved, FUSE_OPTIONS)

  return {
    data: resolved,
    loading,
    error: null,
    add: (item) => db.journal.add(item as JournalEntry),
    update: (id, changes) => db.journal.update(id, changes).then(() => undefined),
    remove: (id) => db.journal.delete(id),
    search: (query) => {
      if (!query.trim()) return resolved
      return fuse.search(query).map((r) => r.item)
    },
  }
}
