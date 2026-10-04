/**
 * @file User detail, SCR-USER-05 (UC-USER-05; API-USER-08, API-USER-14), read-only for now: header, locked banner,
 *   tabs Info | Sign-in activity | Admin history kept in `?tab=`. Editing and lock / unlock come with SCR-USER-06.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-04
 * @modified 2026-10-04
 */

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, CircleAlert, Lock, Mail, RotateCw, UserX } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useParams, useSearchParams } from 'react-router'

import {
  getGetAdminUserQueryKey,
  getListUserAuthEventsQueryKey,
  getListUsersQueryKey,
  listUserAuthEvents,
  useGetAdminUser,
} from '@/api/generated/endpoints/admin-users/admin-users'
import type { AdminUserDetailResponse, AuthEventItemResponse } from '@/api/generated/models'
import { toApiError } from '@/api/http-client'
import { EmptyState, RelativeTime, UserAvatar } from '@/components/common'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ROUTES } from '@/config/routes'
import { selectUser, useAuthStore } from '@/stores/auth.store'
import { formatDate, formatDateTime } from '@/utils/date'

import { RoleBadge, StatusBadge, YouBadge } from '../components/UserBadges'
import { useResendActivation } from '../hooks/useResendActivation'

const TABS = ['info', 'auth-events', 'audit'] as const
type Tab = (typeof TABS)[number]
const EVENTS_PAGE_SIZE = 20

export default function AdminUserDetailPage() {
  const { t } = useTranslation('admin')
  const { t: tCommon } = useTranslation()
  const { userId = '' } = useParams()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const currentUserId = useAuthStore(selectUser)?.id
  const user = useGetAdminUser(userId)

  // Back to the list with the search, filters and page the Admin left it with
  const listSearch = (location.state as { listSearch?: string } | null)?.listSearch
  const listHref = listSearch ? `${ROUTES.adminUsers}?${listSearch}` : ROUTES.adminUsers

  const tabParam = searchParams.get('tab')
  const tab: Tab = TABS.find((value) => value === tabParam) ?? 'info'
  const changeTab = (value: string) =>
    setSearchParams(value === 'info' ? {} : { tab: value }, {
      replace: true,
      state: location.state,
    })

  const reload = () => {
    void queryClient.invalidateQueries({ queryKey: getGetAdminUserQueryKey(userId) })
    void queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() })
  }
  const { resendActivation, isResending } = useResendActivation(reload)

  const backLink = (
    <nav aria-label={t('detail.breadcrumb')} className="text-sm">
      <Link
        to={listHref}
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        {t('users.title')}
      </Link>
    </nav>
  )

  if (user.isError) {
    const isNotFound = toApiError(user.error).status === 404
    return (
      <div className="flex flex-col gap-4">
        {backLink}
        {isNotFound ? (
          <EmptyState
            icon={UserX}
            title={t('detail.notFound')}
            action={
              <Button variant="outline" asChild>
                <Link to={listHref}>{t('detail.backToList')}</Link>
              </Button>
            }
          />
        ) : (
          <Alert variant="destructive">
            <CircleAlert aria-hidden />
            <AlertTitle>{t('detail.loadFailed')}</AlertTitle>
            <AlertDescription>
              <Button size="sm" variant="outline" onClick={() => void user.refetch()}>
                <RotateCw aria-hidden />
                {tCommon('action.retry')}
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  const data = user.data
  if (!data) {
    return (
      <div className="flex flex-col gap-4" aria-busy>
        {backLink}
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {backLink}

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <UserAvatar
            userId={data.id}
            fullName={data.fullName}
            avatarUrl={data.avatarUrl}
            size={64}
          />
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight">
              {data.fullName}
              {data.id === currentUserId && <YouBadge />}
            </h1>
            <p className="truncate text-sm text-muted-foreground">{data.email}</p>
            <div className="flex flex-wrap gap-1.5">
              <RoleBadge role={data.systemRole} />
              <StatusBadge status={data.status} />
            </div>
          </div>
        </div>
        {/* TODO(M2 step 6): edit, lock / unlock, sign out everywhere (SCR-USER-06) */}
        {data.status === 'PENDING_ACTIVATION' && (
          <Button variant="outline" disabled={isResending} onClick={() => resendActivation(data)}>
            <Mail aria-hidden />
            {t('users.resendActivation')}
          </Button>
        )}
      </header>

      {data.status === 'LOCKED' && <LockedBanner user={data} />}

      <Tabs value={tab} onValueChange={changeTab}>
        <TabsList aria-label={t('detail.tabsLabel')}>
          <TabsTrigger value="info">{t('detail.tab.info')}</TabsTrigger>
          <TabsTrigger value="auth-events">{t('detail.tab.authEvents')}</TabsTrigger>
          <TabsTrigger value="audit">{t('detail.tab.audit')}</TabsTrigger>
        </TabsList>
        <TabsContent value="info" className="mt-2">
          <InfoTab user={data} />
        </TabsContent>
        <TabsContent value="auth-events" className="mt-2">
          <AuthEventsTab userId={data.id} />
        </TabsContent>
        <TabsContent value="audit" className="mt-2">
          {/* TODO(M2 step 7): admin history of this user (API-USER-16 with targetId) */}
          <EmptyState title={t('detail.auditComingSoon')} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function LockedBanner({ user }: { user: AdminUserDetailResponse }) {
  const { t } = useTranslation('admin')
  const time = user.lockedAt ? formatDateTime(user.lockedAt) : ''
  return (
    <Alert variant="destructive">
      <Lock aria-hidden />
      <AlertTitle>
        {user.lockedBy
          ? t('detail.lockedBanner', { time, admin: user.lockedBy.fullName })
          : t('detail.lockedBannerNoAdmin', { time })}
      </AlertTitle>
      {user.lockedReason && (
        <AlertDescription>
          {t('detail.lockedReason', { reason: user.lockedReason })}
        </AlertDescription>
      )}
    </Alert>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 py-2.5 sm:grid-cols-[180px_1fr] sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-sm break-words">{children}</dd>
    </div>
  )
}

function InfoTab({ user }: { user: AdminUserDetailResponse }) {
  const { t } = useTranslation('admin')
  const empty = <span className="text-muted-foreground">{t('detail.empty')}</span>
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('detail.profile')}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            <Field label={t('users.column.fullName')}>{user.fullName}</Field>
            <Field label={t('users.column.email')}>{user.email}</Field>
            <Field label={t('users.column.userCode')}>
              <span className="font-mono">{user.userCode}</span>
            </Field>
            <Field label={t('detail.school')}>{user.school?.name ?? empty}</Field>
            <Field label={t('detail.github')}>
              {user.github ? (
                <span className="flex flex-col">
                  <a
                    href={user.github.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium hover:underline"
                  >
                    @{user.github.login}
                  </a>
                  <span className="text-xs text-muted-foreground">
                    {t('detail.githubConnectedAt', { date: formatDate(user.github.connectedAt) })}
                  </span>
                </span>
              ) : (
                <span className="text-muted-foreground" title={t('detail.githubHint')}>
                  {t('detail.githubNone')}
                </span>
              )}
            </Field>
            <Field label={t('detail.bio')}>
              {user.bio ? <span className="whitespace-pre-line">{user.bio}</span> : empty}
            </Field>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('detail.account')}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            <Field label={t('users.column.role')}>
              <RoleBadge role={user.systemRole} />
            </Field>
            <Field label={t('users.column.status')}>
              <StatusBadge status={user.status} />
            </Field>
            <Field label={t('detail.createdAt')}>
              {formatDateTime(user.createdAt)}
              {user.createdBy && (
                <span className="text-muted-foreground">
                  {' '}
                  {t('detail.createdBy', { name: user.createdBy.fullName })}
                </span>
              )}
            </Field>
            <Field label={t('detail.activatedAt')}>
              {user.activatedAt ? formatDateTime(user.activatedAt) : empty}
            </Field>
            <Field label={t('detail.lastLogin')}>
              {user.lastLoginAt ? (
                <RelativeTime value={user.lastLoginAt} />
              ) : (
                t('users.neverLoggedIn')
              )}
            </Field>
            <Field label={t('detail.sessions')}>{user.activeSessionCount}</Field>
            <Field label={t('detail.failedLogins')}>
              {user.failedLoginCount}
              {user.lockedUntil && new Date(user.lockedUntil) > new Date() && (
                <span className="text-muted-foreground">
                  {' · '}
                  {t('detail.lockedUntil', { time: formatDateTime(user.lockedUntil) })}
                </span>
              )}
            </Field>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}

function AuthEventsTab({ userId }: { userId: string }) {
  const { t } = useTranslation('admin')
  const { t: tCommon } = useTranslation()
  const events = useInfiniteQuery({
    queryKey: getListUserAuthEventsQueryKey(userId, { limit: EVENTS_PAGE_SIZE }),
    queryFn: ({ pageParam, signal }) =>
      listUserAuthEvents(userId, { cursor: pageParam, limit: EVENTS_PAGE_SIZE }, undefined, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })

  if (events.isError) {
    return (
      <Alert variant="destructive">
        <CircleAlert aria-hidden />
        <AlertTitle>{t('detail.eventsLoadFailed')}</AlertTitle>
        <AlertDescription>
          <Button size="sm" variant="outline" onClick={() => void events.refetch()}>
            <RotateCw aria-hidden />
            {tCommon('action.retry')}
          </Button>
        </AlertDescription>
      </Alert>
    )
  }
  if (!events.data) return <Skeleton className="h-48 w-full rounded-xl" />

  const items = events.data.pages.flatMap((page) => page.items)
  if (items.length === 0) return <EmptyState title={t('detail.events.empty')} />

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-full overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('detail.events.time')}</TableHead>
              <TableHead>{t('detail.events.event')}</TableHead>
              <TableHead>{t('detail.events.device')}</TableHead>
              <TableHead>{t('detail.events.ip')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="text-[13px] whitespace-nowrap">
                  <RelativeTime value={event.createdAt} />
                </TableCell>
                <TableCell className="text-sm">
                  {t(`detail.events.type.${event.eventType}`)}
                </TableCell>
                <TableCell className="text-[13px] text-muted-foreground">
                  <EventDetail event={event} />
                </TableCell>
                <TableCell className="font-mono text-[13px] text-muted-foreground">
                  {event.ipAddress ?? '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {events.hasNextPage && (
        <Button
          variant="outline"
          disabled={events.isFetchingNextPage}
          onClick={() => void events.fetchNextPage()}
        >
          {t('detail.events.loadMore')}
        </Button>
      )}
    </div>
  )
}

/** Device, then the failure reason or the Admin who acted, e.g. "Chrome · Windows · sai mật khẩu" */
function EventDetail({ event }: { event: AuthEventItemResponse }) {
  const { t, i18n } = useTranslation('admin')
  const reason = (event.metadata as Record<string, unknown>).reason
  const reasonKey =
    `detail.events.reason.${String(reason)}` as 'detail.events.reason.INVALID_PASSWORD'
  const parts = [
    event.deviceLabel,
    typeof reason === 'string' && i18n.exists(reasonKey, { ns: 'admin' }) ? t(reasonKey) : null,
    event.actor ? t('detail.events.by', { name: event.actor.fullName }) : null,
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : '—'
}
