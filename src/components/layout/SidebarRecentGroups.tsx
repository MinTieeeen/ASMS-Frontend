import { useTranslation } from 'react-i18next'
import { Link, useMatch } from 'react-router'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ROUTES } from '@/config/routes'
import { cn } from '@/lib/utils'

export interface SidebarRecentGroup {
  id: string
  name: string
  badgeCount: number
}

interface SidebarRecentGroupsProps {
  groups: SidebarRecentGroup[]
  isRail?: boolean
  onNavigate?: () => void
}

export function SidebarRecentGroups({
  groups,
  isRail = false,
  onNavigate,
}: SidebarRecentGroupsProps) {
  const { t } = useTranslation()

  return (
    <section aria-label={t('nav.recentGroups')} className="mt-2 flex flex-col gap-1">
      {isRail ? (
        <span className="mx-3 mb-1.5 h-px bg-border" aria-hidden />
      ) : (
        <h2 className="truncate px-3 pb-1.5 text-[11px] leading-4 font-semibold tracking-[0.06em] text-muted-foreground uppercase">
          {t('nav.recentGroups')}
        </h2>
      )}
      <ul className="flex flex-col gap-0.5">
        {groups.map((group, index) => (
          <RecentGroupItem
            key={group.id}
            group={group}
            index={index}
            isRail={isRail}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
      <Button
        asChild
        variant="link"
        size="sm"
        className={cn(
          'h-8 justify-start px-3 text-xs text-muted-foreground',
          isRail && 'sr-only',
        )}
      >
        <Link to={ROUTES.groups} onClick={onNavigate}>
          {t('nav.viewAllGroups')}
          <span aria-hidden> →</span>
        </Link>
      </Button>
    </section>
  )
}

function RecentGroupItem({
  group,
  index,
  isRail,
  onNavigate,
}: {
  group: SidebarRecentGroup
  index: number
  isRail: boolean
  onNavigate?: () => void
}) {
  const { t } = useTranslation()
  const isActive = useMatch({ path: ROUTES.groupDetail(group.id), end: false }) !== null
  const label =
    group.badgeCount > 0
      ? `${group.name}, ${group.badgeCount} ${t('nav.needsAttention')}`
      : group.name
  const initial = group.name.trim().charAt(0).toLocaleUpperCase() || '?'

  const link = (
    <Link
      to={ROUTES.groupDetail(group.id)}
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      aria-label={isRail ? label : undefined}
      className={cn(
        'relative flex h-9 items-center gap-2.5 rounded-md px-3 text-sm outline-none focus-visible:shadow-focus',
        isRail && 'justify-center px-0',
        isActive
          ? 'bg-accent font-semibold text-accent-foreground'
          : 'text-foreground hover:bg-muted',
      )}
    >
      <span
        className="flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
        style={{ backgroundColor: `var(--chart-${(index % 5) + 1})` }}
        aria-hidden
      >
        {initial}
      </span>
      <span className={cn('min-w-0 flex-1 truncate', isRail && 'sr-only')}>{group.name}</span>
      {group.badgeCount > 0 && (
        <span
          aria-label={t('nav.needsAttention')}
          className={cn(
            'flex min-w-4.5 items-center justify-center rounded-full bg-destructive px-1 text-[11px] leading-4 font-semibold text-destructive-foreground',
            isRail && 'absolute top-0.5 right-0.5 size-2 min-w-0 rounded-full p-0',
          )}
        >
          {!isRail && group.badgeCount}
        </span>
      )}
    </Link>
  )

  return isRail ? (
    <li>
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    </li>
  ) : (
    <li>{link}</li>
  )
}
