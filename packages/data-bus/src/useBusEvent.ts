import { useEffect } from 'react'

import { on } from './bus'
import type { BusEvent } from './types'

/**
 * Subscribe to a bus event for the lifetime of the component.
 * Automatically unsubscribes on unmount.
 */
export function useBusEvent(
  event: BusEvent,
  handler: (payload: unknown) => void,
): void {
  useEffect(() => {
    const cleanup = on(event, handler)
    return cleanup
    // handler identity is intentionally excluded — callers should memoize if needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event])
}
