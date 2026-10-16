/**
 * @file Card of one group in "My groups": subject and semester (UC02), my role, progress (6.1), next milestone and
 *   my open tasks, members and last activity.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { Archive, Flag, ListTodo } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import {
  AvatarStack,
  DueDate,
  GroupRoleBadge,
  ProgressMeter,
  RelativeTime,
} from '@/components/common'
import { Badge } from '@/components/ui/badge'
import { ROUTES } from '@/config/routes'
import { cn } from '@/lib/utils'

import type { GroupSummary } from '../hooks/useGroupSummaries'

export function GroupCard({ summary }: { summary: GroupSummary }) {
  const { t } = useTranslation('groups')
  const { t: tCommon } = useTranslation()
  const { group, role, progress, nextMilestone, myOpenTasks, people } = summary
  const isArchived = group.status === 'archived'

  return (
    <article
      className={cn(
        'group/card relative flex h-full flex-col gap-4 rounded-xl border bg-card p-4 shadow-xs transition-colors focus-within:border-primary hover:border-accent-border',
        isArchived && 'bg-muted/40',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          {group.subjectCode ? (
            <Badge variant="secondary" className="font-mono">
              {group.subjectCode}
            </Badge>
          ) : (
            <Badge variant="outline">{tCommon('domain.unclassified')}</Badge>
          )}
          {group.semester && <span className="truncate">{group.semester}</span>}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {isArchived && (
            <Badge variant="outline" className="text-muted-foreground">
              <Archive aria-hidden />
              {tCommon('domain.archived')}
            </Badge>
          )}
          <GroupRoleBadge role={role} />
        </div>
      </div>

      <div className="min-w-0">
        <h3 className="font-heading text-base leading-6 font-semibold">
          {/* The title link covers the whole card for the mouse; it is the only tab stop */}
          <Link
            to={ROUTES.groupDetail(group.id)}
            className="outline-none after:absolute after:inset-0 after:rounded-xl hover:underline focus-visible:underline"
          >
            {group.name}
          </Link>
        </h3>
        <p className="mt-0.5 line-clamp-2 text-[13px] text-muted-foreground">
          {group.topic || group.subjectName}
        </p>
      </div>

      <ProgressMeter
        ratio={progress.ratio}
        label={t('card.progress')}
        detail={t('card.progressDetail', { done: progress.done, total: progress.total })}
        size="sm"
      />

      <dl className="grid grid-cols-1 gap-2 text-[13px]">
        <div className="flex items-center justify-between gap-2">
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            <Flag className="size-3.5" aria-hidden />
            {t('card.nextMilestone')}
          </dt>
          <dd className="flex min-w-0 items-center gap-2">
            {nextMilestone ? (
              <>
                <span className="truncate">{nextMilestone.name}</span>
                <DueDate dueAt={nextMilestone.dueAt} />
              </>
            ) : (
              <span className="text-muted-foreground">{t('card.noMilestone')}</span>
            )}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            <ListTodo className="size-3.5" aria-hidden />
            {t('card.myOpenTasks')}
          </dt>
          <dd className="font-medium tabular-nums">{myOpenTasks}</dd>
        </div>
      </dl>

      <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3">
        <AvatarStack people={people} label={tCommon('domain.members', { count: people.length })} />
        <span className="text-xs text-muted-foreground">
          {t('card.activeAt')} <RelativeTime value={group.lastActivityAt} />
        </span>
      </div>
    </article>
  )
}
