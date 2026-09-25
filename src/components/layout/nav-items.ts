/**
 * @file Main navigation items.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-26
 * @modified 2026-09-26
 */

import { LayoutDashboard, type LucideIcon, ShieldCheck, UserRound, UsersRound } from 'lucide-react'

import { ROUTES } from '@/config/routes'

export interface NavItem {
  /** i18n key in the common namespace */
  labelKey: 'nav.dashboard' | 'nav.groups' | 'nav.profile' | 'nav.admin'
  to: string
  icon: LucideIcon
  adminOnly?: boolean
}

/** Add new menu entries here; the sidebar renders them automatically. */
export const NAV_ITEMS: NavItem[] = [
  { labelKey: 'nav.dashboard', to: ROUTES.dashboard, icon: LayoutDashboard },
  { labelKey: 'nav.groups', to: ROUTES.groups, icon: UsersRound },
  { labelKey: 'nav.profile', to: ROUTES.profile, icon: UserRound },
  { labelKey: 'nav.admin', to: ROUTES.admin, icon: ShieldCheck, adminOnly: true },
]
