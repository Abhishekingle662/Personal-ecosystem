import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Copy, Trash2, Search, Code2, Download } from 'lucide-react'
import { Button, Input, Textarea, Label, Badge, EmptyState, Dialog, DialogContent, DialogHeader, DialogTitle, toast } from '@micro/ui'
import { useSnippets, type Snippet } from '@micro/storage'

const COMMON_LANGUAGES = ['TypeScript', 'JavaScript', 'Python', 'Bash', 'SQL', 'Go', 'Rust', 'JSON', 'YAML', 'Markdown']

const LANG_EXT: Record<string, string> = {
  typescript: 'ts', javascript: 'js', python: 'py', bash: 'sh', sql: 'sql',
  go: 'go', rust: 'rs', json: 'json', yaml: 'yml', markdown: 'md',
}

function getExt(lang: string): string {
  return LANG_EXT[lang.toLowerCase()] ?? 'txt'
}

const EMPTY_SNIPPET: Omit<Snippet, 'id'> = {
  title: '', content: '', language: 'TypeScript', tags: [], createdAt: new Date().toISOString(),
}

export default function SnippetsApp() {
  const { data: snippets, add, update, remove, search } = useSnippets()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [langFilter, setLangFilter] = useState<string | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<Omit<Snippet, 'id'>>(EMPTY_SNIPPET)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  // Deep-link
  useEffect(() => {
    const id = searchParams.get('id')
    if (id) openEditor(Number(id))
  }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  const displayed = query.trim() ? search(query) : snippets
  const filtered = langFilter ? displayed.filter((s) => s.language.toLowerCase() === langFilter.toLowerCase()) : displayed
  const allLanguages = [...new Set(snippets.map((s) => s.language))].sort()

  const openEditor = (id?: number) => {
    if (id) {
      const s = snippets.find((s) => s.id === id)
      if (s) { setForm({ ...s }); setEditingId(id) }
    } else {
      setForm({ ...EMPTY_SNIPPET, createdAt: new Date().toISOString() })
      setEditingId(null)
    }
    setEditorOpen(true)
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) { toast.error('Title and content required'); return }
    if (editingId) {
      await update(editingId, { ...form, lastUsed: new Date().toISOString() })
      toast.success('Snippet updated')
    } else {
      await add(form)
      toast.success('Snippet saved')
    }
    setEditorOpen(false)
  }

  const handleCopy = async (content: string, id?: number) => {
    await navigator.clipboard.writeText(content)
    if (id) await update(id, { lastUsed: new Date().toISOString() })
    toast.success('Copied to clipboard')
  }

  const handleExport = (snippet: Snippet) => {
    const blob = new Blob([snippet.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${snippet.title.replace(/\s+/g, '-').toLowerCase()}.${getExt(snippet.language)}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDelete = async () => {
    if (deleteId === null) return
    await remove(deleteId); setDeleteId(null); toast.success('Snippet deleted')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-3">
        <h1 className="text-base font-semibold text-[var(--text-primary)]">Snippets</h1>
        <Button size="sm" onClick={() => openEditor()}>
          <Plus className="h-3.5 w-3.5 mr-1" />New snippet
        </Button>
      </div>

      {/* Search + filter bar */}
      <div className="flex items-center gap-3 border-b border-[var(--border)] px-6 py-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search snippets…" className="pl-9" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setLangFilter(null)}
            className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${!langFilter ? 'border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent-hover)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)]'}`}>
            All
          </button>
          {allLanguages.map((lang) => (
            <button key={lang} onClick={() => setLangFilter(langFilter === lang ? null : lang)}
              className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${langFilter === lang ? 'border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent-hover)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)]'}`}>
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <EmptyState icon={<Code2 className="h-5 w-5" />} heading={query ? `No results for "${query}"` : 'No snippets yet'} subtext="Save your first code snippet." action={{ label: 'New snippet', onClick: () => openEditor() }} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((snippet) => (
              <div key={snippet.id} className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4 space-y-3 cursor-pointer hover:border-[var(--border-hover)] transition-colors" onClick={() => openEditor(snippet.id)}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{snippet.title}</p>
                  <Badge variant="info" className="flex-shrink-0 font-mono text-xs">{snippet.language}</Badge>
                </div>
                <pre className="text-xs text-[var(--text-muted)] font-mono bg-[var(--bg-tertiary)] rounded p-2 overflow-hidden line-clamp-3 whitespace-pre-wrap">
                  {snippet.content.split('\n').slice(0, 3).join('\n')}
                </pre>
                {snippet.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {snippet.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs text-[var(--text-muted)]">#{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[var(--text-muted)] font-mono">
                    {snippet.lastUsed ? `Used ${new Date(snippet.lastUsed).toLocaleDateString()}` : new Date(snippet.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => void handleCopy(snippet.content, snippet.id)} className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleExport(snippet)} className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setDeleteId(snippet.id!)} className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--destructive)] transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor dialog */}
      <Dialog open={editorOpen} onOpenChange={(v) => !v && setEditorOpen(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingId ? 'Edit snippet' : 'New snippet'}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="snip-title">Title *</Label>
                <Input id="snip-title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="useDebounce hook" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="snip-lang">Language</Label>
                <Input id="snip-lang" value={form.language} onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))} list="lang-suggestions" placeholder="TypeScript" />
                <datalist id="lang-suggestions">
                  {COMMON_LANGUAGES.map((l) => <option key={l} value={l} />)}
                </datalist>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="snip-content">Content *</Label>
              <Textarea id="snip-content" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="// paste your snippet here" className="min-h-[200px] font-mono text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="snip-tags">Tags (comma-separated)</Label>
              <Input id="snip-tags" value={form.tags.join(', ')} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) }))} placeholder="hooks, async, utils" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditorOpen(false)}>Cancel</Button>
              <Button onClick={() => void handleSave()}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleteId !== null} onOpenChange={(v) => !v && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete snippet?</DialogTitle></DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => void handleDelete()}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
