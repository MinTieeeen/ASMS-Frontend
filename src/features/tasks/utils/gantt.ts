/**
 * @file Layout of the task Gantt chart (F05.11): one section per phase, a bar per task from its start date to its due
 *   date. A task without a start date starts on the day it was created, or its phase's start if later. Days are
 *   counted in the user time zone (BR13).
 * @author MinhTien
 * @version 1.1.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns'

import { env } from '@/config/env'
import { byPosition, type Phase, type Task } from '@/mocks'
import { toDateInputValue } from '@/utils/date'

/** Empty days kept before the first and after the last bar */
const PADDING_DAYS = 2

/** Inclusive day indexes from the first day of the chart */
export interface GanttSpan {
  from: number
  to: number
}

export interface GanttSection {
  /** Null: tasks without a phase */
  phase: Phase | null
  span: GanttSpan | null
  rows: { task: Task; span: GanttSpan }[]
}

export interface GanttLayout {
  /** `yyyy-MM-dd` of every day on the chart */
  days: string[]
  sections: GanttSection[]
  /** Tasks left out because they have no due date */
  withoutDueDate: number
}

export function buildGantt(phases: Phase[], tasks: Task[], timeZone = env.defaultTimezone): GanttLayout {
  const dayOf = (iso: string) => toDateInputValue(iso, timeZone)
  const phaseById = new Map(phases.map((phase) => [phase.id, phase]))
  const dated = tasks.filter((task) => task.dueAt)

  const bars = dated.map((task) => {
    const end = dayOf(task.dueAt ?? '')
    const phase = task.phaseId ? phaseById.get(task.phaseId) : undefined
    const created = dayOf(task.createdAt)
    const fallback = phase && dayOf(phase.startDate) > created ? dayOf(phase.startDate) : created
    const start = task.startAt ? dayOf(task.startAt) : fallback
    return { task, start: start > end ? end : start, end }
  })
  const usedPhases = [...phases].sort(byPosition).filter((phase) => bars.some((bar) => bar.task.phaseId === phase.id))
  if (bars.length === 0) return { days: [], sections: [], withoutDueDate: tasks.length }

  const keys = [
    ...bars.flatMap((bar) => [bar.start, bar.end]),
    ...usedPhases.flatMap((phase) => [dayOf(phase.startDate), dayOf(phase.endDate)]),
  ].sort()
  const first = addDays(parseISO(keys[0] ?? ''), -PADDING_DAYS)
  const count = differenceInCalendarDays(parseISO(keys[keys.length - 1] ?? ''), first) + 1 + PADDING_DAYS
  const indexOf = (key: string) => differenceInCalendarDays(parseISO(key), first)
  const spanOf = (start: string, end: string) => ({ from: indexOf(start), to: indexOf(end) })

  const sectionOf = (phase: Phase | null): GanttSection => ({
    phase,
    span: phase ? spanOf(dayOf(phase.startDate), dayOf(phase.endDate)) : null,
    rows: bars
      .filter((bar) => (bar.task.phaseId ?? null) === (phase?.id ?? null))
      .sort((a, b) => a.start.localeCompare(b.start) || a.task.code - b.task.code)
      .map((bar) => ({ task: bar.task, span: spanOf(bar.start, bar.end) })),
  })
  const sections = [...usedPhases.map(sectionOf), sectionOf(null)].filter((section) => section.rows.length > 0)

  return {
    days: Array.from({ length: count }, (_, index) => format(addDays(first, index), 'yyyy-MM-dd')),
    sections,
    withoutDueDate: tasks.length - dated.length,
  }
}
