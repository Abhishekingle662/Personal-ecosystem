import { create } from 'zustand'

type EmailView = 'inbox' | 'compose'
type InboxFilter = 'all' | 'needs-reply' | 'archived'
type Tone = 'professional' | 'friendly' | 'direct' | 'brief'

interface EmailComposerStore {
  view: EmailView
  selectedEmailId: number | null
  filter: InboxFilter
  tone: Tone
  context: string
  draftVariants: [string, string]
  selectedVariant: 0 | 1
  setView: (v: EmailView) => void
  selectEmail: (id: number | null) => void
  setFilter: (f: InboxFilter) => void
  setTone: (t: Tone) => void
  setContext: (c: string) => void
  setDraftVariants: (v: [string, string]) => void
  setSelectedVariant: (i: 0 | 1) => void
}

export const useEmailStore = create<EmailComposerStore>((set) => ({
  view: 'inbox',
  selectedEmailId: null,
  filter: 'all',
  tone: 'professional',
  context: '',
  draftVariants: ['', ''],
  selectedVariant: 0,
  setView: (view) => set({ view }),
  selectEmail: (id) => set({ selectedEmailId: id, view: id !== null ? 'compose' : 'inbox' }),
  setFilter: (filter) => set({ filter }),
  setTone: (tone) => set({ tone }),
  setContext: (context) => set({ context }),
  setDraftVariants: (draftVariants) => set({ draftVariants }),
  setSelectedVariant: (selectedVariant) => set({ selectedVariant }),
}))
