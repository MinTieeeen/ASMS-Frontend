/**
 * @file Sidebar of the app shell: navigation grouped by role, "Settings" and "Collapse" at the bottom
 *   (design "LAYOUT · Bố cục chung", markers 1, 6, 9).
 * @author MinhTien
 * @version 2.0.0
 * @since 2026-09-26
 * @modified 2026-10-04
 */

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, matchPath, useLocation, useMatch } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { selectIsAdmin, useAuthStore } from '@/stores/auth.store'

import { NAV_GROUPS, type NavItem, SETTINGS_NAV_ITEM } from './nav-items'

interface AppSidebarProps {
  /** Rail of 72 px: icons only, labels in tooltips */
  isRail?: boolean
  /** Called after a link is followed, e.g. to close the mobile drawer */
  onNavigate?: () => void
  /** Collapse / expand button; omitted in the mobile drawer */
  onToggleRail?: () => void
  /** Feature-owned navigation injected by the router, keeping layout independent of features */
  sidebarExtra?: (props: { isRail: boolean; onNavigate?: () => void }) => ReactNode
  className?: string
}

const ITEM_CLASS =
  'relative flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium outline-none focus-visible:shadow-focus'

export function AppSidebar({
  isRail = false,
  onNavigate,
  onToggleRail,
  sidebarExtra,
  className,
}: AppSidebarProps) {
  const { t } = useTranslation()
  const isAdmin = useAuthStore(selectIsAdmin)
  const groups = NAV_GROUPS.filter((group) => !group.adminOnly || isAdmin)

  return (
    <nav
      aria-label={t('nav.main')}
      className={cn(
        'flex h-full flex-col justify-between gap-4 overflow-y-auto bg-card px-3 pt-5 pb-4',
        className,
      )}
    >
      <div className="flex flex-col gap-5.5">
        {groups.map((group, index) => (
          <div key={group.labelKey} className="flex flex-col gap-0.5">
            {isRail ? (
              // Group labels do not fit the rail: a divider between groups instead
              index > 0 && <span className="mx-3 mb-1.5 h-px bg-border" aria-hidden />
            ) : (
              <p className="px-3 pb-1.5 text-[11px] leading-4 font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                {t(group.labelKey)}
              </p>
            )}
            {group.items.map((item) => (
              <SidebarItem key={item.to} item={item} isRail={isRail} onNavigate={onNavigate} />
            ))}
            {index === 0 && sidebarExtra?.({ isRail, onNavigate })}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-0.5 border-t pt-3">
        <SidebarItem item={SETTINGS_NAV_ITEM} isRail={isRail} onNavigate={onNavigate} />
        {onToggleRail && (
          <RailTooltip label={t('nav.expand')} isRail={isRail}>
            <Button
              type="button"
              variant="ghost"
              onClick={onToggleRail}
              aria-label={isRail ? t('nav.expand') : t('nav.collapse')}
              aria-expanded={!isRail}
              className={cn(
                'h-9 justify-start gap-3 px-3 font-medium text-muted-foreground',
                isRail && 'justify-center px-0',
              )}
            >
              {isRail ? (
                <PanelLeftOpen className="size-4.5" aria-hidden />
              ) : (
                <PanelLeftClose className="size-4.5" aria-hidden />
              )}
              {!isRail && t('nav.collapse')}
            </Button>
          </RailTooltip>
        )}
      </div>
    </nav>
  )
}

interface SidebarItemProps {
  item: NavItem
  isRail: boolean
  onNavigate?: () => void
}

function SidebarItem({ item, isRail, onNavigate }: SidebarItemProps) {
  const { t } = useTranslation()
  const { icon: Icon, comingSoon } = item
  const location = useLocation()
  const label = t(item.labelKey)
  const soon = t('nav.comingSoon')
  // Not NavLink: the rail tooltip (Radix Slot) merges className as a string, and NavLink's would be a function
  const isPrimaryMatch = useMatch({ path: item.to, end: item.end ?? false }) !== null
  const isActive =
    !comingSoon &&
    (isPrimaryMatch ||
      (item.activePaths?.some((path) => matchPath({ path, end: false }, location.pathname) !== null) ??
        false))

  if (comingSoon) {
    return (
      <RailTooltip label={`${label} · ${soon}`} isRail={isRail}>
        <span
          aria-disabled="true"
          className={cn(
            ITEM_CLASS,
            'cursor-default text-muted-foreground',
            isRail && 'justify-center px-0',
          )}
        >
          <Icon className="size-4.5 shrink-0" aria-hidden />
          {isRail ? (
            <span className="sr-only">{`${label} (${soon})`}</span>
          ) : (
            <>
              <span className="flex-1 truncate">{label}</span>
              <Badge variant="outline" className="h-4.5 px-1.5 text-[11px] text-muted-foreground">
                {soon}
              </Badge>
            </>
          )}
        </span>
      </RailTooltip>
    )
  }

  return (
    <RailTooltip label={label} isRail={isRail}>
      <Link
        to={item.to}
        onClick={onNavigate}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          ITEM_CLASS,
          isRail && 'justify-center px-0',
          isActive
            ? 'bg-accent font-semibold text-accent-foreground'
            : 'text-foreground hover:bg-muted',
        )}
      >
        {/* Only one selected item: accent background, bold label, 3 px primary bar on the left edge */}
        {isActive && (
          <span
            className="absolute inset-y-2 -left-3 w-0.75 rounded-r-[3px] bg-primary"
            aria-hidden
          />
        )}
        <Icon className="size-4.5 shrink-0" aria-hidden />
        <span className={isRail ? 'sr-only' : 'flex-1 truncate'}>{label}</span>
      </Link>
    </RailTooltip>
  )
}

/** On the rail every label lives in a tooltip on the right */
function RailTooltip({
  label,
  isRail,
  children,
}: {
  label: string
  isRail: boolean
  children: ReactNode
}) {
  if (!isRail) return children
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}
