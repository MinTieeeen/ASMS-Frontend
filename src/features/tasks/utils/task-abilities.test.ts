import { canDo, type Group, type GroupRole, type Task } from '@/mocks'

import { taskAbilitiesOf } from './task-abilities'

const ME = 'me'

function workspaceOf(role: GroupRole, patch: Partial<Group> = {}) {
  const group = { status: 'active', reviewEnabled: true, ...patch } as Group
  return {
    group,
    role,
    isArchived: group.status === 'archived',
    can: (action: Parameters<typeof canDo>[2]) => canDo(role, group, action),
  }
}

function taskOf(patch: Partial<Task> = {}): Task {
  return { status: 'in_progress', assigneeId: ME, createdBy: 'other', ...patch } as Task
}

describe('taskAbilitiesOf', () => {
  it('lets the assignee submit for review but not mark Done while review is on (BR07)', () => {
    const { statuses } = taskAbilitiesOf(workspaceOf('member'), taskOf(), ME)
    expect(statuses).toEqual(['todo', 'in_progress', 'in_review'])
  })

  it('lets the assignee move straight to Done when the group has no review step (UC09)', () => {
    const { statuses } = taskAbilitiesOf(workspaceOf('member', { reviewEnabled: false }), taskOf(), ME)
    expect(statuses).toEqual(['todo', 'in_progress', 'done'])
  })

  it('gives a member no status change on a task assigned to someone else', () => {
    expect(taskAbilitiesOf(workspaceOf('member'), taskOf({ assigneeId: 'other' }), ME).statuses).toEqual([])
  })

  it('lets only a manager reopen a closed task', () => {
    const done = taskOf({ status: 'done' })
    expect(taskAbilitiesOf(workspaceOf('member'), done, ME).statuses).toEqual([])
    expect(taskAbilitiesOf(workspaceOf('deputy'), done, ME).statuses).toContain('in_progress')
  })

  it('lets a manager approve a task waiting for review', () => {
    expect(taskAbilitiesOf(workspaceOf('leader'), taskOf({ status: 'in_review' }), ME).canApprove).toBe(true)
    expect(taskAbilitiesOf(workspaceOf('member'), taskOf({ status: 'in_review' }), ME).canApprove).toBe(false)
  })

  it('makes every task read-only in an archived group (BR09)', () => {
    expect(taskAbilitiesOf(workspaceOf('leader', { status: 'archived' }), taskOf(), ME)).toEqual({
      canEdit: false,
      statuses: [],
      canApprove: false,
    })
  })
})
