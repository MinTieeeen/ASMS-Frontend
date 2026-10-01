/**
 * @file Message banner at the top of the Auth forms (component 3 of SCR-AUTH-01, MSG-04 to MSG-12, MSG-28, MSG-29).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

import { formatMinutesSeconds } from '../hooks/useCountdown'

/** One entry per `banner.*` translation group. */
export type BannerKind =
  | 'invalidCredentials'
  | 'tempLocked'
  | 'accountLocked'
  | 'rateLimited'
  | 'sessionExpired'
  | 'activated'
  | 'reset'
  | 'loggedOutAll'
  | 'network'
  | 'generic'

const VARIANT: Record<BannerKind, 'destructive' | 'success' | 'info'> = {
  invalidCredentials: 'destructive',
  tempLocked: 'destructive',
  accountLocked: 'destructive',
  rateLimited: 'destructive',
  network: 'destructive',
  generic: 'destructive',
  activated: 'success',
  reset: 'success',
  sessionExpired: 'info',
  loggedOutAll: 'info',
}

const ICON = { destructive: CircleAlert, success: CircleCheck, info: Info }

interface AuthBannerProps {
  kind: BannerKind
  /** Seconds left for tempLocked (mm:ss) and rateLimited (seconds) */
  remainingSeconds?: number
  /** Shows a close button; hidden while a countdown runs (SCR-AUTH-01, component 3) */
  onDismiss?: () => void
}

export function AuthBanner({ kind, remainingSeconds = 0, onDismiss }: AuthBannerProps) {
  const { t } = useTranslation('auth')
  const variant = VARIANT[kind]
  const Icon = ICON[variant]
  const isCountdown = kind === 'tempLocked' || kind === 'rateLimited'

  return (
    <Alert
      variant={variant}
      role={variant === 'destructive' ? 'alert' : 'status'}
      aria-live={variant === 'destructive' ? 'assertive' : 'polite'}
      className={onDismiss && !isCountdown ? 'pr-11' : undefined}
    >
      <Icon aria-hidden />
      <AlertTitle>{t(`banner.${kind}.title`)}</AlertTitle>
      <AlertDescription>
        {t(`banner.${kind}.description`, {
          time: formatMinutesSeconds(remainingSeconds),
          count: remainingSeconds,
        })}
      </AlertDescription>
      {onDismiss && !isCountdown && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-2 right-2 text-current"
          aria-label={t('banner.dismiss')}
          onClick={onDismiss}
        >
          <X aria-hidden />
        </Button>
      )}
    </Alert>
  )
}
