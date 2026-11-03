/**
 * @file Next milestones across the student's groups, each with a date tile, its group and the time left.
 * @author MinhTien
 * @version 1.1.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { enUS, vi } from 'date-fns/locale'
import { formatInTimeZone } from 'date-fns-tz'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { DueDate } from '@/components/common'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { env } from '@/config/env'
import { ROUTES } from '@/config/routes'
import type { Milestone } from '@/mocks'

interface UpcomingMilestonesProps {
  milestones: Milestone[]
  groupNames: Map<string, string>
}

export function UpcomingMilestones({ milestones, groupNames }: UpcomingMilestonesProps) {
  const { t, i18n } = useTranslation('dashboard')
  const locale = i18n.language === 'en' ? enUS : vi

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t('milestones.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {milestones.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t('milestones.empty')}</p>
        ) : (
          <ol className="flex flex-col gap-3">
            {milestones.map((milestone) => (
              <li key={milestone.id} className="flex items-center gap-3">
                <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg border bg-highlight-soft text-highlight-text">
                  <span className="text-lg leading-5 font-semibold">
                    {formatInTimeZone(milestone.dueAt, env.defaultTimezone, 'd')}
                  </span>
                  <span className="text-[10px] uppercase">
                    {formatInTimeZone(milestone.dueAt, env.defaultTimezone, 'MMM', { locale })}
                  </span>
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <Link
                    to={ROUTES.groupMilestoneDetail(milestone.groupId, milestone.id)}
                    className="truncate rounded-sm text-sm font-medium outline-none hover:underline focus-visible:shadow-focus"
                  >
                    {milestone.name}
                  </Link>
                  <span className="truncate text-xs text-muted-foreground">{groupNames.get(milestone.groupId)}</span>
                  <DueDate dueAt={milestone.dueAt} withTime />
                </span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
