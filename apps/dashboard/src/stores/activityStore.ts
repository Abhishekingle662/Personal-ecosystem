import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BusEvent } from '@micro/data-bus'

export interface ActivityEvent {
  id: string
  event: BusEvent
  payload: unknown
  timestamp: number
}

interface ActivityStore {
  events: ActivityEvent[]
  push: (event: BusEvent, payload: unknown) => void
}

export const useActivityStore = create<ActivityStore>()(
  persist(
    (set) => ({
      events: [],
      push: (event, payload) =>
        set((state) => ({
          events: [
            {
              id: `${Date.now().toString()}-${Math.random().toString(36).slice(2)}`,
              event,
              payload,
              timestamp: Date.now(),
            },
            ...state.events,
          ].slice(0, 50), // keep last 50
        })),
    }),
    { name: 'micro-os-activity' },
  ),
)
