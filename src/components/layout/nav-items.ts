/**
 * @file Main navigation, grouped by role (design "LAYOUT · Bố cục chung", table "Điều hướng theo vai trò").
 * @author MinhTien
 * @version 2.0.0
 * @since 2026-09-26
 * @modified 2026-10-04
 */

import {
  CalendarDays,
  CalendarOff,
  ChartColumn,
  House,
  ListChecks,
  type LucideIcon,
  School,
  ScrollText,
  Settings,
  UserRound,
  UsersRound,
} from 'lucide-react'

import { ROUTES } from '@/config/routes'

export interface NavItem {
  /** i18n key in the common namespace */
  labelKey:
    | 'nav.home'
    | 'nav.groups'
    | 'nav.tasks'
    | 'nav.calendar'
    | 'nav.adminOverview'
    | 'nav.users'
    | 'nav.auditLogs'
    | 'nav.schools'
    | 'nav.holidays'
    | 'nav.settings'
  to: string
  icon: LucideIcon
  /** The page is not built yet: shown greyed out with a "Coming soon" badge, not a link */
  comingSoon?: boolean
}

export interface NavGroup {
  labelKey: 'nav.group.workspace' | 'nav.group.admin' | 'nav.group.config'
  adminOnly?: boolean
  items: NavItem[]
}

// TODO(M2, M3, M4): drop `comingSoon` as each page is built
export const NAV_GROUPS: NavGroup[] = [
  {
    labelKey: 'nav.group.workspace',
    items: [
      { labelKey: 'nav.home', to: ROUTES.dashboard, icon: House },
      { labelKey: 'nav.groups', to: ROUTES.groups, icon: UsersRound, comingSoon: true },
      { labelKey: 'nav.tasks', to: ROUTES.tasks, icon: ListChecks, comingSoon: true },
      { labelKey: 'nav.calendar', to: ROUTES.calendar, icon: CalendarDays, comingSoon: true },
    ],
  },
  {
    labelKey: 'nav.group.admin',
    adminOnly: true,
    items: [
      { labelKey: 'nav.adminOverview', to: ROUTES.admin, icon: ChartColumn, comingSoon: true },
      { labelKey: 'nav.users', to: ROUTES.adminUsers, icon: UserRound },
      { labelKey: 'nav.auditLogs', to: ROUTES.adminAuditLogs, icon: ScrollText, comingSoon: true },
    ],
  },
  {
    labelKey: 'nav.group.config',
    adminOnly: true,
    items: [
      { labelKey: 'nav.schools', to: ROUTES.adminSchools, icon: School, comingSoon: true },
      { labelKey: 'nav.holidays', to: ROUTES.adminHolidays, icon: CalendarOff, comingSoon: true },
    ],
  },
]

/** Sidebar footer: "Settings" stays selected on every settings page (Profile, Security, Notifications) */
export const SETTINGS_NAV_ITEM: NavItem = {
  labelKey: 'nav.settings',
  to: ROUTES.settings,
  icon: Settings,
}
