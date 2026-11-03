/**
 * @file Task detail in a side sheet opened by `?task=` (F05.08): status, review, fields, description, edit and
 *   delete, history and comments.
 * @author MinhTien
 * @version 1.1.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ConfirmDialog, DueDate, PriorityBadge, UserAvatar } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { type GroupWorkspace, isTaskClosed, ME_ID, type Task, useMockStore, useUserMap } from '@/mocks'
import { formatDate } from '@/utils/date'

import { taskAbilitiesOf } from '../utils/task-abilities'
import { TaskComments } from './TaskComments'
import { TaskHistory } from './TaskHistory'
import { TaskReviewActions } from './TaskReviewActions'
import { TaskStatusMenu } from './TaskStatusMenu'

interface TaskDetailSheetProps {
  workspace: GroupWorkspace
  /** Null closes the sheet */
  taskId: string | null
  onClose: () => void
  onEdit: (task: Task) => void
}

export function TaskDetailSheet({ workspace, taskId, onClose, onEdit }: TaskDetailSheetProps) {
  const { t } = useTranslation('tasks')
  const task = useMockStore((state) =>
    state.tasks.find((item) => item.id === taskId && item.groupId === workspace.group.id),
  )

  return (
    <Sheet open={taskId !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {task ? (
          <TaskDetail workspace={workspace} task={task} onEdit={onEdit} onDeleted={onClose} />
        ) : (
          <SheetHeader>
            <SheetTitle>{t('detail.notFound')}</SheetTitle>
            <SheetDescription className="sr-only">{t('detail.notFound')}</SheetDescription>
          </SheetHeader>
        )}
      </SheetContent>
    </Sheet>
  )
}

interface TaskDetailProps {
  workspace: GroupWorkspace
  task: Task
  onEdit: (task: Task) => void
  onDeleted: () => void
}

function TaskDetail({ workspace, task, onEdit, onDeleted }: TaskDetailProps) {
  const { t } = useTranslation('tasks')
  const { t: tCommon } = useTranslation()
  const users = useUserMap()
  const phase = useMockStore((state) => state.phases.find((item) => item.id === task.phaseId))
  const deleteTask = useMockStore((state) => state.deleteTask)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const abilities = taskAbilitiesOf(workspace, task, ME_ID)
  const assignee = task.assigneeId ? users[task.assigneeId] : null

  return (
    <>
      <SheetHeader className="pr-12">
        <SheetTitle className="text-lg">
          <span className="font-mono text-sm text-muted-foreground">#{task.code}</span> {task.title}
        </SheetTitle>
        <SheetDescription>
          {t('detail.createdAt', { date: formatDate(task.createdAt) })}
          {task.completedAt && ` · ${t('detail.completedAt', { date: formatDate(task.completedAt) })}`}
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-col gap-5 px-4 pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <TaskStatusMenu task={task} group={workspace.group} statuses={abilities.statuses} />
          <PriorityBadge priority={task.priority} />
          <DueDate dueAt={task.dueAt} isClosed={isTaskClosed(task)} />
        </div>
        <TaskReviewActions task={task} canApprove={abilities.canApprove} />

        <dl className="grid grid-cols-[8rem_1fr] gap-x-3 gap-y-2 text-sm">
          <dt className="text-muted-foreground">{t('field.assignee')}</dt>
          <dd className="flex items-center gap-2">
            {assignee ? (
              <>
                <UserAvatar userId={assignee.id} fullName={assignee.fullName} size={22} />
                {assignee.fullName}
              </>
            ) : (
              <span className="text-muted-foreground">{t('field.unassigned')}</span>
            )}
          </dd>
          <dt className="text-muted-foreground">{t('field.startDate')}</dt>
          <dd>{task.startAt ? formatDate(task.startAt) : <span className="text-muted-foreground">—</span>}</dd>
          <dt className="text-muted-foreground">{t('field.phase')}</dt>
          <dd>{phase?.name ?? <span className="text-muted-foreground">{t('field.noPhase')}</span>}</dd>
          <dt className="text-muted-foreground">{t('field.createdBy')}</dt>
          <dd>{users[task.createdBy]?.fullName ?? '?'}</dd>
        </dl>

        <p className="text-sm whitespace-pre-line">
          {task.description || <span className="text-muted-foreground">{t('detail.noDescription')}</span>}
        </p>

        {abilities.canEdit && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
              <Pencil aria-hidden />
              {t('detail.edit')}
            </Button>
            <Button variant="outline" size="sm" className="text-destructive-text" onClick={() => setIsDeleteOpen(true)}>
              <Trash2 aria-hidden />
              {t('detail.delete')}
            </Button>
          </div>
        )}

        <TaskHistory taskId={task.id} />
        <TaskComments taskId={task.id} canComment={!workspace.isArchived} />
      </div>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={t('detail.deleteTitle', { code: task.code })}
        description={t('detail.deleteDescription')}
        confirmLabel={t('detail.delete')}
        cancelLabel={tCommon('action.cancel')}
        onConfirm={() => {
          deleteTask(task.id)
          toast.success(t('detail.deleted', { code: task.code }))
          setIsDeleteOpen(false)
          onDeleted()
        }}
      />
    </>
  )
}
