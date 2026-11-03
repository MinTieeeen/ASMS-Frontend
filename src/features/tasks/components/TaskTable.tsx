/**
 * @file Task list as a table with column headings (F05.08): optional group, ID, task, status (inline menu),
 *   priority, assignee, phase, start and due date. Works for one group or across groups (UC11). Scrolls sideways
 *   on narrow screens.
 * @author MinhTien
 * @version 2.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { DueDate, PriorityBadge, UserAvatar } from '@/components/common'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { isTaskClosed, ME_ID, type MockUser, type Phase, type Task } from '@/mocks'
import { formatDate } from '@/utils/date'

import { taskAbilitiesOf, type WorkspaceAccess } from '../utils/task-abilities'
import { TaskStatusMenu } from './TaskStatusMenu'

interface TaskTableProps {
  tasks: Task[]
  /** Group, role and permissions that apply to a task; tasks of one group all share the same */
  accessOf: (task: Task) => WorkspaceAccess
  users: Record<string, MockUser>
  phases: Phase[]
  taskHref: (task: Task) => string
  /** Adds a "Group" column first, for lists that mix groups */
  groupNameOf?: (task: Task) => string
  /** False when every task is the viewer's own */
  hasAssigneeColumn?: boolean
}

export function TaskTable({
  tasks,
  accessOf,
  users,
  phases,
  taskHref,
  groupNameOf,
  hasAssigneeColumn = true,
}: TaskTableProps) {
  const { t } = useTranslation('tasks')
  const phaseNames = new Map(phases.map((phase) => [phase.id, phase.name]))

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table aria-label={t('list.label')}>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            {groupNameOf && <TableHead className="pl-4">{t('table.group')}</TableHead>}
            <TableHead className={cn('w-16', !groupNameOf && 'pl-4')}>{t('table.code')}</TableHead>
            <TableHead className="min-w-64">{t('table.title')}</TableHead>
            <TableHead>{t('table.status')}</TableHead>
            <TableHead>{t('table.priority')}</TableHead>
            {hasAssigneeColumn && <TableHead>{t('table.assignee')}</TableHead>}
            <TableHead>{t('table.phase')}</TableHead>
            <TableHead>{t('table.startDate')}</TableHead>
            <TableHead className="pr-4">{t('table.dueDate')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const assignee = task.assigneeId ? users[task.assigneeId] : null
            const isClosed = isTaskClosed(task)
            const access = accessOf(task)
            return (
              <TableRow key={task.id} className={cn(isClosed && 'text-muted-foreground')}>
                {groupNameOf && (
                  <TableCell className="max-w-48 truncate pl-4 text-[13px]">{groupNameOf(task)}</TableCell>
                )}
                <TableCell className={cn('font-mono text-xs text-muted-foreground', !groupNameOf && 'pl-4')}>
                  #{task.code}
                </TableCell>
                <TableCell className="max-w-96 whitespace-normal">
                  <Link
                    to={taskHref(task)}
                    className={cn(
                      'rounded-sm font-medium outline-none hover:underline focus-visible:shadow-focus',
                      task.status === 'cancelled' && 'line-through',
                    )}
                  >
                    {task.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <TaskStatusMenu task={task} group={access.group} statuses={taskAbilitiesOf(access, task, ME_ID).statuses} />
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={task.priority} />
                </TableCell>
                {hasAssigneeColumn && (
                  <TableCell>
                    {assignee ? (
                      <span className="flex items-center gap-2">
                        <UserAvatar userId={assignee.id} fullName={assignee.fullName} size={22} />
                        {assignee.fullName}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">{t('field.unassigned')}</span>
                    )}
                  </TableCell>
                )}
                <TableCell className="text-[13px]">
                  {(task.phaseId && phaseNames.get(task.phaseId)) ?? (
                    <span className="text-xs text-muted-foreground">{t('field.noPhase')}</span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {task.startAt ? formatDate(task.startAt) : '—'}
                </TableCell>
                <TableCell className="pr-4">
                  <DueDate dueAt={task.dueAt} isClosed={isClosed} />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
