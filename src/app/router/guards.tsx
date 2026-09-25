/**
 * @file Route guards based on authentication and system role.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-26
 * @modified 2026-09-26
 */

import { Navigate, Outlet, useLocation } from 'react-router'

import { ROUTES } from '@/config/routes'
import { selectIsAdmin, selectIsAuthenticated, useAuthStore } from '@/stores/auth.store'

/**
 * These guards only improve UX; the backend always re-checks permissions
 * Group roles (leader/deputy/member) are checked inside each feature, not here.
 */
export function RequireAuth() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  }
  return <Outlet />
}

export function RequireAdmin() {
  const isAdmin = useAuthStore(selectIsAdmin)
  return isAdmin ? <Outlet /> : <Navigate to={ROUTES.dashboard} replace />
}

export function GuestOnly() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  return isAuthenticated ? <Navigate to={ROUTES.dashboard} replace /> : <Outlet />
}
