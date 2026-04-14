import { useState, useEffect } from 'react'
import { Hash, Save, CheckCircle } from 'lucide-react'
import { Button, Textarea, Label, Badge, toast } from '@micro/ui'
import { usePosts } from '@micro/storage'
import { emit } from '@micro/data-bus'
import { useLinkedInStore } from '../store'

const LINKEDIN_MAX = 3000

export function PostEditor() {
  const { data: posts, add, update } = usePosts()
  const {
    selectedPostId,
    postContent,
    postVariants,
    hashtags,
    hashtagsEnabled,
    setPostContent,
    toggleHashtags,
    setView,
  } = useLinkedInStore()

  const [activeVariant, setActiveVariant] = useState<'main' | 0 | 1>('main')

  const existingPost = selectedPostId ? posts.find((p) => p.id === selectedPostId) : null

  // Load existing post into store when editing from library
  useEffect(() => {
    if (existingPost && !postContent) {
      setPostContent(existingPost.content)
    }
  }, [existingPost, postContent, setPostContent])

  const displayContent =
    activeVariant === 'main'
      ? postContent
      : (postVariants[activeVariant] ?? postContent)

  const charCount = displayContent.length
  const isOverLimit = charCount > LINKEDIN_MAX
  const hashtagLine =
    hashtagsEnabled && hashtags.length > 0
      ? '\n\n' + hashtags.map((t) => `#${t}`).join(' ')
      : ''
  const fullContent = displayContent + hashtagLine

  const handleSaveDraft = async () => {
    if (!fullContent.trim()) return
    if (selectedPostId) {
      await update(selectedPostId, { content: fullContent, status: 'draft' })
      toast.success('Draft updated')
    } else {
      await add({
        platform: 'linkedin',
        content: fullContent,
        hook: fullContent.split('\n')[0]?.slice(0, 100) ?? '',
        variants: postVariants,
        tags: hashtags,
        createdAt: new Date().toISOString(),
        status: 'draft',
      })
      toast.success('Draft saved')
    }
  }

  const handleMarkPublished = async () => {
    if (selectedPostId) {
      await update(selectedPostId, { status: 'published' })
    } else {
      await add({
        platform: 'linkedin',
        content: fullContent,
        hook: fullContent.split('\n')[0]?.slice(0, 100) ?? '',
        variants: postVariants,
        tags: hashtags,
        createdAt: new Date().toISOString(),
        status: 'published',
      })
    }
    emit('post:published', { platform: 'linkedin' })
    toast.success('Marked as published')
    setView('library')
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: editor */}
      <div className="flex w-1/2 flex-col border-r border-[var(--border)] p-5 space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Editor
          </p>
          <span
            className={`font-mono text-xs ${
              isOverLimit ? 'text-[var(--destructive)]' : 'text-[var(--text-muted)]'
            }`}
          >
            {charCount.toString()}/{LINKEDIN_MAX.toString()}
          </span>
        </div>

        {/* Variant tabs */}
        {postVariants.length > 0 && (
          <div className="flex gap-1.5">
            {(['main', 0, 1] as const).map((v) => (
              <button
                key={String(v)}
                onClick={() => setActiveVariant(v)}
                className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                  activeVariant === v
                    ? 'border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent-hover)]'
                    : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)]'
                }`}
              >
                {v === 'main' ? 'Main' : `Variant ${(Number(v) + 1).toString()}`}
              </button>
            ))}
          </div>
        )}

        <Textarea
          value={activeVariant === 'main' ? postContent : (postVariants[activeVariant] ?? '')}
          onChange={(e) => {
            if (activeVariant === 'main') setPostContent(e.target.value)
          }}
          placeholder="Your post content…"
          className="flex-1 min-h-[300px] text-sm leading-relaxed"
        />

        {/* Hashtags */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Hashtags</Label>
            <button
              onClick={toggleHashtags}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                hashtagsEnabled ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
              }`}
            >
              <Hash className="h-3.5 w-3.5" />
              {hashtagsEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          {hashtagsEnabled && hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {hashtags.map((tag) => (
                <Badge key={tag} variant="info" className="font-mono">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleSaveDraft()}
            disabled={!fullContent.trim()}
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Save draft
          </Button>
          <Button
            size="sm"
            onClick={() => void handleMarkPublished()}
            disabled={!fullContent.trim()}
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
            Mark published
          </Button>
        </div>
      </div>

      {/* Right: LinkedIn preview */}
      <div className="flex w-1/2 flex-col p-5 overflow-y-auto">
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
          Preview
        </p>
        <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
          {/* LinkedIn post card */}
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-[#0a66c2] flex items-center justify-center text-white text-sm font-bold">
              μ
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">micro-os user</p>
              <p className="text-xs text-gray-500">Software Engineer · Just now</p>
            </div>
          </div>
          <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {fullContent || (
              <span className="text-gray-400 italic">Your post will appear here…</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
