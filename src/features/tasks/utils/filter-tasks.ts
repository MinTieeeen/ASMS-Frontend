/**
 * @file Filters and orders the task list (F05.08, F05.09): open tasks first by due date, tasks without a deadline
 *   next, closed tasks last; sub-tasks are listed under their parent only.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { isTaskClosed, isTaskOverdue, type Task } from '@/mocks'
import { toSearchKey } from '@/utils/search'

import type { TaskListState } from '../hooks/useTaskListParams'

export function filterTasks(tasks: Task[], state: TaskListState, meId: string, now = new Date()): Task[] {
  const keyword = toSearchKey(state.q)
  const assignee = state.assignee === 'me' ? meId : state.assignee

  return tasks
    .filter((task) => {
      if (task.parentTaskId) return false
      if (state.status === 'open' && isTaskClosed(task)) return false
      if (state.status !== 'open' && state.status !== 'all' && task.status !== state.status) return false
      if (assignee && (task.assigneeId ?? 'none') !== assignee) return false
      if (state.phase && (task.phaseId ?? 'none') !== state.phase) return false
      if (state.overdueOnly && !isTaskOverdue(task, now)) return false
      return !keyword || toSearchKey(`${task.code} ${task.title}`).includes(keyword)
    })
    .sort(compareTasks)
}

function compareTasks(a: Task, b: Task): number {
  const closed = Number(isTaskClosed(a)) - Number(isTaskClosed(b))
  if (closed !== 0) return closed
  if (a.dueAt !== b.dueAt) {
    if (!a.dueAt) return 1
    if (!b.dueAt) return -1
    return a.dueAt.localeCompare(b.dueAt)
  }
  return a.code - b.code
}
