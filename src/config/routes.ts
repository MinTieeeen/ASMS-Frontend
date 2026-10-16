/**
 * @file Central route paths. Use ROUTES.xxx instead of hard-coded strings in <Link>/navigate.
 * @author MinhTien
 * @version 2.1.0
 * @since 2026-09-26
 * @modified 2026-10-16
 */

export const ROUTES = {
  home: '/',
  login: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  activate: '/activate',
  dashboard: '/dashboard',
  groups: '/groups',
  /** Group workspace; its index is the group overview (F07.01) */
  groupDetail: (groupId: string) => `/groups/${groupId}`,
  groupTasks: (groupId: string) => `/groups/${groupId}/tasks`,
  /** Task board with the detail sheet of one task open (shareable link) */
  groupTask: (groupId: string, taskId: string) => `/groups/${groupId}/tasks?task=${taskId}`,
  groupPhases: (groupId: string) => `/groups/${groupId}/phases`,
  groupMilestones: (groupId: string) => `/groups/${groupId}/milestones`,
  groupMilestoneDetail: (groupId: string, milestoneId: string) =>
    `/groups/${groupId}/milestones/${milestoneId}`,
  groupMembers: (groupId: string) => `/groups/${groupId}/members`,
  groupProgress: (groupId: string) => `/groups/${groupId}/progress`,
  groupReviews: (groupId: string) => `/groups/${groupId}/reviews`,
  groupResources: (groupId: string) => `/groups/${groupId}/resources`,
  groupActivity: (groupId: string) => `/groups/${groupId}/activity`,
  groupSettings: (groupId: string) => `/groups/${groupId}/settings`,
  /** Invite link (UC04); also reached by typing the 6-character group code */
  joinGroup: (code: string) => `/join/${code}`,
  tasks: '/tasks',
  calendar: '/calendar',
  notifications: '/notifications',
  settings: '/settings',
  profileSettings: '/settings/profile',
  /** GitHub sends the browser back here; must match the OAuth App callback URL */
  githubCallback: '/settings/profile/github/callback',
  userProfile: (userId: string) => `/users/${userId}`,
  securitySettings: '/settings/security',
  notificationSettings: '/settings/notifications',
  admin: '/admin',
  adminUsers: '/admin/users',
  adminUserDetail: (userId: string) => `/admin/users/${userId}`,
  adminAuditLogs: '/admin/audit-logs',
  adminSchools: '/admin/settings/schools',
  adminHolidays: '/admin/settings/holidays',
} as const

/** Query parameters understood by the login page (Auth screen spec, "Tham số msg trên /login") */
export const LOGIN_QUERY = {
  redirect: 'redirect',
  /** Pre-fills the User ID, e.g. after activation */
  userCode: 'userCode',
  msg: 'msg',
} as const
