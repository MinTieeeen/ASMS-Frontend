/**
 * @file "Signed-in devices" card of SCR-AUTH-05 (UC-AUTH-09, FR-AUTH-21, FR-AUTH-22, actions A4, A5).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { useQueryClient } from '@tanstack/react-query'
import { CircleAlert, Monitor, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  getListSessionsQueryKey,
  useListSessions,
  useRevokeSession,
} from '@/api/generated/endpoints/auth/auth'
import type { SessionResponse } from '@/api/generated/models'
import { toApiError } from '@/api/http-client'
import { ConfirmDialog } from '@/components/common'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime, toRelativeTime } from '@/utils/date'

const MOBILE_DEVICE = /\b(iOS|iPhone|iPad|Android)\b/i
const SKELETON_ROWS = 3

export function SessionsCard() {
  const { t } = useTranslation('auth')
  const { t: tCommon } = useTranslation()
  const queryClient = useQueryClient()
  const sessions = useListSessions()
  const revoke = useRevokeSession()
  const [target, setTarget] = useState<SessionResponse | null>(null)

  const deviceName = (session: SessionResponse) =>
    session.deviceLabel ?? t('sessions.unknownDevice')

  const confirmRevoke = () => {
    if (!target) return
    revoke.mutate(
      { sessionId: target.id },
      {
        onSuccess: () => {
          queryClient.setQueryData<SessionResponse[]>(getListSessionsQueryKey(), (rows) =>
            rows?.filter((row) => row.id !== target.id),
          )
          toast.success(t('message.deviceLoggedOut'))
        },
        onError: (error) => {
          if (toApiError(error).code === 'AUTH_SESSION_NOT_FOUND') {
            // A5: already gone (expired or logged out elsewhere), so the list is stale
            toast.info(t('message.sessionAlreadyGone'))
            void sessions.refetch()
          } else {
            toast.error(tCommon('error.generic'))
          }
        },
        onSettled: () => setTarget(null),
      },
    )
  }

  const rows = sessions.data ?? []
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="font-heading text-base leading-6 font-semibold">{t('sessions.title')}</h2>
        </CardTitle>
        <CardDescription>{t('sessions.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {sessions.isPending && <SessionsSkeleton />}
        {sessions.isError && (
          <Alert variant="destructive">
            <CircleAlert aria-hidden />
            <AlertTitle>{t('message.sessionsLoadFailed')}</AlertTitle>
            <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
              <span>{t('sessions.loadFailedDescription')}</span>
              <Button size="sm" variant="outline" onClick={() => void sessions.refetch()}>
                {tCommon('action.retry')}
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {sessions.isSuccess && (
          <>
            <ul className="flex flex-col divide-y" aria-label={t('sessions.title')}>
              {rows.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  name={deviceName(session)}
                  onLogout={() => setTarget(session)}
                />
              ))}
            </ul>
            {rows.every((row) => row.current) && (
              <p className="pt-3 text-sm text-muted-foreground">{t('sessions.onlyThisDevice')}</p>
            )}
          </>
        )}
      </CardContent>

      <ConfirmDialog
        open={target !== null}
        onOpenChange={(open) => !open && setTarget(null)}
        title={t('sessions.confirmTitle')}
        description={target ? t('sessions.confirmDescription', { device: deviceName(target) }) : ''}
        confirmLabel={t('sessions.logout')}
        cancelLabel={tCommon('action.cancel')}
        onConfirm={confirmRevoke}
        isPending={revoke.isPending}
      />
    </Card>
  )
}

interface SessionRowProps {
  session: SessionResponse
  name: string
  onLogout: () => void
}

function SessionRow({ session, name, onLogout }: SessionRowProps) {
  const { t } = useTranslation('auth')
  const { t: tCommon } = useTranslation()
  const DeviceIcon = MOBILE_DEVICE.test(session.deviceLabel ?? '') ? Smartphone : Monitor

  const lastUsed = () => {
    if (session.current) return t('sessions.activeNow')
    const relative = toRelativeTime(session.lastUsedAt)
    switch (relative.unit) {
      case 'justNow':
        return tCommon('time.justNow')
      case 'minutes':
        return tCommon('time.minutesAgo', { count: relative.count })
      case 'hours':
        return tCommon('time.hoursAgo', { count: relative.count })
      case 'days':
        return tCommon('time.daysAgo', { count: relative.count })
      default:
        return relative.text
    }
  }

  return (
    <li className="flex flex-col gap-3 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <DeviceIcon className="size-[18px]" aria-hidden />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-semibold">{name}</span>
            {session.current && (
              <Badge className="bg-accent text-accent-foreground">{t('sessions.thisDevice')}</Badge>
            )}
          </div>
          <p className="flex flex-wrap gap-x-2 text-[13px] text-muted-foreground">
            <span className="font-mono">{session.ipAddress}</span>
            <span aria-hidden>·</span>
            <span className={session.current ? 'font-medium text-primary' : undefined}>
              {lastUsed()}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            {t('sessions.signedInAt', { time: formatDateTime(session.createdAt) })}
          </p>
        </div>
      </div>
      {!session.current && (
        <Button
          size="sm"
          variant="outline"
          className="self-end sm:self-center"
          aria-label={t('sessions.logoutDevice', { device: name })}
          onClick={onLogout}
        >
          {t('sessions.logout')}
        </Button>
      )}
    </li>
  )
}

function SessionsSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden>
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-lg" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64 max-w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
