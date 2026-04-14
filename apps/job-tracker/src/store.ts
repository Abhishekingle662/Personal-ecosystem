import { create } from 'zustand'

interface JobTrackerStore {
  selectedJobId: number | null
  drawerOpen: boolean
  view: 'kanban' | 'analytics'
  openDrawer: (id: number | null) => void
  closeDrawer: () => void
  setView: (v: 'kanban' | 'analytics') => void
}

export const useJobTrackerStore = create<JobTrackerStore>((set) => ({
  selectedJobId: null,
  drawerOpen: false,
  view: 'kanban',
  openDrawer: (id) => set({ selectedJobId: id, drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false, selectedJobId: null }),
  setView: (view) => set({ view }),
}))
