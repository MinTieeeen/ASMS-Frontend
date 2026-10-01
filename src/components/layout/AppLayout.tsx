/**
 * @file Layout for authenticated pages.
 * @author MinhTien
 * @version 1.1.0
 * @since 2026-09-26
 * @modified 2026-09-29
 */

import { type ReactNode, Suspense } from 'react'
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
interface AppLayoutProps {
  /** Passed to the header; supplied by the router so that layout components never import features */
  accountMenu?: ReactNode
}

export function AppLayout({ accountMenu }: AppLayoutProps) {
  const { t } = useTranslation()
  const mobileNav = useDisclosure()

  return (
    <div className="min-h-svh bg-background">
      <AppHeader onOpenMobileNav={mobileNav.open} accountMenu={accountMenu} />
      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100svh-4rem)] w-60 shrink-0 border-r bg-sidebar md:block">
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
