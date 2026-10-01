/**
 * @file Route guards based on authentication and system role.
 * @author MinhTien
 * @version 2.0.0
 * @since 2026-09-26
 * @modified 2026-09-29
 */

import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router'

import { LOGIN_QUERY } from '@/config/routes'
import { loginPath, roleHome, safeRedirect } from '@/features/auth'
import {
  selectExitPath,
  selectIsAdmin,
  selectIsAuthenticated,
  selectUser,
  useAuthStore,
} from '@/stores/auth.store'

import ForbiddenPage from './ForbiddenPage'

/**
 * These guards only improve UX; the backend always re-checks permissions.
 * Group roles (leader/deputy/member) are checked inside each feature, not here.
 * They run under AuthBootstrap, so the status is never `loading` here.
 */

/**
 * ProtectedRoute: keeps the current page as `redirect` so login can bring the user back (FR-AUTH-04). After a
 * deliberate logout the store's `exitPath` wins, so this guard is the only place that leaves protected pages.
 */
export function RequireAuth() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const exitPath = useAuthStore(selectExitPath)
  const location = useLocation()

  if (!isAuthenticated) {
    const target = exitPath ?? loginPath({ redirect: location.pathname + location.search })
    return <Navigate to={target} replace />
  }
  return <Outlet />
}

/** AdminRoute: a signed-in user without the Admin role gets the 403 page. */
export function RequireAdmin() {
  const isAdmin = useAuthStore(selectIsAdmin)
  return isAdmin ? <Outlet /> : <ForbiddenPage />
}

/**
 * GuestRoute: signed-in users leave the guest pages (FR-AUTH-05). This is also where a successful login lands:
 * the login page only stores the session, and this guard goes to `redirect` when it is a safe internal path,
 * otherwise to the home page of the role (FR-AUTH-04).
 */
export function GuestOnly() {
  const user = useAuthStore(selectUser)
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const [searchParams] = useSearchParams()

  if (!isAuthenticated) return <Outlet />
  const target = safeRedirect(searchParams.get(LOGIN_QUERY.redirect)) ?? roleHome(user)
  return <Navigate to={target} replace />
}
