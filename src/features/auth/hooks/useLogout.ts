/**
 * @file Logout of this device and of every device (UC-AUTH-03, FR-AUTH-10, FR-AUTH-11, SCR-AUTH-07 A2/A4).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

import { logout, logoutAll } from '@/api/generated/endpoints/auth/auth'
import { toApiError } from '@/api/http-client'
import { LOGOUT_TIMEOUT_MS } from '@/config/constants'
import { ROUTES } from '@/config/routes'
import { postAuthMessage } from '@/lib/auth-channel'
import { useAuthStore } from '@/stores/auth.store'

import { loginPath } from '../utils/redirect'

/**
 * Clears the local session: token, user, query cache (no data of this account may leak to the next one), then tells
 * the other tabs. RequireAuth then navigates to `exitPath`.
 */
function useEndLocalSession() {
  const queryClient = useQueryClient()
  return useCallback(
    (exitPath: string) => {
      queryClient.clear()
      useAuthStore.getState().setAnonymous(exitPath)
      postAuthMessage('logout')
    },
    [queryClient],
  )
}

export function useLogout() {
  const endLocalSession = useEndLocalSession()
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false)

  /** A2: never waits more than 3 s and treats every error (network, 401...) as a success. */
  const logoutThisDevice = useCallback(async () => {
    const timeout = new Promise((resolve) => setTimeout(resolve, LOGOUT_TIMEOUT_MS))
    await Promise.race([logout().catch(() => undefined), timeout])
    endLocalSession(ROUTES.login)
  }, [endLocalSession])

  /**
   * A4: a 401 counts as success (the session is gone anyway); other errors are rethrown so the dialog stays open
   * and shows MSG-21.
   */
  const logoutEveryDevice = useCallback(async () => {
    setIsLoggingOutAll(true)
    try {
      await logoutAll()
    } catch (error) {
      if (toApiError(error).status !== 401) throw error
    } finally {
      setIsLoggingOutAll(false)
    }
    endLocalSession(loginPath({ msg: 'logged_out_all' }))
  }, [endLocalSession])

  return { logoutThisDevice, logoutEveryDevice, isLoggingOutAll }
}
