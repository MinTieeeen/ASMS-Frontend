/**
 * @file Task card of the board (F05.03): drag handle, code and title (opens the detail), priority, due date,
 *   assignee and the status menu as the keyboard alternative to dragging.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { useDraggable } from '@dnd-kit/core'
import { GripVertical } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { DueDate, PriorityBadge, UserAvatar } from '@/components/common'
import { cn } from '@/lib/utils'
import { isTaskClosed, type MockUser, type Task } from '@/mocks'

interface TaskBoardCardProps {
  task: Task
  assignee: MockUser | null
  href: string
  statusSlot: ReactNode
}

export function TaskBoardCard({ task, assignee, href, statusSlot }: TaskBoardCardProps) {
  const { t } = useTranslation('tasks')
  const { t: tCommon } = useTranslation()
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    attributes: { roleDescription: tCommon('dnd.roleDescription') },
  })

  return (
    <TaskCardBody
      ref={setNodeRef}
      task={task}
      assignee={assignee}
      className={cn(isDragging && 'opacity-40')}
      handle={
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={t('board.dragHandle', { code: task.code })}
          className="-ml-1 flex size-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-muted focus-visible:shadow-focus active:cursor-grabbing"
        >
          <GripVertical className="size-4" aria-hidden />
        </button>
      }
      title={
        <Link to={href} className="min-w-0 rounded-sm text-sm font-medium outline-none hover:underline focus-visible:shadow-focus">
          <span className="font-mono text-xs text-muted-foreground">#{task.code}</span> {task.title}
        </Link>
      }
      statusSlot={statusSlot}
    />
  )
}

interface TaskCardBodyProps {
  task: Task
  assignee: MockUser | null
  handle: ReactNode
  title: ReactNode
  statusSlot?: ReactNode
  className?: string
  ref?: (element: HTMLElement | null) => void
}

/** The card's look without drag behaviour, also used as the drag preview */
export function TaskCardBody({ task, assignee, handle, title, statusSlot, className, ref }: TaskCardBodyProps) {
  const { t } = useTranslation('tasks')
  return (
    <article ref={ref} className={cn('flex flex-col gap-2.5 rounded-lg border bg-card p-3 shadow-xs', className)}>
      <div className="flex items-start gap-1.5">
        {handle}
        {title}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <PriorityBadge priority={task.priority} isCompact />
        <DueDate dueAt={task.dueAt} isClosed={isTaskClosed(task)} />
        <span className="ml-auto flex items-center gap-2">
          {statusSlot}
          {assignee ? (
            <UserAvatar userId={assignee.id} fullName={assignee.fullName} size={24} className="ring-1 ring-border" />
          ) : (
            <span className="text-xs text-muted-foreground">{t('field.unassigned')}</span>
          )}
        </span>
      </div>
    </article>
  )
}
