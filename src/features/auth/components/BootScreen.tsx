/**
 * @file Full-screen boot states of SCR-AUTH-08: restoring the session (S01) and cannot reach the server (S02).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { Loader2, WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LogoMark } from '@/components/common'
import { Button } from '@/components/ui/button'
import { BOOT_LOADER_DELAY_MS, BOOT_SLOW_AFTER_MS } from '@/config/constants'

/** S01: appears only after 300 ms to avoid a flash; the text changes after 5 s (components 1, 2). */
export function BootLoading() {
  const { t } = useTranslation('auth')
  const [isVisible, setIsVisible] = useState(false)
  const [isSlow, setIsSlow] = useState(false)

  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), BOOT_LOADER_DELAY_MS)
    const slowTimer = setTimeout(() => setIsSlow(true), BOOT_SLOW_AFTER_MS)
    return () => {
      clearTimeout(showTimer)
      clearTimeout(slowTimer)
    }
  }, [])

  return (
    <div className="flex min-h-svh items-center justify-center bg-background" aria-busy="true">
      {isVisible && (
        <div className="flex flex-col items-center gap-5">
          <LogoMark size={56} />
          <div className="h-1 w-40 overflow-hidden rounded-full bg-muted" aria-hidden>
            <div className="h-full w-2/5 animate-pulse rounded-full bg-primary" />
          </div>
          <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
            {isSlow ? t('boot.slow') : t('boot.loading')}
          </p>
        </div>
      )}
    </div>
  )
}

interface BootErrorProps {
  onRetry: () => void
  isRetrying: boolean
}

/** S02: shown when the refresh call fails with a network error or 5xx (component 3, MSG-28). */
export function BootError({ onRetry, isRetrying }: BootErrorProps) {
  const { t } = useTranslation('auth')
  const { t: tCommon } = useTranslation()

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <div
        role="alert"
        className="flex w-full max-w-100 flex-col items-center gap-3 rounded-xl border bg-card p-8 text-center shadow-xs"
      >
        <div className="flex size-13 items-center justify-center rounded-full bg-destructive-soft text-destructive-text">
          <WifiOff className="size-6" aria-hidden />
        </div>
        <h1 className="text-xl leading-7 font-semibold">{t('boot.failedTitle')}</h1>
        <p className="text-sm leading-[22px] text-muted-foreground">
          {t('boot.failedDescription')}
        </p>
        <Button size="lg" className="mt-2 w-full" onClick={onRetry} disabled={isRetrying}>
          {isRetrying && <Loader2 className="animate-spin" aria-hidden />}
          {tCommon('action.retry')}
        </Button>
      </div>
    </div>
  )
}
