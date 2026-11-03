/**
 * @file One phase in the phases tab: status, dates, goal, related milestone, progress or the numbers saved when it
 *   was closed, and the management menu (UC06, UC07).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { ArrowDown, ArrowUp, Ellipsis, Flag, Lock, LockOpen, Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { PhaseStatusBadge, ProgressMeter } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { type Phase, progressOf, type Task } from '@/mocks'
import { formatDate } from '@/utils/date'

export interface PhaseCardActions {
  onMove: (offset: -1 | 1) => void
  onEdit: () => void
  onClose: () => void
  onReopen: () => void
  onDelete: () => void
}

interface PhaseCardProps {
  phase: Phase
  /** Tasks of this phase */
  tasks: Task[]
  milestoneName: string | null
  isFirst: boolean
  isLast: boolean
  /** Leader and deputies (managePhases) */
  canManage: boolean
  /** Only the leader reopens a closed phase (UC07) */
  canReopen: boolean
  actions: PhaseCardActions
}

export function PhaseCard({ phase, tasks, milestoneName, isFirst, isLast, canManage, canReopen, actions }: PhaseCardProps) {
  const { t } = useTranslation('groups')
  const isClosed = phase.status === 'closed'
  const progress = progressOf(tasks)

  return (
    <Card className={cn(phase.status === 'active' && 'border-primary')}>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          {phase.name}
          <PhaseStatusBadge status={phase.status} />
        </CardTitle>
        <p className="text-[13px] text-muted-foreground">
          {formatDate(phase.startDate)} – {formatDate(phase.endDate)}
          {isClosed && phase.closedAt && ` · ${t('phases.closedAt', { date: formatDate(phase.closedAt) })}`}
        </p>
        {(canManage || canReopen) && (
          <CardAction className="flex items-center gap-0.5">
            {canManage && (
              <>
                <Button variant="ghost" size="icon-sm" disabled={isFirst} onClick={() => actions.onMove(-1)} aria-label={t('phases.moveUp', { name: phase.name })}>
                  <ArrowUp aria-hidden />
                </Button>
                <Button variant="ghost" size="icon-sm" disabled={isLast} onClick={() => actions.onMove(1)} aria-label={t('phases.moveDown', { name: phase.name })}>
                  <ArrowDown aria-hidden />
                </Button>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={t('phases.actionsFor', { name: phase.name })}>
                  <Ellipsis aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {canManage && !isClosed && (
                  <>
                    <DropdownMenuItem onSelect={actions.onEdit}>
                      <Pencil aria-hidden />
                      {t('phases.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={actions.onClose}>
                      <Lock aria-hidden />
                      {t('phases.close')}
                    </DropdownMenuItem>
                  </>
                )}
                {canReopen && isClosed && (
                  <DropdownMenuItem onSelect={actions.onReopen}>
                    <LockOpen aria-hidden />
                    {t('phases.reopen')}
                  </DropdownMenuItem>
                )}
                {canManage && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onSelect={actions.onDelete}>
                      <Trash2 aria-hidden />
                      {t('phases.delete')}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {phase.goal && <p className="text-sm">{phase.goal}</p>}
        {milestoneName && (
          <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <Flag className="size-3.5" aria-hidden />
            {t('phases.milestone', { name: milestoneName })}
          </p>
        )}
        {isClosed && phase.snapshot ? (
          <p className="text-[13px] text-muted-foreground">{t('phases.snapshot', { ...phase.snapshot })}</p>
        ) : (
          <ProgressMeter
            ratio={progress.ratio}
            label={t('phases.progress')}
            detail={`${progress.done}/${progress.total} · ${t('phases.taskCount', { count: progress.total })}`}
            size="sm"
          />
        )}
      </CardContent>
    </Card>
  )
}
