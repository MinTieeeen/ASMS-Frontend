/**
 * @file Account security page, SCR-AUTH-05 (UC-AUTH-06, UC-AUTH-09).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'

import { ROUTES } from '@/config/routes'
import { cn } from '@/lib/utils'
import { selectUser, useAuthStore } from '@/stores/auth.store'

import { ChangePasswordCard } from '../components/ChangePasswordCard'
import { SessionsCard } from '../components/SessionsCard'

export default function SecuritySettingsPage() {
  const { t } = useTranslation('auth')
  const user = useAuthStore(selectUser)

  if (!user) return null
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 md:flex-row md:gap-8">
      {/* Settings navigation: only "Security" exists for now, other settings join later */}
      <nav aria-label={t('security.settings')} className="md:w-48 md:shrink-0">
        <p className="mb-2 hidden px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase md:block">
          {t('security.settings')}
        </p>
        <NavLink
          to={ROUTES.securitySettings}
          className={({ isActive }) =>
            cn(
              'flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium',
              isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-muted',
            )
          }
        >
          <ShieldCheck className="size-4" aria-hidden />
          {t('menu.security')}
        </NavLink>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <h1 className="font-heading text-2xl leading-8 font-semibold">{t('security.title')}</h1>
        <ChangePasswordCard user={user} />
        <SessionsCard />
      </div>
    </div>
  )
}
