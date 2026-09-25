/**
 * @file Top bar of the authenticated layout.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-26
 * @modified 2026-09-26
 */

import { Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { ThemeToggle } from '@/components/common'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/config/routes'

interface AppHeaderProps {
  onOpenMobileNav: () => void
}

export function AppHeader({ onOpenMobileNav }: AppHeaderProps) {
  const { t } = useTranslation()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onOpenMobileNav}
        aria-label={t('nav.openMenu')}
      >
        <Menu />
      </Button>
      <Link to={ROUTES.dashboard} className="font-heading font-semibold">
        {t('app.name')}
      </Link>
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
      </div>
    </header>
  )
}
