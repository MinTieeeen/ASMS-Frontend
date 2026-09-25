/**
 * @file Central route paths. Use ROUTES.xxx instead of hard-coded strings in <Link>/navigate.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-26
 * @modified 2026-09-26
 */

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  dashboard: '/dashboard',
  groups: '/groups',
  groupDetail: (groupId: string) => `/groups/${groupId}`,
  profile: '/profile',
  admin: '/admin',
} as const
