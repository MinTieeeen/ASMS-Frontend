/**
 * @file Central route paths. Use ROUTES.xxx instead of hard-coded strings in <Link>/navigate.
 * @author MinhTien
 * @version 2.0.0
 * @since 2026-09-26
 * @modified 2026-09-27
 */

export const ROUTES = {
  home: '/',
  login: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  activate: '/activate',
  dashboard: '/dashboard',
  securitySettings: '/settings/security',
  groups: '/groups',
  groupDetail: (groupId: string) => `/groups/${groupId}`,
  profile: '/profile',
  admin: '/admin',
  adminUsers: '/admin/users',
} as const

/** Query parameters understood by the login page (Auth screen spec, "Tham số msg trên /login") */
export const LOGIN_QUERY = {
  redirect: 'redirect',
  /** Pre-fills the User ID, e.g. after activation */
  userCode: 'userCode',
  msg: 'msg',
} as const
