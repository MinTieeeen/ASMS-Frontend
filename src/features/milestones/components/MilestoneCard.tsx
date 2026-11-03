/**
 * @file One milestone in the milestones tab: a date tile, name, status, weight, due time, the primary version or
 *   "nothing submitted", the score once graded, and the management menu.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { enUS, vi } from 'date-fns/locale'
import { formatInTimeZone } from 'date-fns-tz'
import { FileText, Link2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { DueDate, MilestoneStatusBadge } from '@/components/common'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { env } from '@/config/env'
import { ROUTES } from '@/config/routes'
import { cn } from '@/lib/utils'
import type { Deliverable, Milestone } from '@/mocks'

import { MilestoneActions } from './MilestoneActions'

interface MilestoneCardProps {
  milestone: Milestone
  /** Newest first */
  versions: Deliverable[]
  canManage: boolean
}

export function MilestoneCard({ milestone, versions, canManage }: MilestoneCardProps) {
  const { t, i18n } = useTranslation('milestones')
  const primary = versions.find((item) => item.isPrimary)
  const isOpen = milestone.status === 'open'
  const locale = i18n.language === 'en' ? enUS : vi

  return (
    <Card className={cn('flex-row items-start gap-4 p-4', isOpen && 'border-l-4 border-l-highlight')}>
      <span className="flex size-14 shrink-0 flex-col items-center justify-center rounded-lg border bg-muted/50">
        <span className="text-xl leading-6 font-semibold">{formatInTimeZone(milestone.dueAt, env.defaultTimezone, 'd')}</span>
        <span className="text-[10px] text-muted-foreground uppercase">
          {formatInTimeZone(milestone.dueAt, env.defaultTimezone, 'MMM', { locale })}
        </span>
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={ROUTES.groupMilestoneDetail(milestone.groupId, milestone.id)}
            className="rounded-sm font-semibold outline-none hover:underline focus-visible:shadow-focus"
          >
            {milestone.name}
          </Link>
          <MilestoneStatusBadge status={milestone.status} />
          {milestone.weight !== null && <Badge variant="outline">{t('card.weight', { weight: milestone.weight })}</Badge>}
        </div>
        <DueDate dueAt={milestone.dueAt} isClosed={!isOpen} withTime />
        {milestone.description && <p className="line-clamp-2 text-sm text-muted-foreground">{milestone.description}</p>}
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
          {primary ? (
            <span className="inline-flex min-w-0 items-center gap-1.5">
              {primary.kind === 'file' ? (
                <FileText className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              ) : (
                <Link2 className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              )}
              <span className="font-medium">{t('card.primary', { version: primary.version })}</span>
              <span className="truncate text-muted-foreground">{primary.fileName ?? primary.url}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{t('card.noDeliverable')}</span>
          )}
          {versions.length > 1 && <span className="text-muted-foreground">· {t('card.versions', { count: versions.length })}</span>}
          {milestone.status === 'graded' && milestone.score !== null && (
            <span className="font-semibold text-primary">{t('card.score', { score: milestone.score })}</span>
          )}
        </p>
      </div>
      {canManage && <MilestoneActions milestone={milestone} />}
    </Card>
  )
}
