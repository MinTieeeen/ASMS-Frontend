/**
 * @file Badges of the group workflow vocabulary: task status, priority, group role, phase and milestone status.
 *   Each badge shows text and an icon or dot, never color alone (accessibility rules).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import {
  ChevronDown,
  ChevronsUp,
  ChevronUp,
  Crown,
  Equal,
  type LucideIcon,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type {
  GroupRole,
  MilestoneStatus,
  PhaseStatus,
  TaskPriority,
  TaskStatus,
} from '@/mocks'

const STATUS_DOT: Record<TaskStatus, string> = {
  todo: 'bg-status-todo',
  in_progress: 'bg-status-doing',
  in_review: 'bg-status-review',
  done: 'bg-status-done',
  cancelled: 'bg-muted-foreground',
}

export function TaskStatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  const { t } = useTranslation()
  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5', status === 'cancelled' && 'text-muted-foreground line-through', className)}
    >
      <span className={cn('size-2 rounded-full', STATUS_DOT[status])} aria-hidden />
      {t(`domain.taskStatus.${status}`)}
    </Badge>
  )
}

/** Colored dot of a status, for column headers and charts */
export function StatusDot({ status, className }: { status: TaskStatus; className?: string }) {
  return <span className={cn('size-2.5 shrink-0 rounded-full', STATUS_DOT[status], className)} aria-hidden />
}

const PRIORITY: Record<TaskPriority, { icon: LucideIcon; className: string }> = {
  low: { icon: ChevronDown, className: 'text-muted-foreground' },
  medium: { icon: Equal, className: 'text-info' },
  high: { icon: ChevronUp, className: 'text-chart-4' },
  urgent: { icon: ChevronsUp, className: 'text-destructive-text' },
}

interface PriorityBadgeProps {
  priority: TaskPriority
  /** Icon only, the label stays for screen readers */
  isCompact?: boolean
  className?: string
}

export function PriorityBadge({ priority, isCompact = false, className }: PriorityBadgeProps) {
  const { t } = useTranslation()
  const { icon: Icon, className: tone } = PRIORITY[priority]
  const label = t(`domain.priority.${priority}`)
  return (
    <span
      className={cn('inline-flex items-center gap-1 text-xs font-medium', tone, className)}
      title={isCompact ? label : undefined}
    >
      <Icon className="size-3.5" aria-hidden />
      <span className={isCompact ? 'sr-only' : undefined}>{label}</span>
    </span>
  )
}

const ROLE_ICON: Record<GroupRole, LucideIcon> = {
  leader: Crown,
  deputy: ShieldCheck,
  member: UserRound,
}

export function GroupRoleBadge({ role, className }: { role: GroupRole; className?: string }) {
  const { t } = useTranslation()
  const Icon = ROLE_ICON[role]
  return (
    <Badge
      variant={role === 'member' ? 'secondary' : 'outline'}
      className={cn(
        role === 'leader' && 'border-accent-border bg-accent text-accent-foreground',
        role === 'deputy' && 'border-border bg-info-soft text-info',
        className,
      )}
    >
      <Icon aria-hidden />
      {t(`domain.groupRole.${role}`)}
    </Badge>
  )
}

const PHASE_TONE: Record<PhaseStatus, string> = {
  upcoming: 'bg-secondary text-secondary-foreground',
  active: 'border-accent-border bg-accent text-accent-foreground',
  closed: 'text-muted-foreground',
}

export function PhaseStatusBadge({ status }: { status: PhaseStatus }) {
  const { t } = useTranslation()
  return (
    <Badge variant="outline" className={PHASE_TONE[status]}>
      {t(`domain.phaseStatus.${status}`)}
    </Badge>
  )
}

const MILESTONE_TONE: Record<MilestoneStatus, string> = {
  open: 'bg-secondary text-secondary-foreground',
  submitted: 'bg-info-soft text-info',
  graded: 'border-accent-border bg-accent text-accent-foreground',
}

export function MilestoneStatusBadge({ status }: { status: MilestoneStatus }) {
  const { t } = useTranslation()
  return (
    <Badge variant="outline" className={MILESTONE_TONE[status]}>
      {t(`domain.milestoneStatus.${status}`)}
    </Badge>
  )
}
