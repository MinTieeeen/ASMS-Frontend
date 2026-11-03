/**
 * @file Tasks tab of the group workspace (M05): the filtered tasks as a table, a drag-and-drop board, a month
 *   calendar or a Gantt chart (F05.03, F05.08, F05.09, F05.11), adding and editing tasks (F05.01, F05.02) and the
 *   task detail sheet opened by `?task=`.
 * @author MinhTien
 * @version 1.2.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { ListChecks, Plus, SearchX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { EmptyState } from '@/components/common'
import { Button } from '@/components/ui/button'
import { byPosition, type GroupWorkspace, ME_ID, type Task, useGroupWorkspace, useMockStore, useUserMap } from '@/mocks'

import { TaskBoard } from '../components/TaskBoard'
import { TaskCalendar } from '../components/TaskCalendar'
import { TaskDetailSheet } from '../components/TaskDetailSheet'
import { TaskFilters } from '../components/TaskFilters'
import { TaskFormDialog } from '../components/TaskFormDialog'
import { TaskGantt } from '../components/TaskGantt'
import { TaskTable } from '../components/TaskTable'
import { TaskViewSwitcher } from '../components/TaskViewSwitcher'
import { useTaskListParams } from '../hooks/useTaskListParams'
import { filterTasks } from '../utils/filter-tasks'

export default function GroupTasksPage() {
  const workspace = useGroupWorkspace()
  return workspace ? <Tasks workspace={workspace} /> : null
}

function Tasks({ workspace }: { workspace: GroupWorkspace }) {
  const { t } = useTranslation('tasks')
  const { t: tCommon } = useTranslation()
  const { group } = workspace
  const users = useUserMap()
  const allTasks = useMockStore((state) => state.tasks)
  const allPhases = useMockStore((state) => state.phases)
  const allMilestones = useMockStore((state) => state.milestones)
  const { state, update, hasFilters, clearFilters, openTaskId, taskHref, closeTask } = useTaskListParams()
  const [form, setForm] = useState<{ task: Task | null } | null>(null)

  const groupTasks = useMemo(() => allTasks.filter((item) => item.groupId === group.id), [allTasks, group.id])
  const phases = useMemo(() => allPhases.filter((item) => item.groupId === group.id).sort(byPosition), [allPhases, group.id])
  const milestones = useMemo(() => allMilestones.filter((item) => item.groupId === group.id), [allMilestones, group.id])
  const isBoard = state.view === 'board'
  // Every status is a column on the board, so the status filter does not apply there
  const visible = useMemo(
    () =>
      isBoard
        ? filterTasks(groupTasks, { ...state, status: 'all' }, ME_ID).filter((task) => task.status !== 'cancelled')
        : filterTasks(groupTasks, state, ME_ID),
    [groupTasks, state, isBoard],
  )
  const canCreate = workspace.can('createTask')
  const hasAnyTask = groupTasks.some((item) => !item.parentTaskId)
  const openCreate = () => setForm({ task: null })

  const content = () => {
    if (!hasAnyTask) {
      return (
        <EmptyState
          icon={ListChecks}
          title={t('list.empty')}
          description={t('list.emptyHint')}
          action={canCreate ? <Button onClick={openCreate}>{t('list.add')}</Button> : undefined}
        />
      )
    }
    if (isBoard) return <TaskBoard workspace={workspace} tasks={visible} users={users} taskHref={taskHref} />
    if (state.view === 'calendar') return <TaskCalendar tasks={visible} milestones={milestones} taskHref={(task) => taskHref(task.id)} />
    if (state.view === 'gantt') return <TaskGantt phases={phases} tasks={visible} taskHref={taskHref} />
    if (visible.length === 0) {
      return (
        <EmptyState
          icon={SearchX}
          title={t('list.noMatch')}
          action={hasFilters ? <Button variant="outline" onClick={clearFilters}>{tCommon('action.clearFilters')}</Button> : undefined}
        />
      )
    }
    return (
      <TaskTable
        tasks={visible}
        accessOf={() => workspace}
        users={users}
        phases={phases}
        taskHref={(task) => taskHref(task.id)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <TaskViewSwitcher view={state.view} onChange={(view) => update({ view })} />
          <p className="text-sm text-muted-foreground">{t('list.count', { count: visible.length })}</p>
        </div>
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus aria-hidden />
            {t('list.add')}
          </Button>
        )}
      </div>
      <TaskFilters
        state={state}
        members={workspace.members}
        users={users}
        phases={phases}
        hasStatusFilter={!isBoard}
        onChange={update}
      />
      {content()}

      <TaskDetailSheet workspace={workspace} taskId={openTaskId} onClose={closeTask} onEdit={(task) => setForm({ task })} />
      <TaskFormDialog
        workspace={workspace}
        task={form?.task ?? null}
        open={form !== null}
        onOpenChange={(open) => !open && setForm(null)}
      />
    </div>
  )
}
