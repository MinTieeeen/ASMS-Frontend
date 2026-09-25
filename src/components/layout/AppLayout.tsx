/**
 * @file Layout for authenticated pages.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-26
 * @modified 2026-09-26
 */

import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'

import { LoadingScreen } from '@/components/common'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { useDisclosure } from '@/hooks'

import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'

/**
 * Header + sidebar on desktop, slide-over sheet on mobile (NFR13). Page content renders through <Outlet />.
 */
export function AppLayout() {
  const { t } = useTranslation()
  const mobileNav = useDisclosure()

  return (
    <div className="min-h-svh bg-background">
      <AppHeader onOpenMobileNav={mobileNav.open} />
      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-60 shrink-0 border-r bg-sidebar md:block">
          <AppSidebar />
        </aside>

        <Sheet open={mobileNav.isOpen} onOpenChange={mobileNav.setIsOpen}>
          <SheetContent side="left" className="w-64 bg-sidebar p-0">
            <SheetTitle className="px-6 pt-5">{t('app.name')}</SheetTitle>
            <AppSidebar onNavigate={mobileNav.close} />
          </SheetContent>
        </Sheet>

        <main className="min-w-0 flex-1 p-4 md:p-6">
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
