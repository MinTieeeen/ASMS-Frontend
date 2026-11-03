/**
 * @file Leave the group (F03.07, UC05): the leader must transfer leadership first; an archived group is read-only.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { LogOut } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/common'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/config/routes'
import { type GroupWorkspace, ME_ID, useMockStore } from '@/mocks'

export function LeaveGroupButton({ workspace }: { workspace: GroupWorkspace }) {
  const { t } = useTranslation('groups')
  const { t: tCommon } = useTranslation()
  const navigate = useNavigate()
  const removeMember = useMockStore((state) => state.removeMember)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const { group, actualRole, isArchived } = workspace
  const isLeader = actualRole === 'leader'

  if (isArchived) return null

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" disabled={isLeader} onClick={() => setIsConfirmOpen(true)}>
        <LogOut aria-hidden />
        {t('members.leave')}
      </Button>
      {isLeader && <p className="text-xs text-muted-foreground">{t('members.leaderCannotLeave')}</p>}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title={t('members.leaveTitle', { group: group.name })}
        description={t('members.leaveDescription')}
        confirmLabel={t('members.leave')}
        cancelLabel={tCommon('action.cancel')}
        onConfirm={() => {
          removeMember(group.id, ME_ID, true)
          toast.success(t('members.leftToast', { group: group.name }))
          void navigate(ROUTES.groups, { replace: true })
        }}
      />
    </div>
  )
}
