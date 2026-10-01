/**
 * @file Seconds-based countdown for lockouts, rate limits and the resend cooldown (SCR-AUTH-01 S05/S07, SCR-AUTH-02).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { useCallback, useEffect, useState } from 'react'

const TICK_MS = 1_000

/**
 * The end time is fixed when `start` is called, so a slow tab never makes the countdown drift
 * (SCR-AUTH-01 notes: counted from the moment the response arrived).
 */
export function useCountdown() {
  const [endsAt, setEndsAt] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (endsAt === null) return
    const timer = setInterval(() => {
      const current = Date.now()
      setNow(current)
      if (current >= endsAt) setEndsAt(null)
    }, TICK_MS)
    return () => clearInterval(timer)
  }, [endsAt])

  const start = useCallback((seconds: number) => {
    const current = Date.now()
    setNow(current)
    setEndsAt(current + seconds * 1_000)
  }, [])

  const reset = useCallback(() => setEndsAt(null), [])

  const remaining = endsAt === null ? 0 : Math.max(0, Math.ceil((endsAt - now) / 1_000))
  return { remaining, isRunning: remaining > 0, start, reset }
}

/** 742 → "12:22" (MSG-05 format mm:ss). */
export function formatMinutesSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
