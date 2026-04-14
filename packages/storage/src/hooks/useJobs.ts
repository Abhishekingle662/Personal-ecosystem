import { useLiveQuery } from 'dexie-react-hooks'
import Fuse, { type IFuseOptions } from 'fuse.js'

import { db } from '../db'
import type { Job, TableHook } from '../types'

const FUSE_OPTIONS: IFuseOptions<Job> = {
  keys: ['company', 'role', 'notes', 'salary'],
  threshold: 0.35,
  includeScore: true,
}

export function useJobs(): TableHook<Job> {
  const data = useLiveQuery(() => db.jobs.toArray(), [], [])
  const loading = data === undefined
  const resolved = data ?? []

  const fuse = new Fuse(resolved, FUSE_OPTIONS)

  return {
    data: resolved,
    loading,
    error: null,
    add: (item) => db.jobs.add(item as Job),
    update: (id, changes) => db.jobs.update(id, changes).then(() => undefined),
    remove: (id) => db.jobs.delete(id),
    search: (query) => {
      if (!query.trim()) return resolved
      return fuse.search(query).map((r) => r.item)
    },
  }
}
