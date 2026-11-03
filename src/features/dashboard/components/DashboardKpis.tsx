/**
 * @file Headline numbers of the personal dashboard: open, overdue, due within 7 days and done in the last 7 days
 *   compared with the 7 days before.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { CalendarClock, CircleCheckBig, ListChecks, Minus, TrendingDown, TrendingUp, TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { StatTile } from '@/components/common'
import { ROUTES } from '@/config/routes'

import type { DashboardData } from '../utils/dashboard-data'

type KpiData = Pick<DashboardData, 'open' | 'overdue' | 'dueThisWeek' | 'doneThisWeek' | 'doneLastWeek'>

export function DashboardKpis({ data }: { data: KpiData }) {
  const { t } = useTranslation('dashboard')
  const diff = data.doneThisWeek - data.doneLastWeek
  const TrendIcon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile icon={ListChecks} tone="info" value={data.open} label={t('kpi.open')} />
      <StatTile
        icon={TriangleAlert}
        tone={data.overdue > 0 ? 'danger' : 'default'}
        value={data.overdue}
        label={t('kpi.overdue')}
        hint={
          data.overdue > 0 ? (
            <Link to={`${ROUTES.tasks}?overdue=1`} className="font-medium text-primary hover:underline">
              {t('kpi.viewOverdue')}
            </Link>
          ) : undefined
        }
      />
      <StatTile icon={CalendarClock} tone="attention" value={data.dueThisWeek} label={t('kpi.dueThisWeek')} />
      <StatTile
        icon={CircleCheckBig}
        tone="success"
        value={data.doneThisWeek}
        label={t('kpi.doneThisWeek')}
        hint={
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <TrendIcon className="size-3.5" aria-hidden />
            {diff > 0 ? t('kpi.more', { count: diff }) : diff < 0 ? t('kpi.less', { count: -diff }) : t('kpi.same')}
          </span>
        }
      />
    </div>
  )
}
