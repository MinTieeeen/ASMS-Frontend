/**
 * @file Month calendar of deadlines (F05.08 calendar view, personal calendar): a 7-column grid from 768 px, an
 *   agenda list below it.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import {
  addDays,
  addMonths,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { env } from '@/config/env'
import { useIsMobile } from '@/hooks'
import { cn } from '@/lib/utils'
import { formatDate } from '@/utils/date'

export interface CalendarEvent {
  id: string
  /** ISO instant; placed on its day in the user time zone (BR13) */
  at: string
  title: string
  kind: 'task' | 'milestone'
  href: string
  isLate?: boolean
  isDone?: boolean
}

interface MonthCalendarProps {
  month: Date
  events: CalendarEvent[]
  onMonthChange: (month: Date) => void
  
}

const DAY_KEY = 'yyyy-MM-dd'
const MAX_PER_DAY = 3
const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

export function MonthCalendar({ month, events, onMonthChange }: MonthCalendarProps) {
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const first = startOfMonth(month)
  const gridStart = startOfWeek(first, { weekStartsOn: 1 })
  const days = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index))
  const byDay = new Map<string, CalendarEvent[]>()
  for (const event of events) {
    const key = formatInTimeZone(event.at, env.defaultTimezone, DAY_KEY)
    byDay.set(key, [...(byDay.get(key) ?? []), event])
  }
  const monthEvents = events
    .filter((event) => isSameMonth(new Date(event.at), first))
    .sort((a, b) => a.at.localeCompare(b.at))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-semibold">
          {t('calendar.monthTitle', { month: first.getMonth() + 1, year: first.getFullYear() })}
        </h2>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => onMonthChange(new Date())}>
            {t('calendar.today')}
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label={t('calendar.previous')} onClick={() => onMonthChange(addMonths(first, -1))}>
            <ChevronLeft aria-hidden />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label={t('calendar.next')} onClick={() => onMonthChange(addMonths(first, 1))}>
            <ChevronRight aria-hidden />
          </Button>
        </div>
      </div>

      {isMobile ? (
        <ul className="flex flex-col divide-y rounded-xl border bg-card">
          {monthEvents.length === 0 && (
            <li className="p-6 text-center text-sm text-muted-foreground">{t('calendar.empty')}</li>
          )}
          {monthEvents.map((event) => (
            <li key={event.id} className="flex items-center gap-3 px-3 py-2.5">
              <span className="w-20 shrink-0 text-xs text-muted-foreground">{formatDate(event.at)}</span>
              <EventLink event={event} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="grid grid-cols-7 border-b bg-muted/50">
            {WEEKDAYS.map((day) => (
              <div key={day} className="px-2 py-2 text-xs font-semibold text-muted-foreground">
                {t(`calendar.weekday.${day}`)}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const dayEvents = byDay.get(format(day, DAY_KEY)) ?? []
              const rest = dayEvents.length - MAX_PER_DAY
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'flex min-h-28 flex-col gap-1 border-r border-b p-1.5 nth-[7n]:border-r-0',
                    !isSameMonth(day, first) && 'bg-muted/30 text-muted-foreground',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-6 items-center justify-center self-end rounded-full text-xs',
                      isToday(day) && 'bg-primary font-semibold text-primary-foreground',
                    )}
                  >
                    {day.getDate()}
                  </span>
                  {dayEvents.slice(0, MAX_PER_DAY).map((event) => (
                    <EventLink key={event.id} event={event} />
                  ))}
                  {rest > 0 && (
                    <span className="px-1 text-[11px] text-muted-foreground">
                      {t('calendar.more', { count: rest })}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function EventLink({ event }: { event: CalendarEvent }) {
  const { t } = useTranslation()
  const isMilestone = event.kind === 'milestone'
  return (
    <Link
      to={event.href}
      className={cn(
        'flex min-w-0 items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11px] leading-4 font-medium outline-none focus-visible:shadow-focus',
        isMilestone
          ? 'bg-highlight-soft text-highlight-text'
          : event.isLate
            ? 'bg-destructive-soft text-destructive-text'
            : 'bg-accent text-accent-foreground',
        event.isDone && 'line-through opacity-70',
      )}
    >
      {isMilestone && <Flag className="size-3 shrink-0" aria-label={t('calendar.milestone')} />}
      <span className="truncate">{event.title}</span>
    </Link>
  )
}
