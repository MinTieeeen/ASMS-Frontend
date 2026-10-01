/**
 * @file Where to send the user after login, and how to come back after a forced login (BR-AUTH-13, FR-AUTH-04).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import type { CurrentUserResponse } from '@/api/generated/models'
import { LOGIN_QUERY, ROUTES } from '@/config/routes'

/**
 * BR-AUTH-13: only an internal path starting with a single "/" is accepted; "//evil.com", full URLs and backslash
 * tricks are rejected so the redirect can never leave the application.
 */
export function safeRedirect(value: string | null | undefined): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return null
  }
  return value
}

/** FR-AUTH-04: Admins land on /admin, users on /dashboard. */
export function roleHome(user: Pick<CurrentUserResponse, 'systemRole'> | null): string {
  return user?.systemRole === 'ADMIN' ? ROUTES.admin : ROUTES.dashboard
}

/** Notices the login page shows from `?msg=` (Auth screen spec, "Tham số msg trên /login"). */
export const LOGIN_NOTICES = [
  'activated',
  'reset',
  'session_expired',
  'logged_out_all',
  'account_locked',
] as const
export type LoginNotice = (typeof LOGIN_NOTICES)[number]

/** Builds `/login?...`; the redirect is kept only when it is a safe internal path. */
export function loginPath(
  options: { redirect?: string; msg?: LoginNotice; userCode?: string } = {},
): string {
  const params = new URLSearchParams()
  const redirect = safeRedirect(options.redirect)
  if (redirect && redirect !== ROUTES.login) params.set(LOGIN_QUERY.redirect, redirect)
  if (options.msg) params.set(LOGIN_QUERY.msg, options.msg)
  if (options.userCode) params.set(LOGIN_QUERY.userCode, options.userCode)
  const query = params.toString()
  return query ? `${ROUTES.login}?${query}` : ROUTES.login
}
