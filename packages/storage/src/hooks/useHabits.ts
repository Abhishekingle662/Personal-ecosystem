import { useLiveQuery } from 'dexie-react-hooks'
import Fuse, { type IFuseOptions } from 'fuse.js'

import { db } from '../db'
import type { Habit, TableHook } from '../types'

const FUSE_OPTIONS: IFuseOptions<Habit> = {
  keys: ['name'],
  threshold: 0.35,
  includeScore: true,
}

export function useHabits(): TableHook<Habit> {
  const data = useLiveQuery(
    () => db.habits.orderBy('createdAt').toArray(),
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
    add: (item) => db.habits.add(item as Habit),
    update: (id, changes) => db.habits.update(id, changes).then(() => undefined),
    remove: (id) => db.habits.delete(id),
    search: (query) => {
      if (!query.trim()) return resolved
      return fuse.search(query).map((r) => r.item)
    },
  }
}
