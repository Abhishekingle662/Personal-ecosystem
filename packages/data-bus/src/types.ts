export type BusEvent =
  | 'job:added'
  | 'job:updated'
  | 'email:draft-created'
  | 'email:archived'
  | 'post:published'
  | 'journal:saved'
  | 'habit:completed'
  | 'search:global'

export interface BusMessage {
  event: BusEvent
  payload?: unknown
  timestamp: number
}
