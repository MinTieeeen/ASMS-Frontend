/**
 * @file Layout for guest pages.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-26
 * @modified 2026-09-26
 */

import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'

import { LoadingScreen, ThemeToggle } from '@/components/common'

/** Used by login, register, forgot password and invite link pages. */
export function AuthLayout() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-svh flex-col bg-muted/40">
      <header className="flex h-14 items-center justify-between px-4">
        <span className="font-heading font-semibold">{t('app.name')}</span>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center p-4">
        <Suspense fallback={<LoadingScreen />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
