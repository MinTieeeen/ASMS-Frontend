/**
 * @file Minimal user management page, the host of SCR-AUTH-06 (UC-AUTH-07, UC-AUTH-08). Full page comes with M12.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { CircleAlert, Ellipsis, Mail, Plus, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'
import { toast } from 'sonner'

import {
  useListUsers,
  useResendActivationEmail,
} from '@/api/generated/endpoints/admin-users/admin-users'
import type { AdminUserResponse, AdminUserResponseStatus } from '@/api/generated/models'
import { toApiError } from '@/api/http-client'
import { EmptyState, PageHeader, UserAvatar } from '@/components/common'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ROUTES } from '@/config/routes'
import { CreateUserDialog } from '@/features/auth'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 20
const SKELETON_ROWS = 5

const STATUS_DOT: Record<AdminUserResponseStatus, string> = {
  ACTIVE: 'bg-status-done',
  PENDING_ACTIVATION: 'bg-status-review',
  LOCKED: 'bg-destructive',
}

export default function AdminUsersPage() {
  const { t } = useTranslation('admin')
  const { t: tAuth } = useTranslation('auth')
  const { t: tCommon } = useTranslation()
  const [page, setPage] = useState(0)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const users = useListUsers({ page, size: PAGE_SIZE, sort: ['createdAt,desc'] })
  const resend = useResendActivationEmail()

  const resendActivation = (user: AdminUserResponse) => {
    resend.mutate(
      { userId: user.id },
      {
        onSuccess: () => toast.success(tAuth('message.activationResent', { email: user.email })),
        onError: (error) => {
          const apiError = toApiError(error)
          switch (apiError.code) {
            case 'USER_NOT_PENDING':
              toast.info(tAuth('message.userNotPending'))
              return void users.refetch()
            case 'AUTH_RATE_LIMITED':
              return toast.error(
                tAuth('message.rateLimited', { count: apiError.retryAfterSeconds ?? 0 }),
              )
            case 'AUTH_FORBIDDEN':
              return toast.error(tCommon('error.forbidden'))
            default:
              toast.error(tCommon('error.generic'))
              if (apiError.status === 404) void users.refetch()
          }
        },
      },
    )
  }

  const data = users.data
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:flex-row md:gap-8">
      <nav aria-label={t('users.navLabel')} className="md:w-48 md:shrink-0">
        <p className="mb-2 hidden px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase md:block">
          {t('users.navLabel')}
        </p>
        <NavLink
          to={ROUTES.adminUsers}
          className={({ isActive }) =>
            cn(
              'flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium',
              isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-muted',
            )
          }
        >
          <UsersRound className="size-4" aria-hidden />
          {t('users.nav')}
        </NavLink>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <PageHeader
          title={t('users.title')}
          actions={
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus aria-hidden />
              {tAuth('createUser.open')}
            </Button>
          }
        />

        {users.isError && (
          <Alert variant="destructive">
            <CircleAlert aria-hidden />
            <AlertTitle>{t('users.loadFailed')}</AlertTitle>
            <AlertDescription>
              <Button size="sm" variant="outline" onClick={() => void users.refetch()}>
                {tCommon('action.retry')}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {data && data.totalElements === 0 ? (
          <EmptyState icon={UsersRound} title={t('users.empty')} />
        ) : (
          !users.isError && (
            <div className="overflow-x-auto rounded-xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('users.column.fullName')}</TableHead>
                    <TableHead>{t('users.column.email')}</TableHead>
                    <TableHead>{t('users.column.userCode')}</TableHead>
                    <TableHead>{t('users.column.role')}</TableHead>
                    <TableHead>{t('users.column.status')}</TableHead>
                    <TableHead className="w-12">
                      <span className="sr-only">{t('users.column.actions')}</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.isPending
                    ? Array.from({ length: SKELETON_ROWS }, (_, index) => (
                        <TableRow key={index} aria-hidden>
                          <TableCell colSpan={6}>
                            <Skeleton className="h-5 w-full" />
                          </TableCell>
                        </TableRow>
                      ))
                    : data?.items.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <UserAvatar userId={user.id} fullName={user.fullName} size={28} />
                              <span className="font-medium">{user.fullName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{user.email}</TableCell>
                          <TableCell className="font-mono text-[13px]">{user.userCode}</TableCell>
                          <TableCell>{t(`users.role.${user.systemRole}`)}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1.5 text-[13px]">
                              <span
                                className={cn('size-2 rounded-full', STATUS_DOT[user.status])}
                                aria-hidden
                              />
                              {t(`users.status.${user.status}`)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {user.status === 'PENDING_ACTIVATION' && (
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
                                  <DropdownMenuItem
                                    disabled={resend.isPending}
                                    onSelect={() => resendActivation(user)}
                                  >
                                    <Mail aria-hidden />
                                    {t('users.resendActivation')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </div>
          )
        )}

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-end gap-3 text-sm">
            <span className="text-muted-foreground">
              {t('users.page', { page: data.page + 1, total: data.totalPages })}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page === 0}
              onClick={() => setPage((current) => current - 1)}
            >
              {t('users.previous')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page + 1 >= data.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              {t('users.next')}
            </Button>
          </div>
        )}
      </div>

      <CreateUserDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  )
}
