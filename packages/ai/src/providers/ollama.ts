import type { AskOptions, AskResult } from '../types'

const OLLAMA_BASE = 'http://localhost:11434'
const OLLAMA_MODEL = 'llama3.1:8b'
const TIMEOUT_MS = 10_000

export async function askOllama(options: AskOptions): Promise<AskResult> {
  const messages: Array<{ role: string; content: string }> = []

  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt })
  }
  messages.push({ role: 'user', content: options.prompt })

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: false,
        options: {
          num_predict: options.maxTokens ?? 1024,
        },
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status.toString()}`)
    }

    const data = (await response.json()) as {
      message?: { content?: string }
    }
    const content = data.message?.content ?? ''

    return {
      content,
      model: OLLAMA_MODEL,
      tier: 'local',
      cached: false,
    }
  } catch (err) {
    throw new Error(
      `Ollama unavailable: ${err instanceof Error ? err.message : 'unknown'}`,
    )
  } finally {
    clearTimeout(timer)
  }
}
