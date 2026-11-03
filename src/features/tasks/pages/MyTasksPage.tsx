/**
 * @file "My tasks" (UC11, F07.02): every task assigned to the signed-in student across their groups, as a table or
 *   a personal calendar with the groups' milestones; filtered by group, status and overdue. Status changes follow
 *   each group's rules; a task opens in its group's task tab.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { ListChecks, SearchX } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { EmptyState, PageHeader } from '@/components/common'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/config/routes'
import { canDo, ME_ID, type Task, useMockStore, useMyGroups, useUserMap } from '@/mocks'

import { TaskCalendar } from '../components/TaskCalendar'
import { TaskFilters } from '../components/TaskFilters'
import { TaskTable } from '../components/TaskTable'
import { TaskViewSwitcher } from '../components/TaskViewSwitcher'
import { type TaskView, useTaskListParams } from '../hooks/useTaskListParams'
import { filterTasks } from '../utils/filter-tasks'
import type { WorkspaceAccess } from '../utils/task-abilities'

const MY_VIEWS: readonly TaskView[] = ['list', 'calendar']

export default function MyTasksPage() {
  const { t } = useTranslation('tasks')
  const { t: tCommon } = useTranslation()
  const users = useUserMap()
  const myGroups = useMyGroups()
  const roleOverride = useMockStore((state) => state.roleOverride)
  const allTasks = useMockStore((state) => state.tasks)
  const allPhases = useMockStore((state) => state.phases)
  const allMilestones = useMockStore((state) => state.milestones)
  const { state, update, hasFilters, clearFilters } = useTaskListParams()
  const view = MY_VIEWS.includes(state.view) ? state.view : 'list'

  // Each task follows the rules of its own group, with the role previewed by the concept role switcher
  const accessByGroup = useMemo(
    () =>
      new Map(
        myGroups.map(({ group, role }): [string, WorkspaceAccess] => {
          const effectiveRole = roleOverride[group.id] ?? role
          return [
            group.id,
            {
              group,
              role: effectiveRole,
              isArchived: group.status === 'archived',
              can: (action) => canDo(effectiveRole, group, action),
            },
          ]
        }),
      ),
    [myGroups, roleOverride],
  )
  const groupNames = useMemo(() => new Map(myGroups.map(({ group }) => [group.id, group.name])), [myGroups])
  const mine = useMemo(
    () => allTasks.filter((task) => accessByGroup.has(task.groupId) && task.assigneeId === ME_ID),
    [allTasks, accessByGroup],
  )
  const visible = useMemo(
    () =>
      filterTasks(mine, { ...state, assignee: null, phase: null }, ME_ID).filter(
        (task) => !state.group || task.groupId === state.group,
      ),
    [mine, state],
  )
  const milestones = useMemo(
    () => allMilestones.filter((item) => groupNames.has(item.groupId) && (!state.group || item.groupId === state.group)),
    [allMilestones, groupNames, state.group],
  )
  const phases = useMemo(() => allPhases.filter((item) => groupNames.has(item.groupId)), [allPhases, groupNames])
  const taskHref = (task: Task) => ROUTES.groupTask(task.groupId, task.id)
  const accessOf = (task: Task) => accessByGroup.get(task.groupId) as WorkspaceAccess

  const content = () => {
    if (mine.length === 0) {
      return (
        <EmptyState
          icon={ListChecks}
          title={t('my.empty')}
          description={t('my.emptyHint')}
          action={
            <Button asChild variant="outline">
              <Link to={ROUTES.groups}>{t('my.goToGroups')}</Link>
            </Button>
          }
        />
      )
    }
    if (view === 'calendar') return <TaskCalendar tasks={visible} milestones={milestones} taskHref={taskHref} />
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
        accessOf={accessOf}
        users={users}
        phases={phases}
        taskHref={taskHref}
        groupNameOf={(task) => groupNames.get(task.groupId) ?? ''}
        hasAssigneeColumn={false}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={t('my.title')} description={t('my.description')} />
      <div className="flex flex-wrap items-center gap-3">
        <TaskViewSwitcher view={view} views={MY_VIEWS} onChange={(next) => update({ view: next })} />
        <p className="text-sm text-muted-foreground">{t('list.count', { count: visible.length })}</p>
      </div>
      <TaskFilters
        state={state}
        onChange={update}
        groups={myGroups.map(({ group }) => ({ id: group.id, name: group.name }))}
      />
      {content()}
    </div>
  )
}
