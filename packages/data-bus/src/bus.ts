import type { BusEvent, BusMessage } from './types'

const CHANNEL_NAME = 'micro-os-bus'

// Lazily created so SSR/test environments don't blow up
let channel: BroadcastChannel | null = null

function getChannel(): BroadcastChannel {
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME)
  }
  return channel
}

/**
 * Emit an event to all listeners on the bus (including the current tab).
 * Listeners registered with `on()` in the same tab will NOT receive this
 * via BroadcastChannel (BC only delivers to other tabs), so we also dispatch
 * a custom DOM event for same-tab delivery.
 */
export function emit(event: BusEvent, payload?: unknown): void {
  const message: BusMessage = { event, payload, timestamp: Date.now() }

  // Cross-tab delivery
  try {
    getChannel().postMessage(message)
  } catch {
    // BroadcastChannel unavailable (e.g. private browsing on some browsers)
  }

  // Same-tab delivery via CustomEvent
  window.dispatchEvent(new CustomEvent(`micro-os:${event}`, { detail: message }))
}

/**
 * Subscribe to a bus event. Handles both cross-tab (BroadcastChannel) and
 * same-tab (CustomEvent) delivery.
 *
 * @returns cleanup function — call it to unsubscribe
 */
export function on(
  event: BusEvent,
  handler: (payload: unknown) => void,
): () => void {
  const bc = getChannel()

  // Cross-tab handler
  const bcHandler = (e: MessageEvent<BusMessage>) => {
    if (e.data.event === event) {
      handler(e.data.payload)
    }
  }

  // Same-tab handler
  const domHandler = (e: Event) => {
    const custom = e as CustomEvent<BusMessage>
    handler(custom.detail.payload)
  }

  bc.addEventListener('message', bcHandler)
  window.addEventListener(`micro-os:${event}`, domHandler)

  return () => {
    bc.removeEventListener('message', bcHandler)
    window.removeEventListener(`micro-os:${event}`, domHandler)
  }
}
