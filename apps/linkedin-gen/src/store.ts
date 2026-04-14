import { create } from 'zustand'

type LinkedInView = 'generator' | 'editor' | 'library'
type PostFormat = 'story' | 'insight' | 'list' | 'hot-take' | 'behind-the-scenes'
type PostAudience = 'engineers' | 'hiring-managers' | 'founders' | 'general'

interface LinkedInStore {
  view: LinkedInView
  selectedPostId: number | null
  format: PostFormat
  audience: PostAudience
  ideaPrompt: string
  hooks: string[]
  selectedHook: string
  postContent: string
  postVariants: string[]
  hashtags: string[]
  hashtagsEnabled: boolean
  setView: (v: LinkedInView) => void
  selectPost: (id: number | null) => void
  setFormat: (f: PostFormat) => void
  setAudience: (a: PostAudience) => void
  setIdeaPrompt: (p: string) => void
  setHooks: (h: string[]) => void
  selectHook: (h: string) => void
  setPostContent: (c: string) => void
  setPostVariants: (v: string[]) => void
  setHashtags: (h: string[]) => void
  toggleHashtags: () => void
}

export const useLinkedInStore = create<LinkedInStore>((set) => ({
  view: 'generator',
  selectedPostId: null,
  format: 'insight',
  audience: 'engineers',
  ideaPrompt: '',
  hooks: [],
  selectedHook: '',
  postContent: '',
  postVariants: [],
  hashtags: [],
  hashtagsEnabled: true,
  setView: (view) => set({ view }),
  selectPost: (id) => set({ selectedPostId: id, view: 'editor' }),
  setFormat: (format) => set({ format }),
  setAudience: (audience) => set({ audience }),
  setIdeaPrompt: (ideaPrompt) => set({ ideaPrompt }),
  setHooks: (hooks) => set({ hooks }),
  selectHook: (selectedHook) => set({ selectedHook, view: 'editor' }),
  setPostContent: (postContent) => set({ postContent }),
  setPostVariants: (postVariants) => set({ postVariants }),
  setHashtags: (hashtags) => set({ hashtags }),
  toggleHashtags: () => set((s) => ({ hashtagsEnabled: !s.hashtagsEnabled })),
}))
