/**
 * @file Restores the session from the refresh cookie when the app starts (UC-AUTH-02, FR-AUTH-08).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { useQuery } from '@tanstack/react-query'

import { refreshSession, toApiError } from '@/api/http-client'
import { selectAuthStatus, useAuthStore } from '@/stores/auth.store'

/** `restored`: signed in again; `anonymous`: nobody to restore; `locked`: the account was locked meanwhile. */
export type RestoreResult = 'restored' | 'anonymous' | 'locked'

const RESTORE_QUERY_KEY = ['auth', 'restore'] as const

/**
 * SCR-AUTH-08 A1. Any 401 means "not signed in" (no MSG-08: the user did not have a session in this tab yet).
 * Network errors and 5xx stay errors so the boot screen can offer "Try again".
 */
async function restoreSession(): Promise<RestoreResult> {
  try {
    await refreshSession()
    return 'restored'
  } catch (error) {
    const apiError = toApiError(error)
    if (apiError.isNetworkError || apiError.status >= 500) throw apiError
    useAuthStore.getState().setAnonymous()
    return apiError.code === 'AUTH_ACCOUNT_LOCKED' ? 'locked' : 'anonymous'
  }
}

export function useSessionRestore() {
  const status = useAuthStore(selectAuthStatus)
  return useQuery({
    queryKey: RESTORE_QUERY_KEY,
    queryFn: restoreSession,
    enabled: status === 'loading',
    retry: false,
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
  })
}
