import type { Group, Milestone, MyGroup, Phase, Task } from '@/mocks'

import { buildDashboard, WORKLOAD_DAYS } from './dashboard-data'

const TZ = 'Asia/Ho_Chi_Minh'
// 03/11/2026 12:00 in Vietnam
const NOW = new Date('2026-11-03T05:00:00Z')
const ME = 'me'

const g1 = { id: 'g1', name: 'Nhóm 1' } as Group
const g2 = { id: 'g2', name: 'Nhóm 2' } as Group
const myGroups: MyGroup[] = [
  { group: g1, role: 'leader', memberCount: 3 },
  { group: g2, role: 'member', memberCount: 4 },
]

/** 23:59 in Vietnam, `days` after 03/11 */
const dueIn = (days: number) => new Date(Date.UTC(2026, 10, 3 + days, 16, 59)).toISOString()

function taskOf(code: number, patch: Partial<Task>): Task {
  return {
    id: `t${code}`,
    code,
    groupId: 'g1',
    assigneeId: ME,
    status: 'todo',
    dueAt: null,
    completedAt: null,
    parentTaskId: null,
    ...patch,
  } as Task
}

const tasks = [
  taskOf(1, { dueAt: dueIn(-2), status: 'in_progress' }),
  taskOf(2, { dueAt: dueIn(0), status: 'in_review' }),
  taskOf(3, { dueAt: dueIn(2) }),
  taskOf(4, { dueAt: dueIn(10), groupId: 'g2' }),
  taskOf(5, {}),
  taskOf(6, { status: 'done', completedAt: '2026-11-01T05:00:00Z' }),
  taskOf(7, { status: 'done', completedAt: '2026-10-25T05:00:00Z' }),
  taskOf(8, { assigneeId: 'other', dueAt: dueIn(1) }),
  taskOf(9, { groupId: 'g9', dueAt: dueIn(1) }),
]

const data = buildDashboard({
  myGroups,
  tasks,
  phases: [{ id: 'p1', groupId: 'g1', status: 'active', position: 1 } as Phase],
  milestones: [
    { id: 'm1', groupId: 'g1', dueAt: dueIn(5) },
    { id: 'm0', groupId: 'g1', dueAt: dueIn(-1) },
  ] as Milestone[],
  meId: ME,
  now: NOW,
  timeZone: TZ,
})

describe('buildDashboard (UC11)', () => {
  it('counts only my tasks in my groups', () => {
    expect(data.open).toBe(5)
    expect(data.overdue).toBe(1)
    expect(data.dueThisWeek).toBe(2)
    expect(data.statusSplit).toEqual({ todo: 3, in_progress: 1, in_review: 1 })
  })

  it('compares tasks done in the last 7 days with the 7 days before', () => {
    expect(data.doneThisWeek).toBe(1)
    expect(data.doneLastWeek).toBe(1)
  })

  it('counts deadlines per day from today, in the user time zone', () => {
    expect(data.workload).toHaveLength(WORKLOAD_DAYS)
    expect(data.workload[0]).toEqual({ day: '2026-11-03', count: 1 })
    expect(data.workload[2]).toEqual({ day: '2026-11-05', count: 1 })
    expect(data.deadlinesByDay.get('2026-11-01')?.map((task) => task.code)).toEqual([1])
  })

  it('lists overdue tasks and those due within 3 days, soonest first', () => {
    expect(data.urgent.map((task) => task.code)).toEqual([1, 2, 3])
  })

  it('summarises each group and keeps only upcoming milestones', () => {
    expect(data.groups[0]).toMatchObject({ myOpen: 4, activePhase: { id: 'p1' }, nextMilestone: { id: 'm1' } })
    expect(data.groups[1]).toMatchObject({ myOpen: 1, activePhase: null, nextMilestone: null })
    expect(data.milestones.map((item) => item.id)).toEqual(['m1'])
  })
})
