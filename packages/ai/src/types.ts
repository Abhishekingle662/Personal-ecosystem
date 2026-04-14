export type AiTier = 'local' | 'free' | 'paid'

export type AiTaskType =
  | 'draft'
  | 'summarize'
  | 'generate'
  | 'classify'
  | 'extract'

export interface AskOptions {
  prompt: string
  systemPrompt?: string
  /** Which tier to start from. Falls through on failure. Default: 'free' */
  tier?: AiTier
  taskType?: AiTaskType
  maxTokens?: number
  /** Cache result by prompt hash. Default: true */
  cache?: boolean
}

export interface AskResult {
  content: string
  model: string
  tier: AiTier
  cached: boolean
  error?: string
}
