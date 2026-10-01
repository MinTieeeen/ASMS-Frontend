/**
 * @file 403 page for signed-in users without the required system role (section 7.6, AdminRoute).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { ShieldX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { ROUTES } from '@/config/routes'

export default function ForbiddenPage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-4 text-center">
      <div className="flex size-13 items-center justify-center rounded-full bg-destructive-soft text-destructive-text">
        <ShieldX className="size-6" aria-hidden />
      </div>
      <h1 className="text-xl leading-7 font-semibold">{t('error.forbiddenTitle')}</h1>
      <p className="text-sm text-muted-foreground">{t('error.forbiddenDescription')}</p>
      <Button asChild className="mt-2">
        <Link to={ROUTES.home}>{t('action.backHome')}</Link>
      </Button>
    </div>
  )
}
