/**
 * @file Stacked bar of task counts per status, with a text legend so that values never rely on color alone.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { useTranslation } from 'react-i18next'

import { StatusDot } from '@/components/common'
import { cn } from '@/lib/utils'
import type { TaskStatus } from '@/mocks'

const ORDER: TaskStatus[] = ['done', 'in_review', 'in_progress', 'todo', 'cancelled']
const BAR: Record<TaskStatus, string> = {
  todo: 'bg-status-todo',
  in_progress: 'bg-status-doing',
  in_review: 'bg-status-review',
  done: 'bg-status-done',
  cancelled: 'bg-border',
}

export function StatusBreakdown({ counts }: { counts: Record<TaskStatus, number> }) {
  const { t } = useTranslation()
  const total = ORDER.reduce((sum, status) => sum + counts[status], 0)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-muted" aria-hidden>
        {ORDER.map((status) =>
          counts[status] > 0 ? (
            <span key={status} className={cn('h-full', BAR[status])} style={{ width: `${(counts[status] / Math.max(total, 1)) * 100}%` }} />
          ) : null,
        )}
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[13px] sm:grid-cols-3">
        {ORDER.map((status) => (
          <li key={status} className="flex items-center gap-2">
            <StatusDot status={status} />
            <span className="text-muted-foreground">{t(`domain.taskStatus.${status}`)}</span>
            <span className="ml-auto font-semibold tabular-nums">{counts[status]}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
