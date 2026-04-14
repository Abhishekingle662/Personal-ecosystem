import type { AskOptions, AskResult } from '../types'

const ANTHROPIC_BASE = 'https://api.anthropic.com/v1'
const ANTHROPIC_MODEL = 'claude-haiku-3-5-20241022'
const ANTHROPIC_VERSION = '2023-06-01'

interface AnthropicMessage {
  role: 'user' | 'assistant'
  content: string
}

interface AnthropicResponse {
  content?: Array<{ type: string; text?: string }>
  error?: { message?: string }
}

export async function askAnthropic(options: AskOptions): Promise<AskResult> {
  const apiKey = (
    typeof import.meta !== 'undefined'
      ? (import.meta.env as Record<string, string | undefined>).VITE_ANTHROPIC_API_KEY
      : undefined
  ) ?? ''

  if (!apiKey) {
    throw new Error('VITE_ANTHROPIC_API_KEY not set')
  }

  const messages: AnthropicMessage[] = [
    { role: 'user', content: options.prompt },
  ]

  const body: Record<string, unknown> = {
    model: ANTHROPIC_MODEL,
    max_tokens: options.maxTokens ?? 1024,
    messages,
  }

  if (options.systemPrompt) {
    body.system = options.systemPrompt
  }

  const response = await fetch(`${ANTHROPIC_BASE}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify(body),
  })

  const data = (await response.json()) as AnthropicResponse

  if (!response.ok || data.error) {
    throw new Error(
      data.error?.message ?? `Anthropic returned ${response.status.toString()}`,
    )
  }

  const content =
    data.content?.find((b) => b.type === 'text')?.text ?? ''

  return {
    content,
    model: ANTHROPIC_MODEL,
    tier: 'paid',
    cached: false,
  }
}
