import { useState, useCallback } from 'react'

import { ask } from './ask'
import type { AskOptions, AskResult } from './types'

export interface UseAIReturn {
  loading: boolean
  result: AskResult | null
  error: string | null
  run: (options: AskOptions) => Promise<AskResult>
}

export function useAI(): UseAIReturn {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AskResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (options: AskOptions): Promise<AskResult> => {
    setLoading(true)
    setError(null)

    const res = await ask(options)

    setResult(res)
    setLoading(false)

    if (res.error) {
      setError(res.error)
    }

    return res
  }, [])

  return { loading, result, error, run }
}
