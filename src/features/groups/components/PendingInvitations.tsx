/**
 * @file E-mail invitations I received (UC04-1a: accepting joins at once) and join requests I sent that wait for a
 *   leader's decision (UC04 step 4).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { Hourglass, MailOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { RelativeTime } from '@/components/common'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/config/routes'
import { JOINABLE_GROUPS, useMockStore, useUserMap } from '@/mocks'

export function PendingInvitations() {
  const { t } = useTranslation('groups')
  const navigate = useNavigate()
  const users = useUserMap()
  const invitations = useMockStore((state) => state.invitationsToMe)
  const pendingCodes = useMockStore((state) => state.myPendingRequests)
  const joinByCode = useMockStore((state) => state.joinByCode)
  const declineInvitation = useMockStore((state) => state.declineInvitation)
  const cancelJoinRequest = useMockStore((state) => state.cancelJoinRequest)

  if (invitations.length === 0 && pendingCodes.length === 0) return null

  const groupOf = (code: string) => JOINABLE_GROUPS.find((item) => item.joinCode === code)

  return (
    <section aria-labelledby="pending-title" className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-xs">
      <h2 id="pending-title" className="text-sm font-semibold">
        {t('pending.title')}
      </h2>
      <ul className="flex flex-col divide-y">
        {invitations.map((invitation) => {
          const group = groupOf(invitation.joinCode)
          return (
            <li key={invitation.id} className="flex flex-wrap items-center gap-3 py-2.5">
              <MailOpen className="size-4.5 text-info" aria-hidden />
              <p className="min-w-0 flex-1 text-sm">
                {t('pending.invitation', {
                  name: users[invitation.invitedBy]?.fullName ?? '',
                  group: group?.name ?? invitation.joinCode,
                })}{' '}
                <RelativeTime value={invitation.createdAt} className="text-xs text-muted-foreground" />
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => declineInvitation(invitation.id)}>
                  {t('pending.decline')}
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    joinByCode(invitation.joinCode, true)
                    toast.success(t('join.joined', { group: group?.name ?? '' }))
                    if (group) void navigate(ROUTES.groupDetail(group.id))
                  }}
                >
                  {t('pending.accept')}
                </Button>
              </div>
            </li>
          )
        })}
        {pendingCodes.map((code) => (
          <li key={code} className="flex flex-wrap items-center gap-3 py-2.5">
            <Hourglass className="size-4.5 text-highlight-text" aria-hidden />
            <p className="min-w-0 flex-1 text-sm">
              {t('pending.request', { group: groupOf(code)?.name ?? code })}
            </p>
            <Button variant="ghost" size="sm" onClick={() => cancelJoinRequest(code)}>
              {t('pending.cancelRequest')}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
}
