/**
 * @file Active members of a group with role, join date and open tasks; the leader changes roles (F03.05, BR01),
 *   transfers leadership (F03.06, UC05) and removes members (F03.07, BR10).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ConfirmDialog, GroupRoleBadge, UserAvatar } from '@/components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MAX_DEPUTIES } from '@/config/constants'
import { type GroupWorkspace, isTaskClosed, ME_ID, type Member, useMockStore, useUserMap } from '@/mocks'
import { formatDate } from '@/utils/date'

import { MemberActions } from './MemberActions'
import { TransferLeaderDialog } from './TransferLeaderDialog'

interface Target {
  userId: string
  fullName: string
}

export function MemberList({ workspace }: { workspace: GroupWorkspace }) {
  const { t } = useTranslation('groups')
  const { t: tCommon } = useTranslation()
  const { group, members, can } = workspace
  const users = useUserMap()
  const tasks = useMockStore((state) => state.tasks)
  const changeRole = useMockStore((state) => state.changeRole)
  const transferLeadership = useMockStore((state) => state.transferLeadership)
  const removeMember = useMockStore((state) => state.removeMember)
  const [transferTarget, setTransferTarget] = useState<Target | null>(null)
  const [removeTarget, setRemoveTarget] = useState<Target | null>(null)

  const canManage = can('changeRole')
  const isDeputyLimitReached = members.filter((item) => item.role === 'deputy').length >= MAX_DEPUTIES
  const nameOf = (userId: string) => users[userId]?.fullName ?? '?'
  const openTasksOf = (userId: string) =>
    tasks.filter(
      (task) =>
        task.groupId === group.id && task.assigneeId === userId && !task.parentTaskId && !isTaskClosed(task),
    ).length

  const handleChangeRole = (member: Member, role: Member['role']) => {
    changeRole(group.id, member.userId, role)
    toast.success(t('members.roleChanged', { name: nameOf(member.userId) }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('members.title')}</CardTitle>
        <CardDescription>{t('members.countOfMax', { count: members.length, max: group.maxMembers })}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="-my-3 divide-y">
          {members.map((member) => {
            const fullName = nameOf(member.userId)
            return (
              <li key={member.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
                <UserAvatar userId={member.userId} fullName={fullName} size={36} />
                <div className="min-w-0 flex-1 basis-40">
                  <p className="truncate text-sm font-medium">
                    {fullName}
                    {member.userId === ME_ID && (
                      <span className="font-normal text-muted-foreground"> ({tCommon('domain.you')})</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {users[member.userId]?.userCode} · {t('members.joinedAt')} {formatDate(member.joinedAt)}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {t('members.openTasks', { count: openTasksOf(member.userId) })}
                </span>
                <GroupRoleBadge role={member.role} />
                {canManage && member.userId !== ME_ID && (
                  <MemberActions
                    member={member}
                    fullName={fullName}
                    isDeputyLimitReached={isDeputyLimitReached}
                    onMakeDeputy={() => handleChangeRole(member, 'deputy')}
                    onMakeMember={() => handleChangeRole(member, 'member')}
                    onTransfer={() => setTransferTarget({ userId: member.userId, fullName })}
                    onRemove={() => setRemoveTarget({ userId: member.userId, fullName })}
                  />
                )}
              </li>
            )
          })}
        </ul>
      </CardContent>

      <TransferLeaderDialog
        groupName={group.name}
        target={transferTarget}
        onClose={() => setTransferTarget(null)}
        onConfirm={(userId) => {
          transferLeadership(group.id, userId)
          toast.success(t('members.transferred', { name: nameOf(userId) }))
          setTransferTarget(null)
        }}
      />
      <ConfirmDialog
        open={removeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null)
        }}
        title={t('members.removeTitle', { name: removeTarget?.fullName ?? '' })}
        description={t('members.removeDescription')}
        confirmLabel={t('members.remove')}
        cancelLabel={tCommon('action.cancel')}
        onConfirm={() => {
          if (!removeTarget) return
          removeMember(group.id, removeTarget.userId)
          toast.success(t('members.removed_toast', { name: removeTarget.fullName }))
          setRemoveTarget(null)
        }}
      />
    </Card>
  )
}
