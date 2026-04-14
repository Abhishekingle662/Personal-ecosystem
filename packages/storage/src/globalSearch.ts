import Fuse from 'fuse.js'

import { db } from './db'
import type { SearchResult } from './types'

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return []

  const [emails, jobs, posts, journal, habits, snippets] = await Promise.all([
    db.emails.toArray(),
    db.jobs.toArray(),
    db.posts.toArray(),
    db.journal.toArray(),
    db.habits.toArray(),
    db.snippets.toArray(),
  ])

  const results: SearchResult[] = []

  const emailFuse = new Fuse(emails, {
    keys: ['subject', 'from', 'body'],
    threshold: 0.35,
  })
  emailFuse.search(query).forEach(({ item }) => {
    results.push({
      type: 'email',
      id: item.id!,
      title: item.subject,
      subtitle: `From: ${item.from}`,
      item,
    })
  })

  const jobFuse = new Fuse(jobs, {
    keys: ['company', 'role', 'notes'],
    threshold: 0.35,
  })
  jobFuse.search(query).forEach(({ item }) => {
    results.push({
      type: 'job',
      id: item.id!,
      title: `${item.role} at ${item.company}`,
      subtitle: item.status,
      item,
    })
  })

  const postFuse = new Fuse(posts, {
    keys: ['content', 'hook', 'tags'],
    threshold: 0.35,
  })
  postFuse.search(query).forEach(({ item }) => {
    results.push({
      type: 'post',
      id: item.id!,
      title: item.hook ?? item.content.slice(0, 60),
      subtitle: item.platform,
      item,
    })
  })

  const journalFuse = new Fuse(journal, {
    keys: ['content', 'tags'],
    threshold: 0.35,
  })
  journalFuse.search(query).forEach(({ item }) => {
    results.push({
      type: 'journal',
      id: item.id!,
      title: `Journal — ${item.date}`,
      subtitle: item.content.slice(0, 80),
      item,
    })
  })

  const habitFuse = new Fuse(habits, { keys: ['name'], threshold: 0.35 })
  habitFuse.search(query).forEach(({ item }) => {
    results.push({
      type: 'habit',
      id: item.id!,
      title: item.name,
      subtitle: item.frequency,
      item,
    })
  })

  const snippetFuse = new Fuse(snippets, {
    keys: ['title', 'content', 'tags', 'language'],
    threshold: 0.35,
  })
  snippetFuse.search(query).forEach(({ item }) => {
    results.push({
      type: 'snippet',
      id: item.id!,
      title: item.title,
      subtitle: item.language,
      item,
    })
  })

  return results
}
