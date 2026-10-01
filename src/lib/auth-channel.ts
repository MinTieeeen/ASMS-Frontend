/**
 * @file Cross-tab authentication messages over BroadcastChannel "auth" (section 7.6, SCR-AUTH-07).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-27
 * @modified 2026-09-27
 */

const CHANNEL_NAME = 'auth'

export type AuthMessage = 'logout'

// Missing in old browsers and in jsdom: cross-tab sync is then simply skipped
const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL_NAME)

/** Tells the other tabs of this browser; the sending tab does not receive its own message. */
export function postAuthMessage(message: AuthMessage): void {
  channel?.postMessage(message)
}

/** @returns a function that stops listening */
export function subscribeAuthMessages(listener: (message: AuthMessage) => void): () => void {
  if (!channel) return () => {}
  const handler = (event: MessageEvent<AuthMessage>) => listener(event.data)
  channel.addEventListener('message', handler)
  return () => channel.removeEventListener('message', handler)
}
