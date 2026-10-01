/**
 * @file Root of the route tree: restores the session before any page renders (SCR-AUTH-08, UC-AUTH-02).
 * @author MinhTien
 * @version 1.1.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useNavigate } from 'react-router'

import { selectAuthStatus, selectUser, useAuthStore } from '@/stores/auth.store'

import { useSessionLifecycle } from '../hooks/useSessionLifecycle'
import { useSessionRestore } from '../hooks/useSessionRestore'
import { loginPath } from '../utils/redirect'
import { BootError, BootLoading } from './BootScreen'

/**
 * FR-AUTH-08: while the status is `loading`, the boot screen is shown instead of routes, so the login page never
 * flashes before a valid session is restored. Pages render through <Outlet /> afterwards.
 */
export function AuthBootstrap() {
  useSessionLifecycle()
  const navigate = useNavigate()
  const status = useAuthStore(selectAuthStatus)
  const restore = useSessionRestore()
  const { i18n } = useTranslation()
  const language = useAuthStore(selectUser)?.language

  // NFR14: the UI follows the language saved in the user's profile once signed in
  useEffect(() => {
    if (language) void i18n.changeLanguage(language.toLowerCase())
  }, [language, i18n])

  // SCR-AUTH-08 A1: an account locked by an Admin goes to the login page with MSG-06, once
  useEffect(() => {
    if (restore.data === 'locked') {
      navigate(loginPath({ msg: 'account_locked' }), { replace: true })
    }
  }, [restore.data, navigate])

  if (status !== 'loading') {
    return <Outlet />
  }
  if (restore.isError) {
    return <BootError onRetry={() => void restore.refetch()} isRetrying={restore.isFetching} />
  }
  return <BootLoading />
}
