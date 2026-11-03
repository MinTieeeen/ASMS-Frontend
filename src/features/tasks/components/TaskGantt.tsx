/**
 * @file Gantt chart of the task list (F05.11): a section per phase with the phase's own span, one bar per task
 *   colored by status, a "today" line; the task column stays put while the timeline scrolls sideways.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { parseISO } from 'date-fns'
import { GanttChart } from 'lucide-react'
import { type CSSProperties, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { EmptyState, StatusDot } from '@/components/common'
import { cn } from '@/lib/utils'
import { isTaskOverdue, type Phase, type Task, type TaskStatus } from '@/mocks'
import { toDateInputValue } from '@/utils/date'

import { buildGantt, type GanttSpan } from '../utils/gantt'

const DAY_WIDTH = 32
const NAME_COLUMN = 'sticky left-0 z-10 w-56 shrink-0 border-r bg-card px-3 sm:w-72'

const BAR_TONE: Record<TaskStatus, string> = {
  todo: 'bg-status-todo',
  in_progress: 'bg-status-doing',
  in_review: 'bg-status-review',
  done: 'bg-status-done',
  cancelled: 'bg-muted-foreground/40',
}

interface TaskGanttProps {
  phases: Phase[]
  tasks: Task[]
  taskHref: (taskId: string) => string
}

export function TaskGantt({ phases, tasks, taskHref }: TaskGanttProps) {
  const { t } = useTranslation('tasks')
  const layout = useMemo(() => buildGantt(phases, tasks), [phases, tasks])
  const [today] = useState(() => toDateInputValue(new Date().toISOString()))

  if (layout.sections.length === 0) return <EmptyState icon={GanttChart} title={t('gantt.empty')} />

  const { days } = layout
  const todayIndex = days.indexOf(today)
  const width = days.length * DAY_WIDTH
  const dayKeyAt = (index: number) => days[index] ?? ''
  const rangeOf = (span: GanttSpan) =>
    t('gantt.range', { start: shortDate(dayKeyAt(span.from)), end: shortDate(dayKeyAt(span.to)) })
  const gridStyle: CSSProperties = {
    width,
    backgroundImage: 'linear-gradient(to right, var(--border) 1px, transparent 1px)',
    backgroundSize: `${DAY_WIDTH}px 100%`,
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">{t('gantt.hint')}</p>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must take focus so keyboard users can scroll the timeline (WCAG 2.1.1) */}
      <div className="overflow-x-auto rounded-xl border bg-card" role="region" aria-label={t('gantt.label')} tabIndex={0}>
        <div className="relative w-max min-w-full">
          <div className="flex border-b bg-muted/50 text-xs">
            <div className={cn(NAME_COLUMN, 'flex items-end bg-muted py-2 font-semibold')}>{t('gantt.task')}</div>
            <div className="relative h-12" style={{ width }} aria-hidden>
              <TodayLine index={todayIndex} />
              {days.map((key, index) => {
                const date = parseISO(key)
                const isFirstOfMonth = index === 0 || date.getDate() === 1
                return (
                  <div key={key} className="absolute top-0 bottom-0 flex flex-col justify-end" style={{ left: index * DAY_WIDTH, width: DAY_WIDTH }}>
                    {isFirstOfMonth && (
                      <span className="absolute top-1.5 left-1 font-semibold whitespace-nowrap">
                        {date.getMonth() + 1}/{date.getFullYear()}
                      </span>
                    )}
                    <span className={cn('pb-1.5 text-center tabular-nums', index === todayIndex ? 'font-semibold text-primary' : 'text-muted-foreground')}>
                      {date.getDate()}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {layout.sections.map((section) => (
            <div key={section.phase?.id ?? 'none'} className="border-b last:border-b-0">
              <div className="flex bg-muted/30">
                <div className={cn(NAME_COLUMN, 'bg-muted py-2 text-[13px] font-semibold')}>
                  <span className="block truncate">{section.phase?.name ?? t('gantt.noPhase')}</span>
                  {section.span && <span className="sr-only">{rangeOf(section.span)}</span>}
                </div>
                <div className="relative h-9" style={gridStyle}>
                  <TodayLine index={todayIndex} />
                  {section.span && <Bar span={section.span} className="top-3 h-3 bg-foreground/15" />}
                </div>
              </div>
              {section.rows.map(({ task, span }) => (
                <div key={task.id} className="flex">
                  <div className={cn(NAME_COLUMN, 'flex items-center gap-2 py-1.5')}>
                    <StatusDot status={task.status} className="size-2" />
                    <Link
                      to={taskHref(task.id)}
                      className={cn('min-w-0 truncate rounded-sm text-[13px] outline-none hover:underline focus-visible:shadow-focus', task.status === 'cancelled' && 'line-through')}
                    >
                      <span className="font-mono text-xs text-muted-foreground">#{task.code}</span> {task.title}
                      <span className="sr-only">, {rangeOf(span)}</span>
                    </Link>
                  </div>
                  <div className="relative h-9" style={gridStyle}>
                    <TodayLine index={todayIndex} />
                    <Bar
                      span={span}
                      title={`#${task.code} ${task.title}: ${rangeOf(span)}`}
                      className={cn('top-2 h-5', BAR_TONE[task.status], isTaskOverdue(task) && 'ring-2 ring-destructive ring-offset-1 ring-offset-card')}
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}

        </div>
      </div>
      {layout.withoutDueDate > 0 && (
        <p className="text-xs text-muted-foreground">{t('gantt.noDueDate', { count: layout.withoutDueDate })}</p>
      )}
    </div>
  )
}

/** Drawn in every row so the line runs down the whole chart whatever the width of the task column */
function TodayLine({ index }: { index: number }) {
  if (index < 0) return null
  return (
    <span
      className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-highlight"
      style={{ left: index * DAY_WIDTH + DAY_WIDTH / 2 - 1 }}
      aria-hidden
    />
  )
}

function Bar({ span, className, title }: { span: GanttSpan; className?: string; title?: string }) {
  return (
    <span
      className={cn('absolute rounded-full', className)}
      style={{ left: span.from * DAY_WIDTH + 2, width: (span.to - span.from + 1) * DAY_WIDTH - 4 }}
      title={title}
      aria-hidden
    />
  )
}

function shortDate(key: string): string {
  const date = parseISO(key)
  return `${date.getDate()}/${date.getMonth() + 1}`
}
