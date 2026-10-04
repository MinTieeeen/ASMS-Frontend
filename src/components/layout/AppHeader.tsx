/**
 * @file Header of the app shell (design "LAYOUT · Bố cục chung", markers 2 to 5 and 10): 64 px on desktop with the
 *   logo area as wide as the sidebar, 56 px on mobile with the menu button.
 * @author MinhTien
 * @version 2.0.0
 * @since 2026-09-26
 * @modified 2026-10-04
 */

import { Menu } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { LanguageToggle, Logo, ThemeToggle } from '@/components/common'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/config/routes'
import { useIsMobile } from '@/hooks'
import { cn } from '@/lib/utils'

import { HeaderNotifications } from './HeaderNotifications'
import { HeaderSearch } from './HeaderSearch'

interface AppHeaderProps {
  /** The sidebar is open at 240 px, so the logo area is too; otherwise it is the 72 px rail */
  isSidebarWide: boolean
  onOpenMobileNav: () => void
  /** Right-most slot, e.g. the account menu (SCR-AUTH-07); layout components never import features */
  accountMenu?: ReactNode
}

export function AppHeader({ isSidebarWide, onOpenMobileNav, accountMenu }: AppHeaderProps) {
  const { t } = useTranslation()
  const isMobile = useIsMobile()

  return (
    <header className="relative z-30 flex h-14 shrink-0 items-center border-b bg-card md:h-16">
      <Button
        variant="ghost"
        size="icon"
        className="ml-2 md:hidden"
        onClick={onOpenMobileNav}
        aria-label={t('nav.openMenu')}
      >
        <Menu />
      </Button>
      <div
        className={cn(
          'flex shrink-0 items-center px-2 md:w-18 md:justify-center md:px-0',
          isSidebarWide && 'md:w-60 md:justify-start md:px-5',
        )}
      >
        {/* Mobile and the open sidebar show the name; the rail shows the mark only */}
        <Logo
          variant="expand"
          size={28}
          href={ROUTES.home}
          className={cn(!isSidebarWide && 'md:hidden')}
        />
        {!isSidebarWide && (
          <Logo variant="mark" size={32} href={ROUTES.home} className="hidden md:inline-flex" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-4 pr-3 md:pr-6 md:pl-8">
        {/* One instance only, so that Ctrl K has a single target: left from 768 px, among the icons below */}
        {!isMobile && (
          <div className="flex min-w-0 flex-1">
            <HeaderSearch />
          </div>
        )}
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {isMobile && <HeaderSearch />}
          <HeaderNotifications />
          <LanguageToggle />
          <ThemeToggle />
          {accountMenu && (
            <>
              <span className="mx-1 h-6 w-px bg-border" aria-hidden />
              {accountMenu}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
