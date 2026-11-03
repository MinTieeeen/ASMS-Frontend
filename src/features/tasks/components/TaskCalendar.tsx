/**
 * @file Month calendar of the task list (F05.08 calendar view), built on the shadcn/ui Calendar: each day shows the
 *   tasks due that day and the group's milestones, like a month view of Google Calendar. An agenda list below 768 px.
 * @author MinhTien
 * @version 1.2.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { addMonths, format, isSameMonth } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import type { DayProps } from 'react-day-picker'
import { enUS, vi } from 'react-day-picker/locale'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { StatusDot } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { env } from '@/config/env'
import { ROUTES } from '@/config/routes'
import { useIsMobile } from '@/hooks'
import { cn } from '@/lib/utils'
import { isTaskClosed, isTaskOverdue, type Milestone, type Task } from '@/mocks'
import { formatDate } from '@/utils/date'

const DAY_KEY = 'yyyy-MM-dd'
const MAX_PER_DAY = 3

type CalendarItem = { kind: 'task'; at: string; task: Task } | { kind: 'milestone'; at: string; milestone: Milestone }

interface TaskCalendarProps {
  tasks: Task[]
  milestones: Milestone[]
  taskHref: (task: Task) => string
}

export function TaskCalendar({ tasks, milestones, taskHref }: TaskCalendarProps) {
  const { t, i18n } = useTranslation()
  const { t: tTasks } = useTranslation('tasks')
  const isMobile = useIsMobile()
  const [month, setMonth] = useState(() => new Date())

  const items: CalendarItem[] = [
    ...tasks.flatMap((task) => (task.dueAt ? [{ kind: 'task' as const, at: task.dueAt, task }] : [])),
    ...milestones.map((milestone) => ({ kind: 'milestone' as const, at: milestone.dueAt, milestone })),
  ].sort((a, b) => a.at.localeCompare(b.at))
  const byDay = new Map<string, CalendarItem[]>()
  for (const item of items) {
    const key = formatInTimeZone(item.at, env.defaultTimezone, DAY_KEY)
    byDay.set(key, [...(byDay.get(key) ?? []), item])
  }
  const withoutDueDate = tasks.filter((task) => !task.dueAt).length

  const renderItem = (item: CalendarItem) => (
    <CalendarItemChip key={item.kind === 'task' ? item.task.id : item.milestone.id} item={item} taskHref={taskHref} />
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-semibold">
          {t('calendar.monthTitle', { month: month.getMonth() + 1, year: month.getFullYear() })}
        </h2>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => setMonth(new Date())}>
            {t('calendar.today')}
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label={t('calendar.previous')} onClick={() => setMonth(addMonths(month, -1))}>
            <ChevronLeft aria-hidden />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label={t('calendar.next')} onClick={() => setMonth(addMonths(month, 1))}>
            <ChevronRight aria-hidden />
          </Button>
        </div>
      </div>

      {isMobile ? (
        <ul className="flex flex-col divide-y rounded-xl border bg-card">
          {items.filter((item) => isSameMonth(new Date(item.at), month)).map((item) => (
            <li key={item.kind === 'task' ? item.task.id : item.milestone.id} className="flex items-center gap-3 px-3 py-2.5">
              <span className="w-20 shrink-0 text-xs text-muted-foreground">{formatDate(item.at)}</span>
              {renderItem(item)}
            </li>
          ))}
        </ul>
      ) : (
        <Calendar
          month={month}
          onMonthChange={setMonth}
          locale={i18n.language === 'en' ? enUS : vi}
          weekStartsOn={1}
          fixedWeeks
          hideNavigation
          className="w-full bg-transparent p-0"
          classNames={{
            root: 'w-full',
            months: 'flex flex-col',
            month: 'flex w-full flex-col',
            month_caption: 'sr-only',
            month_grid: 'w-full table-fixed border-separate border-spacing-0 overflow-hidden rounded-xl border bg-card',
            weekdays: 'bg-muted/50',
            weekday: 'border-b px-2 py-2 text-left text-xs font-semibold text-muted-foreground',
            week: '',
            day: 'h-28 border-r border-b p-1.5 align-top [&:last-child]:border-r-0 [tr:last-child>&]:border-b-0',
            outside: 'bg-muted/30 text-muted-foreground',
            today: '',
          }}
          components={{
            Day: (props: DayProps) => (
              <CalendarDay {...props} items={byDay.get(format(props.day.date, DAY_KEY)) ?? []} renderItem={renderItem} />
            ),
          }}
        />
      )}
      {withoutDueDate > 0 && (
        <p className="text-xs text-muted-foreground">{tTasks('calendarView.noDueDate', { count: withoutDueDate })}</p>
      )}
    </div>
  )
}

interface CalendarDayProps extends DayProps {
  items: CalendarItem[]
  renderItem: (item: CalendarItem) => ReactNode
}

function CalendarDay({ day, modifiers, items, renderItem, children, className, ...props }: CalendarDayProps) {
  const { t } = useTranslation()
  const rest = items.length - MAX_PER_DAY
  return (
    <td className={className} {...props}>
      <div className="flex h-full min-w-0 flex-col gap-1">
        <span
          className={cn(
            'flex size-6 items-center justify-center self-end rounded-full text-xs',
            modifiers.today && 'bg-primary font-semibold text-primary-foreground',
          )}
        >
          {children ?? day.date.getDate()}
        </span>
        {items.slice(0, MAX_PER_DAY).map(renderItem)}
        {rest > 0 && <span className="px-1 text-[11px] text-muted-foreground">{t('calendar.more', { count: rest })}</span>}
      </div>
    </td>
  )
}

function CalendarItemChip({ item, taskHref }: { item: CalendarItem; taskHref: (task: Task) => string }) {
  const { t } = useTranslation()
  const chip = 'flex min-w-0 items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11px] leading-4 font-medium'

  if (item.kind === 'milestone') {
    return (
      <Link
        to={ROUTES.groupMilestoneDetail(item.milestone.groupId, item.milestone.id)}
        title={item.milestone.name}
        className={cn(chip, 'bg-highlight-soft text-highlight-text outline-none hover:brightness-95 focus-visible:shadow-focus')}
      >
        <Flag className="size-3 shrink-0" aria-label={t('calendar.milestone')} />
        <span className="truncate">{item.milestone.name}</span>
      </Link>
    )
  }
  const { task } = item
  return (
    <Link
      to={taskHref(task)}
      title={`#${task.code} ${task.title}`}
      className={cn(
        chip,
        'outline-none hover:brightness-95 focus-visible:shadow-focus',
        isTaskOverdue(task) ? 'bg-destructive-soft text-destructive-text' : 'bg-accent text-accent-foreground',
        isTaskClosed(task) && 'line-through opacity-70',
      )}
    >
      <StatusDot status={task.status} className="size-2" />
      <span className="sr-only">{t(`domain.taskStatus.${task.status}`)}</span>
      <span className="truncate">{task.title}</span>
    </Link>
  )
}
