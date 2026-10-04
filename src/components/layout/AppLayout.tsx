/**
 * @file Shell of every page after login (design "LAYOUT · Bố cục chung"): header on top, sidebar on the left,
 *   content on the right. Header and sidebar stay put; only the content scrolls.
 * @author MinhTien
 * @version 2.0.0
 * @since 2026-09-26
 * @modified 2026-10-04
 */

import { type ReactNode, Suspense, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'

import { LoadingScreen } from '@/components/common'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { useDisclosure, useMediaQuery } from '@/hooks'
import { cn } from '@/lib/utils'

import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'

/** "Collapse" is remembered in the browser (design: navigation table, sidebar footer) */
const RAIL_STORAGE_KEY = 'asms.sidebar.collapsed'

interface AppLayoutProps {
  /** Passed to the header; supplied by the router so that layout components never import features */
  accountMenu?: ReactNode
}

/**
 * Responsive rules of the design:
 * - ≥ 1280 px: sidebar 240 px, open by default, "Collapse" turns it into the 72 px rail;
 * - 768 – 1279 px: 72 px rail; "Expand" lays the 240 px sidebar over the content;
 * - < 768 px: 56 px header with a menu button opening a 288 px drawer.
 */
export function AppLayout({ accountMenu }: AppLayoutProps) {
  const { t } = useTranslation()
  const mobileNav = useDisclosure()
  const isWideScreen = useMediaQuery('(min-width: 1280px)')
  const [isCollapsed, setIsCollapsed] = useState(readCollapsed)
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)

  const isOverlay = !isWideScreen && isOverlayOpen
  const isRail = isWideScreen ? isCollapsed : !isOverlayOpen
  const isSidebarWide = isWideScreen && !isCollapsed

  const toggleRail = () => {
    if (!isWideScreen) {
      setIsOverlayOpen((open) => !open)
      return
    }
    const next = !isCollapsed
    setIsCollapsed(next)
    writeCollapsed(next)
  }
  const closeOverlay = () => setIsOverlayOpen(false)

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-background">
      <AppHeader
        isSidebarWide={isSidebarWide}
        onOpenMobileNav={mobileNav.open}
        accountMenu={accountMenu}
      />
      <div className="relative flex min-h-0 flex-1">
        <aside
          className={cn(
            'relative hidden shrink-0 border-r md:block',
            isSidebarWide ? 'w-60' : 'w-18',
          )}
        >
          <AppSidebar
            isRail={isRail}
            onToggleRail={toggleRail}
            onNavigate={isOverlay ? closeOverlay : undefined}
            className={cn(isOverlay && 'absolute inset-y-0 left-0 z-20 w-60 border-r shadow-lg')}
          />
        </aside>
        {isOverlay && (
          <button
            type="button"
            className="absolute inset-0 z-10 hidden cursor-default bg-overlay md:block"
            aria-label={t('nav.collapse')}
            onClick={closeOverlay}
          />
        )}

        <Sheet open={mobileNav.isOpen} onOpenChange={mobileNav.setIsOpen}>
          <SheetContent side="left" className="w-72 gap-0 bg-card p-0">
            <SheetTitle className="sr-only">{t('nav.main')}</SheetTitle>
            <AppSidebar onNavigate={mobileNav.close} />
          </SheetContent>
        </Sheet>

        <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6 lg:px-7 xl:px-8 xl:py-7">
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(RAIL_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function writeCollapsed(value: boolean) {
  try {
    localStorage.setItem(RAIL_STORAGE_KEY, String(value))
  } catch {
    // Storage blocked: the choice simply lasts until the page is reloaded
  }
}
