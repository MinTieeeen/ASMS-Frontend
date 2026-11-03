/**
 * @file Numbers of the personal dashboard (UC11, F07.02) across every group of the student: headline counts, the
 *   status split of open tasks, deadlines per day, urgent tasks, group rows and upcoming milestones. Days are
 *   counted in the user time zone (BR13).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { addDays } from 'date-fns'

import { env } from '@/config/env'
import {
  byPosition,
  isTaskClosed,
  isTaskOverdue,
  type Milestone,
  type MyGroup,
  type Phase,
  progressOf,
  type Task,
} from '@/mocks'
import { toDateInputValue } from '@/utils/date'

const DAY_MS = 86_400_000
/** Due within this many days counts as urgent */
const URGENT_DAYS = 3
export const WORKLOAD_DAYS = 14
const MILESTONE_LIMIT = 5

export type OpenStatus = 'todo' | 'in_progress' | 'in_review'

export interface GroupRow extends MyGroup {
  /** Share of the group's tasks that are done (section 6.1) */
  progress: number
  activePhase: Phase | null
  myOpen: number
  nextMilestone: Milestone | null
}

export interface DashboardData {
  open: number
  overdue: number
  dueThisWeek: number
  doneThisWeek: number
  doneLastWeek: number
  statusSplit: Record<OpenStatus, number>
  /** My open tasks due on each of the next days, today first */
  workload: { day: string; count: number }[]
  /** My open tasks per due day (`yyyy-MM-dd`), for the calendar */
  deadlinesByDay: Map<string, Task[]>
  urgent: Task[]
  groups: GroupRow[]
  milestones: Milestone[]
}

interface DashboardInput {
  myGroups: MyGroup[]
  tasks: Task[]
  phases: Phase[]
  milestones: Milestone[]
  meId: string
  now: Date
  timeZone?: string
}

export function buildDashboard({
  myGroups,
  tasks,
  phases,
  milestones,
  meId,
  now,
  timeZone = env.defaultTimezone,
}: DashboardInput): DashboardData {
  const groupIds = new Set(myGroups.map(({ group }) => group.id))
  const dayOf = (iso: string) => toDateInputValue(iso, timeZone)
  const today = dayOf(now.toISOString())
  const dayAfter = (days: number) => dayOf(addDays(now, days).toISOString())

  const groupTasks = tasks.filter((task) => groupIds.has(task.groupId) && !task.parentTaskId)
  const mine = groupTasks.filter((task) => task.assigneeId === meId)
  const open = mine.filter((task) => !isTaskClosed(task)).sort(byDueDate)
  const doneWithin = (fromDays: number, toDays: number) =>
    mine.filter((task) => {
      if (task.status !== 'done' || !task.completedAt) return false
      const age = (now.getTime() - new Date(task.completedAt).getTime()) / DAY_MS
      return age >= fromDays && age < toDays
    }).length

  const deadlinesByDay = new Map<string, Task[]>()
  for (const task of open) {
    if (!task.dueAt) continue
    const key = dayOf(task.dueAt)
    deadlinesByDay.set(key, [...(deadlinesByDay.get(key) ?? []), task])
  }
  const urgentLimit = dayAfter(URGENT_DAYS)
  const upcoming = milestones
    .filter((item) => groupIds.has(item.groupId) && new Date(item.dueAt) >= now)
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))

  return {
    open: open.length,
    overdue: open.filter((task) => isTaskOverdue(task, now)).length,
    dueThisWeek: open.filter((task) => task.dueAt && dayOf(task.dueAt) >= today && dayOf(task.dueAt) <= dayAfter(6))
      .length,
    doneThisWeek: doneWithin(0, 7),
    doneLastWeek: doneWithin(7, 14),
    statusSplit: {
      todo: open.filter((task) => task.status === 'todo').length,
      in_progress: open.filter((task) => task.status === 'in_progress').length,
      in_review: open.filter((task) => task.status === 'in_review').length,
    },
    workload: Array.from({ length: WORKLOAD_DAYS }, (_, index) => {
      const day = dayAfter(index)
      return { day, count: deadlinesByDay.get(day)?.length ?? 0 }
    }),
    deadlinesByDay,
    urgent: open.filter((task) => task.dueAt && (isTaskOverdue(task, now) || dayOf(task.dueAt) <= urgentLimit)),
    groups: myGroups.map((entry) => {
      const own = groupTasks.filter((task) => task.groupId === entry.group.id)
      return {
        ...entry,
        progress: progressOf(own).ratio,
        activePhase:
          phases
            .filter((phase) => phase.groupId === entry.group.id && phase.status === 'active')
            .sort(byPosition)[0] ?? null,
        myOpen: open.filter((task) => task.groupId === entry.group.id).length,
        nextMilestone: upcoming.find((item) => item.groupId === entry.group.id) ?? null,
      }
    }),
    milestones: upcoming.slice(0, MILESTONE_LIMIT),
  }
}

/** Overdue and soonest first; tasks without a deadline last */
function byDueDate(a: Task, b: Task): number {
  if (a.dueAt === b.dueAt) return a.code - b.code
  if (!a.dueAt) return 1
  if (!b.dueAt) return -1
  return a.dueAt.localeCompare(b.dueAt)
}
