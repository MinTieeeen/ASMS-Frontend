/**
 * @file Derived numbers of the group workflow (requirement section 6.1) computed from mock records. Pure functions,
 *   reusable once the data comes from the API.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { DUE_SOON_HOURS } from '@/config/constants'
import { isOverdue } from '@/utils/date'

import type { Phase, ReviewRound, Task, TaskStatus } from './types'

const CLOSED: ReadonlySet<TaskStatus> = new Set(['done', 'cancelled'])

export function isTaskClosed(task: Pick<Task, 'status'>): boolean {
  return CLOSED.has(task.status)
}

/** BR06 */
export function isTaskOverdue(task: Pick<Task, 'status' | 'dueAt'>, now = new Date()): boolean {
  return isOverdue(task.dueAt, isTaskClosed(task), now)
}

/** Deadline within the next 24 hours: the design system's "highlight" */
export function isDueSoon(dueAt: string | null, isClosed: boolean, now = new Date()): boolean {
  if (!dueAt || isClosed) return false
  const left = new Date(dueAt).getTime() - now.getTime()
  return left >= 0 && left <= DUE_SOON_HOURS * 3_600_000
}

export interface Progress {
  done: number
  total: number
  /** 0-1 */
  ratio: number
}

/** 6.1: done tasks / tasks not cancelled, top-level tasks only */
export function progressOf(tasks: Task[]): Progress {
  const counted = tasks.filter((item) => item.status !== 'cancelled' && !item.parentTaskId)
  const done = counted.filter((item) => item.status === 'done').length
  return { done, total: counted.length, ratio: counted.length ? done / counted.length : 0 }
}

/** 6.1 option: progress weighted by estimated hours */
export function hoursProgressOf(tasks: Task[]): Progress {
  const counted = tasks.filter((item) => item.status !== 'cancelled' && !item.parentTaskId)
  const total = counted.reduce((sum, item) => sum + (item.estimateHours ?? 0), 0)
  const done = counted
    .filter((item) => item.status === 'done')
    .reduce((sum, item) => sum + (item.estimateHours ?? 0), 0)
  return { done, total, ratio: total ? done / total : 0 }
}

export function countByStatus(tasks: Task[]): Record<TaskStatus, number> {
  const counts: Record<TaskStatus, number> = {
    todo: 0,
    in_progress: 0,
    in_review: 0,
    done: 0,
    cancelled: 0,
  }
  for (const item of tasks) if (!item.parentTaskId) counts[item.status] += 1
  return counts
}

export interface MemberContribution {
  userId: string
  doneCount: number
  openCount: number
  doneHours: number
  /** 6.1: done on time / done with a due date; null when nothing is measurable */
  onTimeRate: number | null
  /** Average of the last closed peer review round, null when not published */
  peerScore: number | null
}

/** F07.04: separate indicators, never merged into one score (6.1) */
export function contributionOf(
  userId: string,
  tasks: Task[],
  rounds: ReviewRound[],
): MemberContribution {
  const mine = tasks.filter((item) => item.assigneeId === userId && !item.parentTaskId)
  const done = mine.filter((item) => item.status === 'done')
  const measurable = done.filter((item) => item.dueAt && item.completedAt)
  const onTime = measurable.filter(
    (item) => new Date(item.completedAt ?? 0) <= new Date(item.dueAt ?? 0),
  )
  const lastClosed = rounds.find((item) => item.status === 'closed')
  const result = lastClosed?.results?.find((item) => item.userId === userId)
  const scores = result ? Object.values(result.scores) : []
  return {
    userId,
    doneCount: done.length,
    openCount: mine.filter((item) => !isTaskClosed(item)).length,
    doneHours: done.reduce((sum, item) => sum + (item.estimateHours ?? 0), 0),
    onTimeRate: measurable.length ? onTime.length / measurable.length : null,
    peerScore: scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : null,
  }
}

/** UC06-2a: phases whose dates overlap the given range */
export function overlappingPhases(
  phases: Phase[],
  startDate: string,
  endDate: string,
  ignoreId?: string,
): Phase[] {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  return phases.filter(
    (item) =>
      item.id !== ignoreId &&
      new Date(item.startDate).getTime() <= end &&
      new Date(item.endDate).getTime() >= start,
  )
}

export function byPosition<T extends { position: number }>(a: T, b: T): number {
  return a.position - b.position
}
