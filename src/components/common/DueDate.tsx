/**
 * @file Deadline label: date in the user time zone, red with "Overdue" when late (BR06), highlighter yellow when due
 *   within 24 hours.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { AlarmClock, CalendarClock, CalendarX2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'
import { isDueSoon } from '@/mocks'
import { formatDate, formatDateTime, isOverdue } from '@/utils/date'

interface DueDateProps {
  dueAt: string | null
  /** Done or cancelled: never late */
  isClosed?: boolean
  /** Show the time as well (milestones have a real hour) */
  withTime?: boolean
  className?: string
}

export function DueDate({ dueAt, isClosed = false, withTime = false, className }: DueDateProps) {
  const { t } = useTranslation()
  if (!dueAt) {
    return <span className={cn('text-xs text-muted-foreground', className)}>{t('domain.noDueDate')}</span>
  }
  const isLate = isOverdue(dueAt, isClosed)
  const isSoon = isDueSoon(dueAt, isClosed)
  const Icon = isLate ? CalendarX2 : isSoon ? AlarmClock : CalendarClock
  const text = withTime ? formatDateTime(dueAt) : formatDate(dueAt)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm text-xs whitespace-nowrap',
        isLate && 'font-medium text-destructive-text',
        isSoon && 'bg-highlight-soft px-1 font-medium text-highlight-text',
        !isLate && !isSoon && 'text-muted-foreground',
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {text}
      {isLate && <span>· {t('domain.overdue')}</span>}
      {isSoon && <span className="sr-only">({t('domain.dueSoon')})</span>}
    </span>
  )
}
