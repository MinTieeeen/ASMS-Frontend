/**
 * @file Full-form states shared by the token pages: checking the link, link no longer valid, result panel.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { Loader2, type LucideIcon, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { toApiError } from '@/api/http-client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/config/routes'
import { cn } from '@/lib/utils'

import { bannerKindOf } from '../hooks/useAuthBanner'
import { AuthBanner } from './AuthBanner'

/** S01 of SCR-AUTH-03/04: skeleton of the form while the token is being checked (component 8). */
export function LinkCheckingSkeleton() {
  const { t } = useTranslation('auth')

  return (
    <div aria-busy="true" className="flex flex-col gap-4">
      <Skeleton className="h-7.5 w-60" />
      <Skeleton className="h-3.5 w-48" />
      {[28, 32].map((width) => (
        <div key={width} className="flex flex-col gap-2">
          <Skeleton className="h-3.5" style={{ width: width * 4 }} />
          <Skeleton className="h-10" />
        </div>
      ))}
      <Skeleton className="h-12 bg-secondary" />
      <p
        role="status"
        className="flex items-center justify-center gap-2 text-[13px] text-muted-foreground"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden />
        {t('link.checking')}
      </p>
    </div>
  )
}

interface ResultPanelProps {
  icon: LucideIcon
  tone: 'success' | 'destructive'
  title: string
  description: ReactNode
  /** Buttons or links below the text */
  children?: ReactNode
  role?: 'alert' | 'status'
}

/** Centered icon, title and text, used for "sent", "invalid link" and "already active" states. */
export function ResultPanel({
  icon: Icon,
  tone,
  title,
  description,
  children,
  role,
}: ResultPanelProps) {
  return (
    <div role={role} className="flex flex-col items-center gap-3 text-center">
      <div
        className={cn(
          'flex size-13 items-center justify-center rounded-full',
          tone === 'success'
            ? 'bg-accent text-accent-foreground'
            : 'bg-destructive-soft text-destructive-text',
        )}
      >
        <Icon className="size-6" aria-hidden />
      </div>
      <h1 className="text-2xl leading-8 font-semibold">{title}</h1>
      <p className="text-sm leading-[22px] text-muted-foreground">{description}</p>
      {children && <div className="mt-2 flex w-full flex-col items-center gap-2">{children}</div>}
    </div>
  )
}

/** S04 of SCR-AUTH-03/04: missing, expired or used token (component 9, MSG-10). */
export function InvalidLinkPanel({ hint, requestLabel }: { hint?: string; requestLabel: string }) {
  const { t } = useTranslation('auth')

  return (
    <ResultPanel
      role="alert"
      icon={TriangleAlert}
      tone="destructive"
      title={t('link.invalidTitle')}
      description={hint ? `${t('message.linkInvalid')} ${hint}` : t('message.linkInvalid')}
    >
      <Button asChild size="lg" className="w-full">
        <Link to={ROUTES.forgotPassword}>{requestLabel}</Link>
      </Button>
      <Button asChild variant="ghost">
        <Link to={ROUTES.login}>{t('link.backToLogin')}</Link>
      </Button>
    </ResultPanel>
  )
}

/** SCR-AUTH-03/04 A1: checking the link failed for another reason (429 → MSG-07, other → MSG-21) with "Try again". */
export function LinkCheckError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-4">
      <AuthBanner
        kind={bannerKindOf(error)}
        remainingSeconds={toApiError(error).retryAfterSeconds}
      />
      <Button size="lg" className="w-full" onClick={onRetry}>
        {t('action.retry')}
      </Button>
    </div>
  )
}
