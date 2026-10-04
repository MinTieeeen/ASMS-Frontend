/**
 * @file User management, SCR-USER-04 (UC-USER-04; API-USER-07, API-AUTH-12, 13): search, filters, sort and paging in
 *   the URL; table on desktop, cards below 768 px. Lock and unlock come with SCR-USER-06.
 * @author MinhTien
 * @version 2.0.0
 * @since 2026-09-29
 * @modified 2026-10-04
 */

import { keepPreviousData, useQueryClient } from '@tanstack/react-query'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CircleAlert,
  Ellipsis,
  Eye,
  Mail,
  Plus,
  RotateCw,
  SearchX,
} from 'lucide-react'
import { type MouseEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'

import {
  getListUsersQueryKey,
  useListUsers,
} from '@/api/generated/endpoints/admin-users/admin-users'
import type { AdminUserSummaryResponse } from '@/api/generated/models'
import { EmptyState, PageHeader, Pagination, RelativeTime, UserAvatar } from '@/components/common'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ROUTES } from '@/config/routes'
import { CreateUserDialog } from '@/features/auth'
import { useIsMobile } from '@/hooks'
import { cn } from '@/lib/utils'
import { selectUser, useAuthStore } from '@/stores/auth.store'
import { formatDate } from '@/utils/date'

import { RoleBadge, StatusBadge, YouBadge } from '../components/UserBadges'
import { UserFilters } from '../components/UserFilters'
import { useResendActivation } from '../hooks/useResendActivation'
import {
  PAGE_SIZES,
  type SortField,
  type UserListState,
  useUserListParams,
} from '../hooks/useUserListParams'

const SKELETON_ROWS = 8

export default function AdminUsersPage() {
  const { t } = useTranslation('admin')
  const { t: tAuth } = useTranslation('auth')
  const { t: tCommon } = useTranslation()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const currentUserId = useAuthStore(selectUser)?.id
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const { state, request, hasFilters, update, search } = useUserListParams()
  // The previous page stays on screen, dimmed, while the next one loads
  const users = useListUsers(request, { query: { placeholderData: keepPreviousData } })
  const reload = () => void queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() })
  const { resendActivation } = useResendActivation(reload)

  const openDetail = (userId: string) =>
    void navigate(ROUTES.adminUserDetail(userId), { state: { listSearch: search } })

  // A9: the new account shows first
  const onCreated = () =>
    update({ q: '', status: [], role: null, sortField: 'createdAt', sortDirection: 'desc' })

  const sort = (sortField: SortField, sortDirection: 'asc' | 'desc') =>
    update({ sortField, sortDirection })

  const data = users.data
  const rowActions = (user: AdminUserSummaryResponse) => (
    <RowActions
      user={user}
      onView={() => openDetail(user.id)}
      onResend={() => resendActivation(user)}
    />
  )

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t('users.title')}
        meta={data ? t('users.count', { count: data.totalItems }) : undefined}
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus aria-hidden />
            {tAuth('createUser.open')}
          </Button>
        }
      />
      <UserFilters state={state} hasFilters={hasFilters} onChange={update} />

      {users.isError && !data ? (
        <Alert variant="destructive">
          <CircleAlert aria-hidden />
          <AlertTitle>{t('users.loadFailed')}</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
            <span>{t('users.loadFailedDescription')}</span>
            <Button size="sm" variant="outline" onClick={() => void users.refetch()}>
              <RotateCw aria-hidden />
              {tCommon('action.retry')}
            </Button>
          </AlertDescription>
        </Alert>
      ) : data && data.totalItems === 0 ? (
        hasFilters ? (
          <EmptyState
            icon={SearchX}
            title={t('users.filter.noMatch')}
            description={t('users.filter.noMatchHint')}
            action={
              <Button variant="outline" onClick={() => update({ q: '', status: [], role: null })}>
                {t('users.filter.clear')}
              </Button>
            }
          />
        ) : (
          <EmptyState title={t('users.empty')} />
        )
      ) : isMobile ? (
        <ul
          className={cn('flex flex-col gap-2', users.isPlaceholderData && 'opacity-60')}
          aria-label={t('users.caption')}
          aria-busy={users.isFetching}
        >
          {data
            ? data.items.map((user) => (
                <li key={user.id}>
                  <Card className="py-3">
                    <CardContent className="flex items-center gap-3 px-3">
                      <UserAvatar
                        userId={user.id}
                        fullName={user.fullName}
                        avatarUrl={user.avatarThumbUrl}
                        size={40}
                      />
                      <Link
                        to={ROUTES.adminUserDetail(user.id)}
                        state={{ listSearch: search }}
                        className="flex min-w-0 flex-1 flex-col gap-1"
                      >
                        <span className="flex items-center gap-1.5 truncate font-semibold">
                          {user.fullName}
                          {user.id === currentUserId && <YouBadge />}
                        </span>
                        <span className="truncate text-[13px] text-muted-foreground">
                          {user.email}
                        </span>
                        <span className="flex flex-wrap gap-1.5">
                          <RoleBadge role={user.systemRole} />
                          <StatusBadge status={user.status} />
                        </span>
                      </Link>
                      {rowActions(user)}
                    </CardContent>
                  </Card>
                </li>
              ))
            : Array.from({ length: 4 }, (_, index) => (
                <li key={index}>
                  <Skeleton className="h-22 w-full rounded-xl" />
                </li>
              ))}
        </ul>
      ) : (
        <div
          className={cn(
            'overflow-x-auto rounded-xl border bg-card transition-opacity',
            users.isPlaceholderData && 'opacity-60',
          )}
          aria-busy={users.isFetching}
        >
          <Table>
            <TableCaption className="sr-only">{t('users.caption')}</TableCaption>
            <TableHeader>
              <TableRow>
                <SortableHead
                  field="fullName"
                  label={t('users.column.user')}
                  state={state}
                  onSort={sort}
                />
                <TableHead>{t('users.column.userCode')}</TableHead>
                <TableHead>{t('users.column.role')}</TableHead>
                <TableHead>{t('users.column.status')}</TableHead>
                <SortableHead
                  field="lastLoginAt"
                  label={t('users.column.lastLogin')}
                  state={state}
                  onSort={sort}
                />
                <SortableHead
                  field="createdAt"
                  label={t('users.column.createdAt')}
                  state={state}
                  onSort={sort}
                />
                <TableHead className="w-12">
                  <span className="sr-only">{t('users.column.actions')}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data
                ? data.items.map((user) => (
                    <TableRow
                      key={user.id}
                      className="cursor-pointer"
                      // The name is the keyboard target; the whole row is a larger mouse target
                      onClick={(event: MouseEvent) => {
                        if (!(event.target as HTMLElement).closest('a, button, [role="menu"]')) {
                          openDetail(user.id)
                        }
                      }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            userId={user.id}
                            fullName={user.fullName}
                            avatarUrl={user.avatarThumbUrl}
                            size={32}
                          />
                          <div className="flex min-w-0 flex-col">
                            <span className="flex items-center gap-1.5">
                              <Link
                                to={ROUTES.adminUserDetail(user.id)}
                                state={{ listSearch: search }}
                                className="font-medium hover:underline focus-visible:underline focus-visible:outline-none"
                              >
                                {user.fullName}
                              </Link>
                              {user.id === currentUserId && <YouBadge />}
                            </span>
                            <span className="truncate text-[13px] text-muted-foreground">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-[13px]">{user.userCode}</TableCell>
                      <TableCell>
                        <RoleBadge role={user.systemRole} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={user.status} />
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">
                        {user.lastLoginAt ? (
                          <RelativeTime value={user.lastLoginAt} />
                        ) : (
                          t('users.neverLoggedIn')
                        )}
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell>{rowActions(user)}</TableCell>
                    </TableRow>
                  ))
                : Array.from({ length: SKELETON_ROWS }, (_, index) => (
                    <TableRow key={index} aria-hidden>
                      <TableCell colSpan={7}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      )}

      {data && data.totalItems > 0 && (
        <Pagination
          page={data.page}
          size={state.size}
          totalItems={data.totalItems}
          totalPages={data.totalPages}
          pageSizes={PAGE_SIZES}
          onPageChange={(page) => {
            update({ page })
            window.scrollTo({ top: 0 })
          }}
          onSizeChange={(size) => update({ size })}
        />
      )}

      <CreateUserDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onCreated={onCreated} />
    </div>
  )
}

interface SortableHeadProps {
  field: SortField
  label: string
  state: UserListState
  onSort: (field: SortField, direction: 'asc' | 'desc') => void
}

/** Column header that sorts: first click descending, second ascending (A4) */
function SortableHead({ field, label, state, onSort }: SortableHeadProps) {
  const { t } = useTranslation('admin')
  const isActive = state.sortField === field
  const next = isActive && state.sortDirection === 'desc' ? 'asc' : 'desc'
  const Icon = !isActive ? ArrowUpDown : state.sortDirection === 'asc' ? ArrowUp : ArrowDown
  return (
    <TableHead
      aria-sort={isActive ? (state.sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        className="-ml-1 inline-flex items-center gap-1 rounded-sm px-1 hover:text-foreground focus-visible:shadow-focus focus-visible:outline-none"
        aria-label={t('users.sortBy', { column: label })}
        onClick={() => onSort(field, next)}
      >
        {label}
        <Icon className={cn('size-3.5', !isActive && 'opacity-40')} aria-hidden />
      </button>
    </TableHead>
  )
}

interface RowActionsProps {
  user: AdminUserSummaryResponse
  onView: () => void
  onResend: () => void
}

// TODO(M2 step 6): lock / unlock (SCR-USER-06), disabled on the Admin's own row with MSG-55
function RowActions({ user, onView, onResend }: RowActionsProps) {
  const { t } = useTranslation('admin')
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t('users.actionsFor', { name: user.fullName })}
        >
          <Ellipsis aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onView}>
          <Eye aria-hidden />
          {t('users.viewDetail')}
        </DropdownMenuItem>
        {user.status === 'PENDING_ACTIVATION' && (
          <DropdownMenuItem onSelect={onResend}>
            <Mail aria-hidden />
            {t('users.resendActivation')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
