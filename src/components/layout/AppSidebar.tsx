/**
 * @file Main navigation menu, filtered by system role.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-26
 * @modified 2026-09-26
 */

import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'

import { cn } from '@/lib/utils'
import { selectIsAdmin, useAuthStore } from '@/stores/auth.store'

import { NAV_ITEMS } from './nav-items'

interface AppSidebarProps {
  onNavigate?: () => void
  className?: string
}

export function AppSidebar({ onNavigate, className }: AppSidebarProps) {
  const { t } = useTranslation()
  const isAdmin = useAuthStore(selectIsAdmin)
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin)

  return (
    <nav aria-label={t('nav.main')} className={cn('flex flex-col gap-1 p-3', className)}>
      {items.map(({ to, icon: Icon, labelKey }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors',
              'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              'focus-visible:ring-3 focus-visible:ring-sidebar-ring/50 focus-visible:outline-none',
              isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
            )
          }
        >
          <Icon className="size-4" aria-hidden />
          {t(labelKey)}
        </NavLink>
      ))}
    </nav>
  )
}
