import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { InboxList } from './components/InboxList'
import { ComposeView } from './components/ComposeView'
import { useEmailStore } from './store'

export default function EmailComposerApp() {
  const { view, selectEmail } = useEmailStore()
  const [searchParams] = useSearchParams()

  // Deep-link from command palette: /email?id=3
  useEffect(() => {
    const id = searchParams.get('id')
    if (id) selectEmail(Number(id))
  }, [searchParams, selectEmail])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center border-b border-[var(--border)] px-6 py-3">
        <h1 className="text-base font-semibold text-[var(--text-primary)]">Email Composer</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        {view === 'inbox' ? <InboxList /> : <ComposeView />}
      </div>
    </div>
  )
}
