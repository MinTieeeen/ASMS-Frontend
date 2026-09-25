/**
 * @file Full-area loading indicator.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-26
 * @modified 2026-09-26
 */

import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/** Used as the fallback for Suspense and lazy routes. */
export function LoadingScreen() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
      <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
      <span className="sr-only">{t('state.loading')}</span>
    </div>
  )
}
