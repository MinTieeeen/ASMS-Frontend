/**
 * @file Task board with one column per status (F05.03, F05.08, UC09): drag a card to another column, with the mouse,
 *   touch or the keyboard. A move the student may not make sends the card back with a message (UC09-1a); without
 *   the review step there is no "Awaiting review" column.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  type UniqueIdentifier,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { GripVertical } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { StatusDot } from '@/components/common'
import { useDndAccessibility } from '@/hooks'
import { cn } from '@/lib/utils'
import { type GroupWorkspace, ME_ID, type MockUser, type Task, type TaskStatus } from '@/mocks'

import { useTaskStatusChange } from '../hooks/useTaskStatusChange'
import { taskAbilitiesOf } from '../utils/task-abilities'
import { TaskBoardCard, TaskCardBody } from './TaskBoardCard'
import { TaskStatusMenu } from './TaskStatusMenu'

/** A small move first, so clicking the handle or a link never starts a drag */
const DRAG_DISTANCE_PX = 5

interface TaskBoardProps {
  workspace: GroupWorkspace
  /** Filtered tasks of every status except Cancelled */
  tasks: Task[]
  users: Record<string, MockUser>
  taskHref: (taskId: string) => string
}

export function TaskBoard({ workspace, tasks, users, taskHref }: TaskBoardProps) {
  const { t } = useTranslation('tasks')
  const { t: tCommon } = useTranslation()
  const { group } = workspace
  const columns: TaskStatus[] = group.reviewEnabled
    ? ['todo', 'in_progress', 'in_review', 'done']
    : ['todo', 'in_progress', 'done']
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const { changeStatus, resultDialog } = useTaskStatusChange(group)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: DRAG_DISTANCE_PX } }),
    useSensor(KeyboardSensor),
  )
  const taskOf = (id: UniqueIdentifier) => tasks.find((task) => task.id === id)
  const columnOf = (id: UniqueIdentifier) => columns.find((status) => status === id)
  const accessibility = useDndAccessibility((id) => {
    const status = columnOf(id)
    if (status) return tCommon(`domain.taskStatus.${status}`)
    const task = taskOf(id)
    return task ? `#${task.code} ${task.title}` : String(id)
  })
  const assigneeOf = (task: Task) => (task.assigneeId ? (users[task.assigneeId] ?? null) : null)
  const active = activeId === null ? undefined : taskOf(activeId)

  const handleDragEnd = ({ active: dragged, over }: DragEndEvent) => {
    setActiveId(null)
    const task = taskOf(dragged.id)
    const status = over ? columnOf(over.id) : undefined
    if (!task || !status || status === task.status) return
    if (!taskAbilitiesOf(workspace, task, ME_ID).statuses.includes(status)) {
      toast.error(t('status.noPermission'))
      return
    }
    changeStatus(task, status)
  }

  return (
    <div className="flex flex-col gap-2">
      <DndContext
        sensors={sensors}
        accessibility={accessibility}
        onDragStart={({ active: dragged }) => setActiveId(dragged.id)}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={handleDragEnd}
      >
        <div role="region" aria-label={t('board.label')} className="flex gap-3 overflow-x-auto pb-2">
          {columns.map((status) => {
            const columnTasks = tasks.filter((task) => task.status === status)
            return (
              <BoardColumn key={status} status={status} count={columnTasks.length}>
                {columnTasks.map((task) => (
                  <li key={task.id}>
                    <TaskBoardCard
                      task={task}
                      assignee={assigneeOf(task)}
                      href={taskHref(task.id)}
                      statusSlot={
                        <TaskStatusMenu task={task} group={group} statuses={taskAbilitiesOf(workspace, task, ME_ID).statuses} />
                      }
                    />
                  </li>
                ))}
              </BoardColumn>
            )
          })}
        </div>
        <DragOverlay>
          {active && (
            <TaskCardBody
              task={active}
              assignee={assigneeOf(active)}
              className="rotate-1 shadow-lg"
              handle={<GripVertical className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden />}
              title={
                <span className="text-sm font-medium">
                  <span className="font-mono text-xs text-muted-foreground">#{active.code}</span> {active.title}
                </span>
              }
            />
          )}
        </DragOverlay>
      </DndContext>
      <p className="text-xs text-muted-foreground">{t('board.hiddenCancelled')}</p>
      {resultDialog}
    </div>
  )
}

function BoardColumn({ status, count, children }: { status: TaskStatus; count: number; children: ReactNode }) {
  const { t } = useTranslation('tasks')
  const { t: tCommon } = useTranslation()
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const name = tCommon(`domain.taskStatus.${status}`)

  return (
    <section
      ref={setNodeRef}
      aria-label={name}
      className={cn(
        'flex w-72 shrink-0 flex-col gap-2 rounded-xl border bg-muted/40 p-2 transition-colors lg:w-auto lg:min-w-60 lg:flex-1',
        isOver && 'border-primary bg-accent',
      )}
    >
      <h3 className="flex items-center gap-2 px-1.5 pt-1 text-sm font-semibold">
        <StatusDot status={status} />
        {name}
        <span className="font-normal text-muted-foreground tabular-nums">{count}</span>
      </h3>
      {count === 0 ? (
        <p className="rounded-lg border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">{t('board.empty')}</p>
      ) : (
        <ul className="flex flex-col gap-2">{children}</ul>
      )}
    </section>
  )
}
