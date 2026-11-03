/**
 * @file Main navigation, grouped by role (design "LAYOUT · Bố cục chung", table "Điều hướng theo vai trò").
 * @author MinhTien
 * @version 3.1.0
 * @since 2026-09-26
 * @modified 2026-11-03
 */

import { House, ListChecks, type LucideIcon, Settings, UserRound, UsersRound } from 'lucide-react'

import { ROUTES } from '@/config/routes'

export interface NavItem {
  /** i18n key in the common namespace */
  labelKey: 'nav.home' | 'nav.groups' | 'nav.tasks' | 'nav.users' | 'nav.settings'
  to: string
  icon: LucideIcon
  /** The page is not built yet: shown greyed out with a "Coming soon" badge, not a link */
  comingSoon?: boolean
  /** Match only the main path, e.g. My groups should not also be selected inside a workspace */
  end?: boolean
  /** Additional paths that select this item, such as invite links */
  activePaths?: string[]
}

export interface NavGroup {
  labelKey: 'nav.group.workspace' | 'nav.group.admin'
  adminOnly?: boolean
  items: NavItem[]
}

// Reduced MVP scope: calendar, admin overview, audit logs and catalogs (F12.02, F12.07) are moved to GĐ2
export const NAV_GROUPS: NavGroup[] = [
  {
    labelKey: 'nav.group.workspace',
    items: [
      { labelKey: 'nav.home', to: ROUTES.dashboard, icon: House },
      {
        labelKey: 'nav.groups',
        to: ROUTES.groups,
        icon: UsersRound,
        end: true,
        activePaths: ['/join/:code'],
      },
      { labelKey: 'nav.tasks', to: ROUTES.tasks, icon: ListChecks },
    ],
  },
  {
    labelKey: 'nav.group.admin',
    adminOnly: true,
    items: [{ labelKey: 'nav.users', to: ROUTES.adminUsers, icon: UserRound }],
  },
]

/** Sidebar footer: "Settings" stays selected on every settings page (Profile, Security, Notifications) */
export const SETTINGS_NAV_ITEM: NavItem = {
  labelKey: 'nav.settings',
  to: ROUTES.settings,
  icon: Settings,
}
