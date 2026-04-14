import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mail,
  Briefcase,
  FileText,
  BookOpen,
  CheckSquare,
  Code2,
  Search,
} from 'lucide-react'
import { Dialog, DialogContent, Badge, LoadingSpinner } from '@micro/ui'
import { globalSearch, type SearchResult, type SearchResultType } from '@micro/storage'

const TYPE_META: Record<
  SearchResultType,
  { label: string; icon: React.ReactNode; path: (id: number) => string }
> = {
  email: {
    label: 'Email',
    icon: <Mail className="h-3.5 w-3.5" />,
    path: (id) => `/email?id=${id.toString()}`,
  },
  job: {
    label: 'Job',
    icon: <Briefcase className="h-3.5 w-3.5" />,
    path: (id) => `/jobs?id=${id.toString()}`,
  },
  post: {
    label: 'Post',
    icon: <FileText className="h-3.5 w-3.5" />,
    path: (id) => `/linkedin?id=${id.toString()}`,
  },
  journal: {
    label: 'Journal',
    icon: <BookOpen className="h-3.5 w-3.5" />,
    path: (id) => `/journal?id=${id.toString()}`,
  },
  habit: {
    label: 'Habit',
    icon: <CheckSquare className="h-3.5 w-3.5" />,
    path: () => '/habits',
  },
  snippet: {
    label: 'Snippet',
    icon: <Code2 className="h-3.5 w-3.5" />,
    path: (id) => `/snippets?id=${id.toString()}`,
  },
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    const res = await globalSearch(q)
    setResults(res)
    setActiveIndex(0)
    setLoading(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      void runSearch(query)
    }, 150)
    return () => clearTimeout(timer)
  }, [query, runSearch])

  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const handleSelect = (result: SearchResult) => {
    const meta = TYPE_META[result.type]
    navigate(meta.path(result.id))
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[activeIndex]) {
      handleSelect(results[activeIndex])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
          <Search className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search everything…"
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
          />
          {loading && <LoadingSpinner size="sm" />}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {results.length === 0 && query.trim() && !loading && (
            <p className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
              No results for &ldquo;{query}&rdquo;
            </p>
          )}
          {results.length === 0 && !query.trim() && (
            <p className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
              Type to search across all apps…
            </p>
          )}
          {results.map((result, i) => {
            const meta = TYPE_META[result.type]
            return (
              <button
                key={`${result.type}-${result.id.toString()}`}
                onClick={() => handleSelect(result)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  i === activeIndex
                    ? 'bg-[var(--accent-muted)]'
                    : 'hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                <span className="text-[var(--text-muted)]">{meta.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm text-[var(--text-primary)]">
                    {result.title}
                  </p>
                  {result.subtitle && (
                    <p className="truncate text-xs text-[var(--text-muted)]">
                      {result.subtitle}
                    </p>
                  )}
                </div>
                <Badge variant="default" className="flex-shrink-0 text-xs">
                  {meta.label}
                </Badge>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-4 border-t border-[var(--border)] px-4 py-2">
          <span className="text-xs text-[var(--text-muted)]">
            ↑↓ navigate · ↵ open · esc close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
