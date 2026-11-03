/**
 * @file What the signed-in student may do with one task (section 3.2, BR05, BR07, BR09, UC09). UX only: the backend
 *   is the real guard.
 * @author MinhTien
 * @version 1.1.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import {
  canEditTask,
  canMarkDone,
  canUpdateTaskStatus,
  type GroupWorkspace,
  isTaskClosed,
  type Task,
  type TaskStatus,
} from '@/mocks'

export const TASK_STATUSES: readonly TaskStatus[] = ['todo', 'in_progress', 'in_review', 'done', 'cancelled']

export interface TaskAbilities {
  canEdit: boolean
  /** Statuses offered in the status menu, the current one included; empty when the status cannot change */
  statuses: TaskStatus[]
  canApprove: boolean
}

/** What the abilities depend on: the task's group and the viewer's role in it */
export type WorkspaceAccess = Pick<GroupWorkspace, 'group' | 'role' | 'can' | 'isArchived'>

export function taskAbilitiesOf(workspace: WorkspaceAccess, task: Task, userId: string): TaskAbilities {
  const { group, role, isArchived } = workspace
  if (isArchived) return { canEdit: false, statuses: [], canApprove: false }

  const isManager = role !== 'member'
  const canEdit = canEditTask(role, task, userId)
  // UC09 precondition: a closed task is reopened by the leader or a deputy only
  const canMove = canUpdateTaskStatus(role, task, userId) && (isManager || !isTaskClosed(task))
  const statuses = canMove
    ? TASK_STATUSES.filter((status) => {
        if (status === task.status) return true
        // UC09: without review the assignee moves straight to Done
        if (status === 'in_review') return group.reviewEnabled
        // BR07: with review on, only the leader or a deputy moves a task to Done
        if (status === 'done') return canMarkDone(role, group)
        if (status === 'cancelled') return canEdit
        return true
      })
    : []

  return {
    canEdit,
    statuses,
    canApprove: group.reviewEnabled && task.status === 'in_review' && workspace.can('approveTask'),
  }
}
