import { useState } from 'react'
import { Trash2, Edit2 } from 'lucide-react'
import { Badge, Button, EmptyState, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, toast } from '@micro/ui'
import { usePosts } from '@micro/storage'
import { useLinkedInStore } from '../store'

type StatusFilter = 'all' | 'draft' | 'published'

export function ContentLibrary() {
  const { data: posts, remove } = usePosts()
  const { setView, selectPost, setPostContent, setHashtags, setPostVariants } = useLinkedInStore()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const filtered = posts.filter((p) => {
    if (statusFilter === 'draft') return p.status === 'draft'
    if (statusFilter === 'published') return p.status === 'published'
    return true
  })

  const handleEdit = (id: number) => {
    const post = posts.find((p) => p.id === id)
    if (!post) return
    setPostContent(post.content)
    setHashtags(post.tags)
    setPostVariants(post.variants ?? [])
    selectPost(id)
  }

  const handleDelete = async () => {
    if (deleteId === null) return
    await remove(deleteId)
    setDeleteId(null)
    toast.success('Post deleted')
  }

  return (
    <div className="flex h-full flex-col">
      {/* Filter bar */}
      <div className="flex items-center gap-1 border-b border-[var(--border)] px-6 py-3">
        {(['all', 'draft', 'published'] as StatusFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
              statusFilter === f
                ? 'bg-[var(--accent-muted)] text-[var(--accent-hover)]'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <EmptyState
            heading="No posts yet"
            subtext="Generate your first post from the idea generator."
            action={{ label: 'Create post', onClick: () => setView('generator') }}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => (
              <div
                key={post.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <Badge variant={post.status === 'published' ? 'success' : 'default'}>
                    {post.status}
                  </Badge>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(post.id!)}
                      className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(post.id!)}
                      className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--destructive)] transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-[var(--text-secondary)] line-clamp-4 leading-relaxed">
                  {post.content}
                </p>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-[var(--accent)] font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-[var(--text-muted)]">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={deleteId !== null} onOpenChange={(v) => !v && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete post?</DialogTitle>
            <DialogDescription>This cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => void handleDelete()}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
