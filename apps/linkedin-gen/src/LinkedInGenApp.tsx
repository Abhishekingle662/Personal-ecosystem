import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Lightbulb, Edit2, Library } from 'lucide-react'
import { IdeaGenerator } from './components/IdeaGenerator'
import { PostEditor } from './components/PostEditor'
import { ContentLibrary } from './components/ContentLibrary'
import { useLinkedInStore } from './store'

type LinkedInView = 'generator' | 'editor' | 'library'

const TABS: { id: LinkedInView; label: string; icon: React.ReactNode }[] = [
  { id: 'generator', label: 'Generate', icon: <Lightbulb className="h-3.5 w-3.5" /> },
  { id: 'editor', label: 'Editor', icon: <Edit2 className="h-3.5 w-3.5" /> },
  { id: 'library', label: 'Library', icon: <Library className="h-3.5 w-3.5" /> },
]

export default function LinkedInGenApp() {
  const { view, setView, selectPost } = useLinkedInStore()
  const [searchParams] = useSearchParams()

  // Deep-link from command palette: /linkedin?id=2
  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      selectPost(Number(id))
    }
  }, [searchParams, selectPost])

  return (
    <div className="flex h-full flex-col">
      {/* Header + tabs */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-3">
        <h1 className="text-base font-semibold text-[var(--text-primary)]">LinkedIn Generator</h1>
        <div className="flex rounded-md border border-[var(--border)] overflow-hidden">
          {TABS.map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${
                i > 0 ? 'border-l border-[var(--border)]' : ''
              } ${
                view === tab.id
                  ? 'bg-[var(--accent-muted)] text-[var(--accent-hover)]'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {view === 'generator' && <IdeaGenerator />}
        {view === 'editor' && <PostEditor />}
        {view === 'library' && <ContentLibrary />}
      </div>
    </div>
  )
}
