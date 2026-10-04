/**
 * @file GitHub block of SCR-USER-01 (10), (16)–(18): connect through OAuth, refresh, disconnect (API-USER-17, 19,
 *   20). Actions take effect at once, outside the profile form's Save.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-04
 * @modified 2026-10-04
 */

import { CircleAlert, ExternalLink, Loader2, MapPin, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  useAuthorizeGithub,
  useDisconnectGithub,
  useRefreshGithub,
} from '@/api/generated/endpoints/git-hub/git-hub'
import type { GithubAccountResponse } from '@/api/generated/models'
import { toApiError } from '@/api/http-client'
import { ConfirmDialog, GithubMark } from '@/components/common'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatDateTime } from '@/utils/date'

/** Error code of a failed connection, carried back from the callback page */
export type GithubConnectError = 'inUse' | 'stateInvalid' | 'unavailable' | 'generic'

interface GithubCardProps {
  github?: GithubAccountResponse | null
  initialError?: GithubConnectError | null
  onChange: (github: GithubAccountResponse | null) => void
  /** The block is out of date (connected or disconnected in another tab): reload it from the profile */
  onStale: () => void
}

export function GithubCard({ github, initialError = null, onChange, onStale }: GithubCardProps) {
  const { t } = useTranslation('profile')
  const { t: tCommon } = useTranslation()
  const { t: tAuth } = useTranslation('auth')
  const [error, setError] = useState<GithubConnectError | null>(initialError)
  const [isDisconnectOpen, setIsDisconnectOpen] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const authorize = useAuthorizeGithub()
  const refresh = useRefreshGithub()
  const disconnect = useDisconnectGithub()

  const toastError = (caught: unknown) => {
    const apiError = toApiError(caught)
    if (apiError.code === 'GITHUB_ALREADY_CONNECTED' || apiError.code === 'GITHUB_NOT_CONNECTED') {
      onStale()
    } else if (apiError.code === 'AUTH_RATE_LIMITED') {
      toast.error(tAuth('message.rateLimited', { count: apiError.retryAfterSeconds ?? 0 }))
    } else if (apiError.code === 'GITHUB_UNAVAILABLE') {
      toast.error(t('github.unavailable'))
    } else {
      toast.error(tCommon(apiError.isNetworkError ? 'error.network' : 'error.generic'))
    }
  }

  // A10: the browser leaves for GitHub; unsaved form changes trigger the browser's leave prompt
  const connect = () => {
    setError(null)
    authorize.mutate(undefined, {
      onSuccess: ({ authorizeUrl }) => {
        setIsRedirecting(true)
        window.location.assign(authorizeUrl)
      },
      onError: toastError,
    })
  }

  const onRefresh = () =>
    refresh.mutate(undefined, {
      onSuccess: (account) => {
        onChange(account)
        toast.success(t('github.refreshed'))
      },
      onError: toastError,
    })

  const confirmDisconnect = () =>
    disconnect.mutate(undefined, {
      onSuccess: () => {
        setIsDisconnectOpen(false)
        onChange(null)
        toast.success(t('github.disconnected'))
      },
      onError: (caught) => {
        setIsDisconnectOpen(false)
        toastError(caught)
      },
    })

  const errorText =
    error &&
    {
      inUse: t('github.inUse'),
      stateInvalid: t('github.stateInvalid'),
      unavailable: t('github.unavailable'),
      generic: tCommon('error.generic'),
    }[error]

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="flex items-center gap-2 font-heading text-base leading-6 font-semibold">
            <GithubMark className="size-4.5" />
            {t('github.title')}
          </h2>
        </CardTitle>
        <CardDescription>{t('github.description')}</CardDescription>
        {github && (
          <CardAction>
            <Badge className="bg-accent text-accent-foreground">{t('github.connected')}</Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {errorText && (
          <Alert variant="destructive">
            <CircleAlert aria-hidden />
            <AlertTitle>{errorText}</AlertTitle>
          </Alert>
        )}

        {github ? (
          <>
            <div className="flex items-start gap-3.5">
              <img
                src={github.avatarUrl}
                alt=""
                className="size-14 shrink-0 rounded-full border bg-muted"
              />
              <div className="flex min-w-0 flex-col gap-0.5">
                {github.name && <span className="font-semibold">{github.name}</span>}
                <a
                  href={github.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('github.openProfile', { login: github.login })}
                  className="inline-flex w-fit items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover"
                >
                  @{github.login}
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
                {/* Plain text from GitHub, never rendered as HTML (NFR-USER-06) */}
                {github.bio && <p className="text-sm whitespace-pre-line">{github.bio}</p>}
                <p className="flex flex-wrap items-center gap-x-1.5 text-[13px] text-muted-foreground">
                  {github.location && (
                    <>
                      <MapPin className="size-3.5" aria-hidden />
                      <span>{github.location}</span>
                      <span aria-hidden>·</span>
                    </>
                  )}
                  <span>
                    {t('github.joined', { date: formatMonthYear(github.githubCreatedAt) })}
                  </span>
                </p>
              </div>
            </div>
            <dl className="grid grid-cols-3 gap-2">
              {[
                { label: t('github.publicRepos'), value: github.publicRepos },
                { label: t('github.followers'), value: github.followers },
                { label: t('github.following'), value: github.following },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col rounded-lg bg-background px-3 py-2.5"
                >
                  <dd className="font-heading text-lg font-semibold">{stat.value}</dd>
                  <dt className="order-last text-xs text-muted-foreground">{stat.label}</dt>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                {t('github.syncedAt', { time: formatDateTime(github.syncedAt) })}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={refresh.isPending}
                  onClick={onRefresh}
                >
                  <RefreshCw
                    className={refresh.isPending ? 'animate-spin' : undefined}
                    aria-hidden
                  />
                  {t('github.refresh')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-destructive-text hover:text-destructive-text"
                  onClick={() => setIsDisconnectOpen(true)}
                >
                  {t('github.disconnect')}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed p-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold">{t('github.notConnected')}</span>
              <span className="text-[13px] text-muted-foreground">
                {t('github.notConnectedHint')}
              </span>
            </div>
            <Button
              type="button"
              className="bg-foreground text-background hover:bg-foreground/90"
              disabled={authorize.isPending || isRedirecting}
              onClick={connect}
            >
              {authorize.isPending || isRedirecting ? (
                <Loader2 className="animate-spin" aria-hidden />
              ) : (
                <GithubMark className="size-4" />
              )}
              {authorize.isPending || isRedirecting ? t('github.redirecting') : t('github.connect')}
            </Button>
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        open={isDisconnectOpen}
        onOpenChange={setIsDisconnectOpen}
        title={t('github.disconnectTitle')}
        description={t('github.disconnectDescription')}
        confirmLabel={t('github.disconnect')}
        cancelLabel={tCommon('action.cancel')}
        onConfirm={confirmDisconnect}
        isPending={disconnect.isPending}
      />
    </Card>
  )
}

/** "03/2021" */
function formatMonthYear(iso: string): string {
  return formatDateTime(iso).slice(3, 10)
}
