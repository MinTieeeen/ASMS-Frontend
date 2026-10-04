/**
 * @file "Settings" page template (design "LAYOUT · Bố cục chung", table "Mẫu trang"): H1 "Settings" and its
 *   description, tabs Profile | Security | Notifications, content at most 760 px wide.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-04
 * @modified 2026-10-04
 */

import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet } from 'react-router'

import { LoadingScreen, PageHeader } from '@/components/common'
import { ROUTES } from '@/config/routes'
import { cn } from '@/lib/utils'

interface SettingsTab {
  labelKey: 'settings.tab.profile' | 'settings.tab.security' | 'settings.tab.notifications'
  to: string
  /** The page is not built yet: the tab is shown but cannot be opened */
  comingSoon?: boolean
}

// TODO(GĐ2): open Notifications (F01.06) once its page exists
const TABS: SettingsTab[] = [
  { labelKey: 'settings.tab.profile', to: ROUTES.profileSettings },
  { labelKey: 'settings.tab.security', to: ROUTES.securitySettings },
  { labelKey: 'settings.tab.notifications', to: ROUTES.notificationSettings, comingSoon: true },
]

const TAB_CLASS =
  'mr-5 px-0.5 py-2.5 text-sm whitespace-nowrap outline-none focus-visible:shadow-focus'

export function SettingsLayout() {
  const { t } = useTranslation()

  return (
    <div className="flex w-full max-w-190 flex-col gap-5">
      <PageHeader title={t('settings.title')} description={t('settings.description')} />
      <nav aria-label={t('settings.title')} className="flex overflow-x-auto border-b">
        {TABS.map((tab) =>
          tab.comingSoon ? (
            <span
              key={tab.to}
              aria-disabled="true"
              title={t('nav.comingSoon')}
              className={cn(TAB_CLASS, 'font-medium text-muted-foreground opacity-60')}
            >
              {t(tab.labelKey)}
            </span>
          ) : (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                cn(
                  TAB_CLASS,
                  isActive
                    ? 'font-semibold text-foreground shadow-[inset_0_-2px_0_var(--primary)]'
                    : 'font-medium text-muted-foreground hover:text-foreground',
                )
              }
            >
              {t(tab.labelKey)}
            </NavLink>
          ),
        )}
      </nav>
      <Suspense fallback={<LoadingScreen />}>
        <Outlet />
      </Suspense>
    </div>
  )
}
