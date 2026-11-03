/**
 * @file One task as a compact row: code and title (link to the task in its group once the task tab is built),
 *   status, priority, due date, assignee; optional group name for cross-group lists (UC11) and a trailing slot.
 * @author MinhTien
 * @version 1.1.0
 * @since 2026-10-16
 * @modified 2026-11-03
 */

import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { isGroupTabReady } from '@/config/group-tabs'
import { ROUTES } from '@/config/routes'
import { cn } from '@/lib/utils'
import { isTaskClosed, type MockUser, type Task } from '@/mocks'

import { PriorityBadge, TaskStatusBadge } from './DomainBadges'
import { DueDate } from './DueDate'
import { UserAvatar } from './UserAvatar'

interface TaskListItemProps {
  task: Task
  assignee?: MockUser | null
  /** Shown above the title in lists that mix groups */
  groupName?: string
  /** Replaces the status badge, e.g. an inline status menu */
  statusSlot?: ReactNode
  className?: string
}

export function TaskListItem({ task, assignee, groupName, statusSlot, className }: TaskListItemProps) {
  const { t } = useTranslation()
  const isClosed = isTaskClosed(task)
  const titleClass = cn(
    'flex min-w-0 items-baseline gap-1.5 rounded-sm text-sm font-medium',
    task.status === 'cancelled' && 'text-muted-foreground line-through',
  )
  const title = (
    <>
      <span className="shrink-0 font-mono text-xs text-muted-foreground">#{task.code}</span>
      <span className="truncate">{task.title}</span>
    </>
  )

  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2.5', className)}>
      <div className="flex min-w-0 flex-1 basis-60 flex-col gap-0.5">
        {groupName && <span className="truncate text-xs text-muted-foreground">{groupName}</span>}
        {isGroupTabReady('tasks') ? (
          <Link
            to={ROUTES.groupTask(task.groupId, task.id)}
            className={cn(titleClass, 'outline-none hover:underline focus-visible:shadow-focus')}
          >
            {title}
          </Link>
        ) : (
          <span className={titleClass}>{title}</span>
        )}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2.5">
        <PriorityBadge priority={task.priority} isCompact />
        <DueDate dueAt={task.dueAt} isClosed={isClosed} />
        {statusSlot ?? <TaskStatusBadge status={task.status} />}
        {assignee !== undefined &&
          (assignee ? (
            <UserAvatar userId={assignee.id} fullName={assignee.fullName} size={24} className="ring-1 ring-border" />
          ) : (
            <span className="text-xs text-muted-foreground">{t('domain.unassigned')}</span>
          ))}
      </div>
    </div>
  )
}
