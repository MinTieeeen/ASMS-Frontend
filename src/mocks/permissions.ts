/**
 * @file Group permission matrix (requirement section 3.2) and task-level rules (BR05, BR07, BR09). UX only: the
 *   backend is the real guard (NFR07).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import type { Group, GroupRole, Task } from './types'

export type GroupAction =
  | 'editGroup'
  | 'editCharter'
  | 'invite'
  | 'approveRequest'
  | 'removeMember'
  | 'changeRole'
  | 'transferLeader'
  | 'archiveGroup'
  | 'managePhases'
  | 'createTask'
  | 'assignOthers'
  | 'editAnyTask'
  | 'approveTask'
  | 'manageMilestones'
  | 'recordResult'
  | 'uploadDeliverable'
  | 'postUpdate'
  | 'openReview'
  | 'export'

const MATRIX: Record<GroupRole, ReadonlySet<GroupAction>> = {
  leader: new Set<GroupAction>([
    'editGroup',
    'editCharter',
    'invite',
    'approveRequest',
    'removeMember',
    'changeRole',
    'transferLeader',
    'archiveGroup',
    'managePhases',
    'createTask',
    'assignOthers',
    'editAnyTask',
    'approveTask',
    'manageMilestones',
    'recordResult',
    'uploadDeliverable',
    'postUpdate',
    'openReview',
    'export',
  ]),
  deputy: new Set<GroupAction>([
    'invite',
    'approveRequest',
    'managePhases',
    'createTask',
    'assignOthers',
    'editAnyTask',
    'approveTask',
    'manageMilestones',
    'recordResult',
    'uploadDeliverable',
    'postUpdate',
    'export',
  ]),
  member: new Set<GroupAction>(['createTask', 'uploadDeliverable', 'postUpdate', 'export']),
}

/** BR09: an archived group is read-only; only reading and exporting stay available */
const READ_ONLY_ACTIONS: ReadonlySet<GroupAction> = new Set<GroupAction>(['export'])

export function canDo(role: GroupRole, group: Pick<Group, 'status'>, action: GroupAction): boolean {
  if (group.status === 'archived' && !READ_ONLY_ACTIONS.has(action)) return false
  return MATRIX[role].has(action)
}

/** 3.2: managers move any task; a member moves only the tasks they are responsible for */
export function canUpdateTaskStatus(role: GroupRole, task: Task, userId: string): boolean {
  return role !== 'member' || task.assigneeId === userId
}

/** 3.2: a member edits or deletes only a task they created that nobody has taken yet */
export function canEditTask(role: GroupRole, task: Task, userId: string): boolean {
  return role !== 'member' || (task.createdBy === userId && task.assigneeId === null)
}

/** BR07: with review on, only the leader or a deputy moves a task to Done */
export function canMarkDone(role: GroupRole, group: Pick<Group, 'reviewEnabled'>): boolean {
  return !group.reviewEnabled || role !== 'member'
}
