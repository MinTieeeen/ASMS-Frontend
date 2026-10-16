/**
 * @file Phases of a group on a time axis with a "today" marker and each phase's progress (F07.01); a list on
 *   narrow screens.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { PhaseStatusBadge } from '@/components/common'
import { ROUTES } from '@/config/routes'
import { cn } from '@/lib/utils'
import { byPosition, type Phase, progressOf, type Task } from '@/mocks'
import { formatDate } from '@/utils/date'
import { formatPercent } from '@/utils/format'

const SEGMENT_TONE = {
  closed: 'border-border bg-muted text-muted-foreground',
  active: 'border-primary bg-accent text-accent-foreground',
  upcoming: 'border-dashed border-input bg-card text-foreground',
} as const

export function PhaseTimeline({ phases, tasks }: { phases: Phase[]; tasks: Task[] }) {
  const { t } = useTranslation('groups')
  const sorted = [...phases].sort(byPosition)
  if (sorted.length === 0) return <p className="text-sm text-muted-foreground">{t('overview.noPhases')}</p>

  const start = Math.min(...sorted.map((item) => new Date(item.startDate).getTime()))
  const end = Math.max(...sorted.map((item) => new Date(item.endDate).getTime()))
  const span = Math.max(1, end - start)
  const todayRatio = Math.min(1, Math.max(0, (Date.now() - start) / span))

  return (
    <div className="flex flex-col gap-3">
      <div className="relative hidden pt-6 md:block">
        <span
          className="absolute top-0 bottom-0 z-10 flex -translate-x-1/2 flex-col items-center"
          style={{ left: `${todayRatio * 100}%` }}
          aria-hidden
        >
          <span className="rounded-sm bg-highlight px-1.5 text-[11px] font-semibold text-highlight-foreground">
            {t('overview.today')}
          </span>
          <span className="w-0.5 flex-1 bg-highlight" />
        </span>
        <ol className="flex gap-1" aria-label={t('overview.phases')}>
          {sorted.map((phase) => {
            const width = (new Date(phase.endDate).getTime() - new Date(phase.startDate).getTime()) / span
            const progress = progressOf(tasks.filter((task) => task.phaseId === phase.id))
            return (
              <li key={phase.id} className="min-w-0" style={{ flexGrow: Math.max(width, 0.06), flexBasis: 0 }}>
                <Link
                  to={ROUTES.groupPhases(phase.groupId)}
                  className={cn(
                    'flex h-full flex-col gap-1 rounded-md border px-2.5 py-2 text-xs outline-none focus-visible:shadow-focus',
                    SEGMENT_TONE[phase.status],
                  )}
                >
                  <span className="truncate font-semibold">{phase.name}</span>
                  <span className="truncate opacity-80">
                    {formatDate(phase.startDate)} – {formatDate(phase.endDate)}
                  </span>
                  <span className="tabular-nums">{formatPercent(progress.ratio)}</span>
                </Link>
              </li>
            )
          })}
        </ol>
      </div>
      <ol className="flex flex-col gap-2 md:hidden">
        {sorted.map((phase) => (
          <li key={phase.id} className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
            <span className="min-w-0">
              <span className="block truncate font-medium">{phase.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatDate(phase.startDate)} – {formatDate(phase.endDate)}
              </span>
            </span>
            <PhaseStatusBadge status={phase.status} />
          </li>
        ))}
      </ol>
    </div>
  )
}
