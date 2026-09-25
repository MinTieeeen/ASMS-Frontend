/**
 * @file 404 page for unknown routes.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-26
 * @modified 2026-09-26
 */

import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { ROUTES } from '@/config/routes'

export default function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4 text-center">
      <p className="font-heading text-6xl font-bold text-primary">404</p>
      <h1 className="text-xl font-semibold">{t('error.notFound')}</h1>
      <p className="text-muted-foreground">{t('error.notFoundDescription')}</p>
      <Button asChild>
        <Link to={ROUTES.home}>{t('action.back')}</Link>
      </Button>
    </div>
  )
}
