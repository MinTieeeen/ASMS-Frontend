/**
 * @file Join requests waiting for approval (F03.04, UC04 step 5): approve or reject; a full group cannot approve.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { Check, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { RelativeTime, UserAvatar } from '@/components/common'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type GroupWorkspace, useMockStore, useUserMap } from '@/mocks'

export function JoinRequestsCard({ workspace }: { workspace: GroupWorkspace }) {
  const { t } = useTranslation('groups')
  const users = useUserMap()
  const all = useMockStore((state) => state.joinRequests)
  const approve = useMockStore((state) => state.approveJoinRequest)
  const reject = useMockStore((state) => state.rejectJoinRequest)
  const requests = all.filter((item) => item.groupId === workspace.group.id)
  const isFull = workspace.members.length >= workspace.group.maxMembers

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {t('requests.title')}
          {requests.length > 0 && <Badge variant="destructive">{requests.length}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('requests.empty')}</p>
        ) : (
          <ul className="flex flex-col divide-y">
            {requests.map((request) => {
              const user = users[request.userId]
              return (
                <li key={request.id} className="flex flex-col gap-2 py-3 first:pt-0">
                  <div className="flex items-center gap-2.5">
                    <UserAvatar userId={request.userId} fullName={user?.fullName ?? '?'} size={32} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{user?.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {user?.userCode} · <RelativeTime value={request.createdAt} />
                      </p>
                    </div>
                  </div>
                  {request.message && (
                    <p className="rounded-md bg-muted px-3 py-2 text-[13px]">“{request.message}”</p>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        reject(request.id)
                        toast(t('requests.rejected', { name: user?.fullName ?? '' }))
                      }}
                    >
                      <X aria-hidden />
                      {t('requests.reject')}
                    </Button>
                    <Button
                      size="sm"
                      disabled={isFull}
                      title={isFull ? t('invite.full') : undefined}
                      onClick={() => {
                        approve(request.id)
                        toast.success(t('requests.approved', { name: user?.fullName ?? '' }))
                      }}
                    >
                      <Check aria-hidden />
                      {t('requests.approve')}
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
