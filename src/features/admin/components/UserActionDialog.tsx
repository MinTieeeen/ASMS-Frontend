/**
 * @file Admin action dialogs, SCR-USER-06 (UC-USER-08, 09; API-USER-11, 12, 13): lock with a reason, unlock, sign out
 *   of every device. Opened from the user list and the user detail.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-05
 * @modified 2026-10-05
 */

import { useQueryClient } from '@tanstack/react-query'
import { CircleAlert, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  getGetAdminUserQueryKey,
  getListUsersQueryKey,
  useGetAdminUser,
  useLockUser,
  useLogoutUserEverywhere,
  useUnlockUser,
} from '@/api/generated/endpoints/admin-users/admin-users'
import type { AdminUserDetailResponse, AdminUserSummaryResponse } from '@/api/generated/models'
import { toApiError } from '@/api/http-client'
import { UserAvatar } from '@/components/common'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export type UserAction = 'lock' | 'unlock' | 'logout'

export const REASON_MIN_LENGTH = 10
export const REASON_MAX_LENGTH = 500

type ActionUser = AdminUserSummaryResponse | AdminUserDetailResponse

export interface UserActionTarget {
  action: UserAction
  user: ActionUser
}

interface UserActionDialogProps {
  /** null = closed */
  target: UserActionTarget | null
  onClose: () => void
}

const isDetail = (user: ActionUser): user is AdminUserDetailResponse => 'activeSessionCount' in user

/** Counted in code points, like the backend */
const reasonLength = (reason: string) => [...reason.trim()].length

export function UserActionDialog({ target, onClose }: UserActionDialogProps) {
  // A new key per opening: the reason and the error banner never survive a previous opening (A5)
  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      {target && (
        <ActionContent
          key={`${target.action}-${target.user.id}`}
          target={target}
          onClose={onClose}
        />
      )}
    </Dialog>
  )
}

function ActionContent({ target, onClose }: { target: UserActionTarget; onClose: () => void }) {
  const { action, user } = target
  const { t } = useTranslation('admin')
  const { t: tAuth } = useTranslation('auth')
  const { t: tCommon } = useTranslation()
  const queryClient = useQueryClient()
  const [reason, setReason] = useState('')
  const [reasonTouched, setReasonTouched] = useState(false)
  const [banner, setBanner] = useState<string | null>(null)
  const lock = useLockUser()
  const unlock = useUnlockUser()
  const logout = useLogoutUserEverywhere()
  const isPending = lock.isPending || unlock.isPending || logout.isPending

  // Unlocking from the list: the description depends on activatedAt, which only the detail has (A1)
  const needsDetail = action === 'unlock' && !isDetail(user)
  const detail = useGetAdminUser(user.id, { query: { enabled: needsDetail } })
  const activatedAt = isDetail(user) ? user.activatedAt : detail.data?.activatedAt

  const isReasonValid =
    reasonLength(reason) >= REASON_MIN_LENGTH && reasonLength(reason) <= REASON_MAX_LENGTH
  const showReasonError = action === 'lock' && reasonTouched && !isReasonValid

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() })
    void queryClient.invalidateQueries({ queryKey: getGetAdminUserQueryKey(user.id) })
  }

  const close = () => {
    if (!isPending) onClose()
  }

  const onError = (error: unknown) => {
    const apiError = toApiError(error)
    switch (apiError.code) {
      case 'USER_SELF_ACTION_FORBIDDEN':
        return setBanner(t('message.selfAction'))
      case 'USER_LAST_ADMIN':
        return setBanner(t('message.lastAdmin'))
      case 'USER_ALREADY_LOCKED':
      case 'USER_NOT_LOCKED':
        toast.info(
          t(
            apiError.code === 'USER_ALREADY_LOCKED' ? 'message.alreadyLocked' : 'message.notLocked',
          ),
        )
        refresh()
        return onClose()
      case 'USER_NOT_FOUND':
        toast.error(t('detail.notFound'))
        refresh()
        return onClose()
      case 'VALIDATION_ERROR':
        if (apiError.fieldErrors.some(({ field }) => field === 'reason')) {
          return setReasonTouched(true)
        }
        return setBanner(tCommon('error.generic'))
      case 'AUTH_RATE_LIMITED':
        return setBanner(tAuth('message.rateLimited', { count: apiError.retryAfterSeconds ?? 0 }))
      default:
        setBanner(tCommon(apiError.isNetworkError ? 'error.network' : 'error.generic'))
    }
  }

  const done = (message: string, variant: 'success' | 'info' = 'success') => {
    toast[variant](message)
    refresh()
    onClose()
  }

  const confirm = () => {
    setBanner(null)
    if (action === 'lock') {
      setReasonTouched(true)
      if (!isReasonValid) return
      lock.mutate(
        { userId: user.id, data: { reason: reason.trim() } },
        { onSuccess: () => done(t('message.locked', { name: user.fullName })), onError },
      )
    } else if (action === 'unlock') {
      unlock.mutate(
        { userId: user.id },
        {
          onSuccess: (result) =>
            result.status === 'PENDING_ACTIVATION'
              ? done(t('message.unlockedPending', { name: user.fullName }), 'info')
              : done(t('message.unlocked', { name: user.fullName })),
          onError,
        },
      )
    } else {
      logout.mutate(
        { userId: user.id },
        {
          onSuccess: (result) =>
            done(t('message.loggedOut', { name: user.fullName, count: result.revokedCount })),
          onError,
        },
      )
    }
  }

  const title = t(`dialog.${action}.title`)
  const isDestructive = action !== 'unlock'

  return (
    <DialogContent
      // While the request runs the dialog cannot be closed (S06)
      onEscapeKeyDown={(event) => isPending && event.preventDefault()}
      onPointerDownOutside={(event) => isPending && event.preventDefault()}
      showCloseButton={!isPending}
      aria-busy={isPending}
    >
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription asChild>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5 rounded-lg border bg-muted/40 px-3 py-2 text-foreground">
              <UserAvatar
                userId={user.id}
                fullName={user.fullName}
                avatarUrl={user.avatarThumbUrl}
                size={32}
              />
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{user.fullName}</span>
                <span className="truncate text-[13px] text-muted-foreground">{user.email}</span>
              </span>
            </div>
            {action === 'lock' && <p>{t('dialog.lock.description')}</p>}
            {action === 'unlock' &&
              (needsDetail && detail.isPending ? (
                <Skeleton className="h-5 w-3/4" />
              ) : (
                <p>
                  {activatedAt
                    ? t('dialog.unlock.descriptionActive', { name: user.fullName })
                    : t('dialog.unlock.descriptionPending')}
                </p>
              ))}
            {action === 'logout' && (
              <p>
                {t('dialog.logout.description', {
                  count: isDetail(user) ? user.activeSessionCount : 0,
                })}
              </p>
            )}
          </div>
        </DialogDescription>
      </DialogHeader>

      {action === 'lock' && (
        <Field data-invalid={showReasonError}>
          <FieldLabel htmlFor="lock-reason">{t('dialog.lock.reason')}</FieldLabel>
          <div className="relative">
            <Textarea
              id="lock-reason"
              rows={3}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              onBlur={() => reason.trim() !== '' && setReasonTouched(true)}
              placeholder={t('dialog.lock.reasonPlaceholder')}
              disabled={isPending}
              aria-invalid={showReasonError}
              aria-describedby={showReasonError ? 'lock-reason-error' : 'lock-reason-count'}
              className="min-h-20 resize-y bg-card pb-6"
            />
            <span
              id="lock-reason-count"
              className={cn(
                'pointer-events-none absolute right-3 bottom-2 text-xs text-muted-foreground',
                reasonLength(reason) > REASON_MAX_LENGTH && 'text-destructive-text',
              )}
            >
              {reasonLength(reason)}/{REASON_MAX_LENGTH}
            </span>
          </div>
          {showReasonError && (
            <FieldError id="lock-reason-error">{t('message.reasonLength')}</FieldError>
          )}
        </Field>
      )}

      {banner && (
        <Alert variant="destructive">
          <CircleAlert aria-hidden />
          <AlertDescription>{banner}</AlertDescription>
        </Alert>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={close} disabled={isPending}>
          {t('dialog.cancel')}
        </Button>
        <Button
          variant={isDestructive ? 'destructive' : 'default'}
          onClick={confirm}
          disabled={isPending || (action === 'lock' && reason.trim() === '')}
          aria-busy={isPending}
        >
          {isPending && <Loader2 className="animate-spin" aria-hidden />}
          {t(`dialog.${action}.confirm`)}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
