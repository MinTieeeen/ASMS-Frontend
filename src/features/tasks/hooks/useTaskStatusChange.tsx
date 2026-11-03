/**
 * @file Changes a task's status from the status menu or the board (F05.03, UC09); when the group requires a result
 *   before review, asks for it first (UC09 step 2). Render the returned dialog next to the trigger.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { type Group, type Task, type TaskStatus, useMockStore } from '@/mocks'

import { TaskNoteDialog } from '../components/TaskNoteDialog'

export function useTaskStatusChange(group: Pick<Group, 'requireResultOnReview'>) {
  const { t } = useTranslation('tasks')
  const { t: tCommon } = useTranslation()
  const setTaskStatus = useMockStore((state) => state.setTaskStatus)
  const addComment = useMockStore((state) => state.addComment)
  const [awaitingResult, setAwaitingResult] = useState<Task | null>(null)

  const apply = (task: Task, status: TaskStatus) => {
    setTaskStatus(task.id, status)
    toast.success(t('status.changed', { code: task.code, status: tCommon(`domain.taskStatus.${status}`) }))
  }

  const changeStatus = (task: Task, status: TaskStatus) => {
    if (status === task.status) return
    if (status === 'in_review' && group.requireResultOnReview) setAwaitingResult(task)
    else apply(task, status)
  }

  const resultDialog = (
    <TaskNoteDialog
      open={awaitingResult !== null}
      onOpenChange={(open) => !open && setAwaitingResult(null)}
      title={t('submit.title', { code: awaitingResult?.code ?? '' })}
      description={t('submit.description')}
      label={t('submit.result')}
      confirmLabel={t('submit.confirm')}
      onConfirm={(result) => {
        if (!awaitingResult) return
        // The result is kept as a comment so the reviewer reads it next to the task
        addComment(awaitingResult.id, result)
        apply(awaitingResult, 'in_review')
      }}
    />
  )

  return { changeStatus, resultDialog }
}
