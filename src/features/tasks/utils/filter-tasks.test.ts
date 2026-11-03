import type { Task } from '@/mocks'

import type { TaskListState } from '../hooks/useTaskListParams'
import { filterTasks } from './filter-tasks'

const NOW = new Date('2026-11-03T05:00:00Z')

function taskOf(code: number, patch: Partial<Task> = {}): Task {
  return {
    id: `t${code}`,
    code,
    title: `Việc ${code}`,
    status: 'todo',
    assigneeId: null,
    phaseId: null,
    parentTaskId: null,
    dueAt: null,
    ...patch,
  } as Task
}

const ALL: TaskListState = { view: 'list', q: '', status: 'all', assignee: null, phase: null, group: null, overdueOnly: false }
const codes = (tasks: Task[]) => tasks.map((task) => task.code)

describe('filterTasks (F05.09)', () => {
  const tasks = [
    taskOf(1, { status: 'done', dueAt: '2026-11-01T16:59:00Z' }),
    taskOf(2, { dueAt: '2026-11-10T16:59:00Z', assigneeId: 'me', phaseId: 'p1' }),
    taskOf(3, { dueAt: '2026-11-01T16:59:00Z', title: 'Thiết kế CSDL' }),
    taskOf(4),
    taskOf(5, { parentTaskId: 't2' }),
  ]

  it('orders open tasks by due date, then tasks without a deadline, then closed ones; hides sub-tasks', () => {
    expect(codes(filterTasks(tasks, ALL, 'me', NOW))).toEqual([3, 2, 4, 1])
  })

  it('shows open tasks by default', () => {
    expect(codes(filterTasks(tasks, { ...ALL, status: 'open' }, 'me', NOW))).toEqual([3, 2, 4])
  })

  it('filters by assignee, phase and overdue', () => {
    expect(codes(filterTasks(tasks, { ...ALL, assignee: 'me' }, 'me', NOW))).toEqual([2])
    expect(codes(filterTasks(tasks, { ...ALL, assignee: 'none' }, 'me', NOW))).toEqual([3, 4, 1])
    expect(codes(filterTasks(tasks, { ...ALL, phase: 'none' }, 'me', NOW))).toEqual([3, 4, 1])
    expect(codes(filterTasks(tasks, { ...ALL, overdueOnly: true }, 'me', NOW))).toEqual([3])
  })

  it('searches the title and the code without accents', () => {
    expect(codes(filterTasks(tasks, { ...ALL, q: 'thiet ke' }, 'me', NOW))).toEqual([3])
    expect(codes(filterTasks(tasks, { ...ALL, q: '4' }, 'me', NOW))).toEqual([4])
  })
})
