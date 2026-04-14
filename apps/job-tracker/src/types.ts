import type { Job, JobStatus } from '@micro/storage'

export type { Job, JobStatus }

export const JOB_COLUMNS: JobStatus[] = [
  'wishlist',
  'applied',
  'screen',
  'technical',
  'offer',
  'rejected',
]

export const COLUMN_LABELS: Record<JobStatus, string> = {
  wishlist: 'Wishlist',
  applied: 'Applied',
  screen: 'Screen',
  technical: 'Technical',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

export const COLUMN_COLORS: Record<JobStatus, string> = {
  wishlist: 'var(--text-muted)',
  applied: 'var(--accent)',
  screen: 'var(--warning)',
  technical: 'var(--accent-hover)',
  offer: 'var(--success)',
  rejected: 'var(--destructive)',
  withdrawn: 'var(--text-muted)',
}
