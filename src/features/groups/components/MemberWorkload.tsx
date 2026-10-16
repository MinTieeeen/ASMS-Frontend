/**
 * @file Open and done tasks per member, so the leader sees who is overloaded (F07.01).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { useTranslation } from 'react-i18next'

import { UserAvatar } from '@/components/common'
import { isTaskClosed, isTaskOverdue, type Member, type MockUser, type Task } from '@/mocks'

interface MemberWorkloadProps {
  members: Member[]
  tasks: Task[]
  users: Record<string, MockUser>
}

export function MemberWorkload({ members, tasks, users }: MemberWorkloadProps) {
  const { t } = useTranslation('groups')
  const rows = members.map((member) => {
    const mine = tasks.filter((task) => task.assigneeId === member.userId && !task.parentTaskId)
    return {
      member,
      open: mine.filter((task) => !isTaskClosed(task)).length,
      done: mine.filter((task) => task.status === 'done').length,
      overdue: mine.filter((task) => isTaskOverdue(task)).length,
    }
  })
  const max = Math.max(1, ...rows.map((row) => row.open + row.done))

  return (
    <ul className="flex flex-col gap-3">
      {rows.map(({ member, open, done, overdue }) => {
        const user = users[member.userId]
        return (
          <li key={member.id} className="flex items-center gap-3">
            <UserAvatar userId={member.userId} fullName={user?.fullName ?? '?'} size={28} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2 text-[13px]">
                <span className="truncate font-medium">{user?.fullName}</span>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {t('overview.workload', { open, done })}
                  {overdue > 0 && <span className="ml-1 font-medium text-destructive-text">· {t('overview.workloadOverdue', { count: overdue })}</span>}
                </span>
              </div>
              <div className="mt-1 flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                <span className="bg-status-done" style={{ width: `${(done / max) * 100}%` }} />
                <span className="bg-status-doing" style={{ width: `${(open / max) * 100}%` }} />
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
