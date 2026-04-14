import { useLiveQuery } from 'dexie-react-hooks'
import Fuse, { type IFuseOptions } from 'fuse.js'

import { db } from '../db'
import type { Post, TableHook } from '../types'

const FUSE_OPTIONS: IFuseOptions<Post> = {
  keys: ['content', 'hook', 'tags'],
  threshold: 0.35,
  includeScore: true,
}

export function usePosts(): TableHook<Post> {
  const data = useLiveQuery(
    () => db.posts.orderBy('createdAt').reverse().toArray(),
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
    add: (item) => db.posts.add(item as Post),
    update: (id, changes) => db.posts.update(id, changes).then(() => undefined),
    remove: (id) => db.posts.delete(id),
    search: (query) => {
      if (!query.trim()) return resolved
      return fuse.search(query).map((r) => r.item)
    },
  }
}
