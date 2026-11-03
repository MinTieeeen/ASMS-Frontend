/**
 * @file Small month calendar of the student's deadlines (shadcn/ui Calendar): days with open tasks due carry a dot,
 *   and the tasks of the selected day are listed below it.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { format, parseISO } from 'date-fns'
import { enUS as dateEnUS, vi as dateVi } from 'date-fns/locale'
import type { DayButtonProps } from 'react-day-picker'
import { enUS, vi } from 'react-day-picker/locale'
import { useTranslation } from 'react-i18next'

import { TaskListItem } from '@/components/common'
import { Calendar, CalendarDayButton } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Task } from '@/mocks'
import { formatDate } from '@/utils/date'

const DAY_KEY = 'yyyy-MM-dd'

interface DeadlineCalendarProps {
  deadlinesByDay: Map<string, Task[]>
  selectedDay: string
  onSelectDay: (day: string) => void
  groupNames: Map<string, string>
}

export function DeadlineCalendar({ deadlinesByDay, selectedDay, onSelectDay, groupNames }: DeadlineCalendarProps) {
  const { t, i18n } = useTranslation('dashboard')
  const isEnglish = i18n.language === 'en'
  const selected = parseISO(selectedDay)
  const dayTasks = deadlinesByDay.get(selectedDay) ?? []

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t('calendar.title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Calendar
          // Remount on another month so choosing a day from the chart also shows its month
          key={selectedDay.slice(0, 7)}
          mode="single"
          required
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => onSelectDay(format(date, DAY_KEY))}
          weekStartsOn={1}
          locale={isEnglish ? enUS : vi}
          modifiers={{ deadline: [...deadlinesByDay.keys()].map((day) => parseISO(day)) }}
          labels={{
            labelDayButton: (date, modifiers) =>
              `${format(date, 'PPPP', { locale: isEnglish ? dateEnUS : dateVi })}${modifiers.deadline ? `, ${t('calendar.hasDeadline')}` : ''}`,
          }}
          components={{ DayButton: DeadlineDayButton }}
          className="mx-auto p-0 [--cell-size:--spacing(9)]"
        />
        <section aria-labelledby="deadline-day" className="flex flex-col gap-1 border-t pt-3">
          <h3 id="deadline-day" className="text-sm font-semibold">
            {t('calendar.dayTitle', { date: formatDate(selected) })}
          </h3>
          {dayTasks.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">{t('calendar.empty')}</p>
          ) : (
            <ul className="divide-y">
              {dayTasks.map((task) => (
                <li key={task.id}>
                  <TaskListItem task={task} groupName={groupNames.get(task.groupId)} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </CardContent>
    </Card>
  )
}

/** The calendar's day button with a dot under days that have deadlines; the dot follows the text color */
function DeadlineDayButton({ children, ...props }: DayButtonProps) {
  return (
    <CalendarDayButton {...props}>
      {children}
      {props.modifiers.deadline && <span aria-hidden className="size-1 rounded-full bg-current opacity-100!" />}
    </CalendarDayButton>
  )
}
