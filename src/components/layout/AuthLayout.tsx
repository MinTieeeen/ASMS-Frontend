/**
 * @file Layout for guest pages: brand panel on large screens, logo and form centered.
 * @author MinhTien
 * @version 2.0.0
 * @since 2026-09-26
 * @modified 2026-09-27
 */

import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'

import illustration from '@/assets/auth-illustration.svg'
import { LanguageToggle, LoadingScreen, Logo, ThemeToggle } from '@/components/common'

/**
 * Screen conventions of the Auth spec: the brand panel shows from 1024 px; below 480 px the form takes the full width
 * with 16 px margins and the logo switches to its stacked form (Logo variant "auto").
 */
export function AuthLayout() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-svh bg-card text-foreground">
      <aside className="hidden w-140 shrink-0 flex-col justify-between bg-brand px-14 py-16 text-brand-foreground lg:flex">
        <img src={illustration} alt="" className="mt-2 h-auto w-full max-w-md" />
        <p className="font-heading text-4xl leading-11 font-semibold tracking-[-0.02em] text-balance">
          {t('app.slogan')}
        </p>
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="absolute top-4 right-4 flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
        </div>
        <main className="flex flex-1 flex-col items-center justify-center gap-7 px-4 py-8 sm:p-12">
          <Logo variant="auto" size={32} />
          <div className="w-full max-w-100">
            <Suspense fallback={<LoadingScreen />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}
