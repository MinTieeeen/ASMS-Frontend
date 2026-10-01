/**
 * @file Ends the local session when the server or another tab says so (SCR-AUTH-08 A2, A3, A4).
 * @author MinhTien
 * @version 1.1.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { type SessionEndReason, setSessionEndHandler } from '@/api/http-client'
import { ROUTES } from '@/config/routes'
import { subscribeAuthMessages } from '@/lib/auth-channel'
import { useAuthStore } from '@/stores/auth.store'

import { loginPath } from '../utils/redirect'

/**
 * - A2/A3: the session could not be refreshed → login with MSG-08 (or MSG-06 when the account was locked), keeping
 *   the current page as `redirect`.
 * - A4: another tab logged out → login page.
 *
 * Only the store changes here; RequireAuth performs the navigation through `exitPath`.
 */
export function useSessionLifecycle(): void {
  const queryClient = useQueryClient()

  useEffect(() => {
    const endSession = (exitPath: string) => {
      queryClient.clear()
      useAuthStore.getState().setAnonymous(exitPath)
    }

    setSessionEndHandler((reason: SessionEndReason) => {
      endSession(
        loginPath({
          msg: reason === 'locked' ? 'account_locked' : 'session_expired',
          redirect: window.location.pathname + window.location.search,
        }),
      )
    })

    const unsubscribe = subscribeAuthMessages((message) => {
      if (message === 'logout') endSession(ROUTES.login)
    })

    return () => {
      setSessionEndHandler(() => {})
      unsubscribe()
    }
  }, [queryClient])
}
