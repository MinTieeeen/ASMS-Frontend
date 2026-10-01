/**
 * @file Banner state of the Auth forms: which message to show and, for lockouts and rate limits, the countdown.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { useCallback, useState } from 'react'

import { toApiError } from '@/api/http-client'

import type { BannerKind } from '../components/AuthBanner'
import { useCountdown } from './useCountdown'

const TIMED_KINDS: readonly BannerKind[] = ['tempLocked', 'rateLimited']

/** Maps an API error to its banner (Auth screen spec, "Ánh xạ lỗi API"); unknown codes fall back to MSG-21. */
export function bannerKindOf(error: unknown): BannerKind {
  const apiError = toApiError(error)
  if (apiError.isNetworkError) return 'network'
  switch (apiError.code) {
    case 'AUTH_INVALID_CREDENTIALS':
      return 'invalidCredentials'
    case 'AUTH_ACCOUNT_TEMP_LOCKED':
      return 'tempLocked'
    case 'AUTH_ACCOUNT_LOCKED':
      return 'accountLocked'
    case 'AUTH_RATE_LIMITED':
      return 'rateLimited'
    default:
      return 'generic'
  }
}

/**
 * A timed banner hides itself when its countdown reaches zero, which also re-enables the submit button
 * (SCR-AUTH-01 A5).
 */
export function useAuthBanner(initialKind: BannerKind | null = null) {
  const [kind, setKind] = useState<BannerKind | null>(initialKind)
  const countdown = useCountdown()
  const { start, reset } = countdown

  const isTimed = kind !== null && TIMED_KINDS.includes(kind)
  const visibleKind = isTimed && !countdown.isRunning ? null : kind

  const show = useCallback(
    (next: BannerKind, retryAfterSeconds?: number) => {
      setKind(next)
      if (TIMED_KINDS.includes(next)) start(retryAfterSeconds ?? 0)
      else reset()
    },
    [start, reset],
  )

  const showError = useCallback(
    (error: unknown) => show(bannerKindOf(error), toApiError(error).retryAfterSeconds),
    [show],
  )

  const clear = useCallback(() => {
    setKind(null)
    reset()
  }, [reset])

  return {
    kind: visibleKind,
    remainingSeconds: countdown.remaining,
    /** true while a lockout or rate limit countdown runs: the submit button stays disabled */
    isBlocked: isTimed && countdown.isRunning,
    show,
    showError,
    clear,
  }
}
