import { useLiveQuery } from 'dexie-react-hooks'
import Fuse, { type IFuseOptions } from 'fuse.js'

import { db } from '../db'
import type { Email, TableHook } from '../types'

const FUSE_OPTIONS: IFuseOptions<Email> = {
  keys: ['subject', 'from', 'to', 'body', 'draftReply'],
  threshold: 0.35,
  includeScore: true,
}

export function useEmails(): TableHook<Email> {
  const data = useLiveQuery(() => db.emails.orderBy('date').reverse().toArray(), [], [])
  const loading = data === undefined
  const resolved = data ?? []

  const fuse = new Fuse(resolved, FUSE_OPTIONS)

  return {
    data: resolved,
    loading,
    error: null,
    add: (item) => db.emails.add(item as Email),
    update: (id, changes) => db.emails.update(id, changes).then(() => undefined),
    remove: (id) => db.emails.delete(id),
    search: (query) => {
      if (!query.trim()) return resolved
      return fuse.search(query).map((r) => r.item)
    },
  }
}
