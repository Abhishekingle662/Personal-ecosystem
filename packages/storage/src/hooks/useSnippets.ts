import { useLiveQuery } from 'dexie-react-hooks'
import Fuse, { type IFuseOptions } from 'fuse.js'

import { db } from '../db'
import type { Snippet, TableHook } from '../types'

const FUSE_OPTIONS: IFuseOptions<Snippet> = {
  keys: ['title', 'content', 'tags', 'language'],
  threshold: 0.35,
  includeScore: true,
}

export function useSnippets(): TableHook<Snippet> {
  const data = useLiveQuery(
    () => db.snippets.orderBy('lastUsed').reverse().toArray(),
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
    add: (item) => db.snippets.add(item as Snippet),
    update: (id, changes) => db.snippets.update(id, changes).then(() => undefined),
    remove: (id) => db.snippets.delete(id),
    search: (query) => {
      if (!query.trim()) return resolved
      return fuse.search(query).map((r) => r.item)
    },
  }
}
