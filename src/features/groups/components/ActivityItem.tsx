/**
 * @file One line of the group activity log (F11.01): who did what, when.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { useTranslation } from 'react-i18next'

import { RelativeTime, UserAvatar } from '@/components/common'
import type { Activity, GroupRole, MockUser, TaskStatus } from '@/mocks'

const STATUSES: readonly TaskStatus[] = ['todo', 'in_progress', 'in_review', 'done', 'cancelled']
const ROLES: readonly GroupRole[] = ['leader', 'deputy', 'member']

interface ActivityItemProps {
  activity: Activity
  actor: MockUser | undefined
  /** BR10: the actor has left the group */
  isFormer?: boolean
}

export function ActivityItem({ activity, actor, isFormer = false }: ActivityItemProps) {
  const { t } = useTranslation('groups')
  const { t: tCommon } = useTranslation()
  const status = STATUSES.find((value) => value === activity.params.status)
  const role = ROLES.find((value) => value === activity.params.role)
  const params = {
    ...activity.params,
    actor: actor?.fullName ?? '',
    status: status ? tCommon(`domain.taskStatus.${status}`) : '',
    role: role ? tCommon(`domain.groupRole.${role}`) : '',
  }

  return (
    <div className="flex items-start gap-3 py-2.5">
      <UserAvatar userId={activity.actorId} fullName={actor?.fullName ?? '?'} size={28} />
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          {t(`activity.kind.${activity.kind}`, params)}
          {isFormer && <span className="ml-1.5 text-xs text-muted-foreground">({tCommon('domain.formerMember')})</span>}
        </p>
        <RelativeTime value={activity.createdAt} className="text-xs text-muted-foreground" />
      </div>
    </div>
  )
}
