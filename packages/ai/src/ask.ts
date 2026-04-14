import { getCached, setCached } from './cache'
import { askOllama } from './providers/ollama'
import { askGroq } from './providers/groq'
import { askAnthropic } from './providers/anthropic'
import type { AskOptions, AskResult, AiTier } from './types'

// Model name per tier — used as the cache key component
const TIER_MODEL: Record<AiTier, string> = {
  local: 'llama3.1:8b',
  free: 'llama3-8b-8192',
  paid: 'claude-haiku-3-5-20241022',
}

const TIER_ORDER: AiTier[] = ['local', 'free', 'paid']

function tiersFrom(start: AiTier): AiTier[] {
  const idx = TIER_ORDER.indexOf(start)
  return TIER_ORDER.slice(idx)
}

export async function ask(options: AskOptions): Promise<AskResult> {
  const startTier = options.tier ?? 'free'
  const useCache = options.cache !== false
  const tiers = tiersFrom(startTier)

  // Cache lookup uses the first tier's model as the key
  if (useCache) {
    const model = TIER_MODEL[startTier]
    const cached = await getCached(options.prompt, options.systemPrompt, model)
    if (cached !== null) {
      return {
        content: cached,
        model,
        tier: startTier,
        cached: true,
      }
    }
  }

  let lastError = 'All AI tiers unavailable'

  for (const tier of tiers) {
    try {
      let result: AskResult

      if (tier === 'local') {
        result = await askOllama(options)
      } else if (tier === 'free') {
        result = await askGroq(options)
      } else {
        result = await askAnthropic(options)
      }

      // Cache the successful result
      if (useCache) {
        await setCached(
          options.prompt,
          options.systemPrompt,
          result.model,
          result.content,
        )
      }

      return result
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err)
      // Fall through to next tier
    }
  }

  // All tiers exhausted — return graceful error, never throw
  return {
    content: '',
    model: 'none',
    tier: startTier,
    cached: false,
    error: lastError,
  }
}
