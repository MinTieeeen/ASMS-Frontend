/**
 * @file Task view (list, calendar, Gantt) and filters kept in the URL so a filtered view can be shared (F05.09),
 *   plus the task whose detail is open (`?task=`).
 * @author MinhTien
 * @version 1.3.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { useSearchParams } from 'react-router'

import type { TaskStatus } from '@/mocks'

import { TASK_STATUSES } from '../utils/task-abilities'

/** `open`: every status except Done and Cancelled */
export type StatusFilter = TaskStatus | 'open' | 'all'

/** F05.08 list (table), board by status and calendar by due date; F05.11 Gantt */
export type TaskView = 'list' | 'board' | 'calendar' | 'gantt'

export const TASK_VIEWS: readonly TaskView[] = ['list', 'board', 'calendar', 'gantt']

export interface TaskListState {
  view: TaskView
  q: string
  status: StatusFilter
  /** A user id, `me`, `none` (unassigned) or null for everyone */
  assignee: string | null
  /** A phase id, `none` (no phase) or null for every phase */
  phase: string | null
  /** "My tasks" only: a group id or null for every group */
  group: string | null
  overdueOnly: boolean
}

const STATUS_FILTERS: readonly StatusFilter[] = ['open', 'all', ...TASK_STATUSES]

export function useTaskListParams() {
  const [params, setParams] = useSearchParams()
  const statusParam = params.get('status')
  const viewParam = params.get('view')
  const state: TaskListState = {
    view: TASK_VIEWS.find((value) => value === viewParam) ?? 'list',
    q: params.get('q') ?? '',
    status: STATUS_FILTERS.find((value) => value === statusParam) ?? 'open',
    assignee: params.get('assignee'),
    phase: params.get('phase'),
    group: params.get('group'),
    overdueOnly: params.get('overdue') === '1',
  }
  const openTaskId = params.get('task')

  const update = (changes: Partial<TaskListState>) => {
    const next = { ...state, ...changes }
    const search = new URLSearchParams()
    if (next.view !== 'list') search.set('view', next.view)
    if (next.q) search.set('q', next.q)
    if (next.status !== 'open') search.set('status', next.status)
    if (next.assignee) search.set('assignee', next.assignee)
    if (next.phase) search.set('phase', next.phase)
    if (next.group) search.set('group', next.group)
    if (next.overdueOnly) search.set('overdue', '1')
    if (openTaskId) search.set('task', openTaskId)
    setParams(search, { replace: true })
  }

  /** Link that opens a task's detail while keeping the current filters */
  const taskHref = (taskId: string) => {
    const search = new URLSearchParams(params)
    search.set('task', taskId)
    return `?${search.toString()}`
  }

  const closeTask = () => {
    const search = new URLSearchParams(params)
    search.delete('task')
    setParams(search, { replace: true })
  }

  const hasFilters =
    state.q !== '' ||
    state.status !== 'open' ||
    !!state.assignee ||
    !!state.phase ||
    !!state.group ||
    state.overdueOnly
  const clearFilters = () =>
    update({ q: '', status: 'open', assignee: null, phase: null, group: null, overdueOnly: false })

  return { state, update, hasFilters, clearFilters, openTaskId, taskHref, closeTask }
}
