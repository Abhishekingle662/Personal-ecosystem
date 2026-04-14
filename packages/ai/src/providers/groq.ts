import type { AskOptions, AskResult } from '../types'

const GROQ_BASE = 'https://api.groq.com/openai/v1'
const GROQ_MODEL = 'llama3-8b-8192'

interface GroqMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface GroqResponse {
  choices?: Array<{
    message?: { content?: string }
  }>
  error?: { message?: string }
}

export async function askGroq(options: AskOptions): Promise<AskResult> {
  const apiKey = (
    typeof import.meta !== 'undefined'
      ? (import.meta.env as Record<string, string | undefined>).VITE_GROQ_API_KEY
      : undefined
  ) ?? ''

  if (!apiKey) {
    throw new Error('VITE_GROQ_API_KEY not set')
  }

  const messages: GroqMessage[] = []
  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt })
  }
  messages.push({ role: 'user', content: options.prompt })

  const response = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      max_tokens: options.maxTokens ?? 1024,
    }),
  })

  const data = (await response.json()) as GroqResponse

  if (!response.ok || data.error) {
    throw new Error(data.error?.message ?? `Groq returned ${response.status.toString()}`)
  }

  const content = data.choices?.[0]?.message?.content ?? ''

  return {
    content,
    model: GROQ_MODEL,
    tier: 'free',
    cached: false,
  }
}
