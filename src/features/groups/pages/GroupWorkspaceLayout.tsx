/**
 * @file Group workspace template: header, read-only banner of an archived group (BR09) and tabs Overview | Tasks |
 *   Phases | Milestones | Members | Settings (reduced MVP scope).
 * @author MinhTien
 * @version 1.2.0
 * @since 2026-10-16
 * @modified 2026-11-03
 */

import { Archive, SearchX } from 'lucide-react'
import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, Outlet } from 'react-router'

import { EmptyState, LoadingScreen } from '@/components/common'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { type GroupTabKey, isGroupTabReady } from '@/config/group-tabs'
import { ROUTES } from '@/config/routes'
import { cn } from '@/lib/utils'
import { useGroupWorkspace, useMockStore } from '@/mocks'

import { GroupHeader } from '../components/GroupHeader'

// Progress, Peer review, Resources and Activity are out of the reduced MVP scope (moved to GĐ2)
const TABS: { key: GroupTabKey; to: (groupId: string) => string; end?: boolean }[] = [
  { key: 'overview', to: ROUTES.groupDetail, end: true },
  { key: 'tasks', to: ROUTES.groupTasks },
  { key: 'phases', to: ROUTES.groupPhases },
  { key: 'milestones', to: ROUTES.groupMilestones },
  { key: 'members', to: ROUTES.groupMembers },
  { key: 'settings', to: ROUTES.groupSettings },
]

const TAB_CLASS =
  'relative mr-5 flex items-center gap-1.5 px-0.5 py-2.5 text-sm whitespace-nowrap outline-none focus-visible:shadow-focus'

export default function GroupWorkspaceLayout() {
  const { t } = useTranslation('groups')
  const { t: tCommon } = useTranslation()
  const workspace = useGroupWorkspace()
  const joinRequests = useMockStore((state) => state.joinRequests)

  if (!workspace) {
    return (
      <EmptyState
        icon={SearchX}
        title={t('workspace.notFound')}
        description={t('workspace.notFoundHint')}
        action={
          <Button asChild variant="outline">
            <Link to={ROUTES.groups}>{t('join.backToGroups')}</Link>
          </Button>
        }
        className="mx-auto mt-10 max-w-md"
      />
    )
  }

  const { group } = workspace
  const pendingRequests = workspace.can('approveRequest')
    ? joinRequests.filter((item) => item.groupId === group.id).length
    : 0
  const counters: Partial<Record<GroupTabKey, number>> = { members: pendingRequests }

  return (
    <div className="flex flex-col gap-5">
      <GroupHeader workspace={workspace} />
      {workspace.isArchived && (
        <Alert>
          <Archive aria-hidden />
          <AlertTitle>{t('workspace.archivedTitle')}</AlertTitle>
          <AlertDescription>{t('workspace.archivedDescription')}</AlertDescription>
        </Alert>
      )}
      <nav aria-label={t('workspace.tabs')} className="-mx-1 flex overflow-x-auto border-b px-1">
        {TABS.map((tab) => {
          const count = counters[tab.key] ?? 0
          const content = (
            <>
              {t(`tab.${tab.key}`)}
              {count > 0 && (
                <span
                  className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-semibold text-destructive-foreground"
                  aria-label={t('workspace.needsAttention')}
                >
                  {count}
                </span>
              )}
            </>
          )
          return isGroupTabReady(tab.key) ? (
            <NavLink
              key={tab.key}
              to={tab.to(group.id)}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  TAB_CLASS,
                  isActive
                    ? 'font-semibold text-foreground shadow-[inset_0_-2px_0_var(--primary)]'
                    : 'font-medium text-muted-foreground hover:text-foreground',
                )
              }
            >
              {content}
            </NavLink>
          ) : (
            <span
              key={tab.key}
              aria-disabled="true"
              title={tCommon('nav.comingSoon')}
              className={cn(TAB_CLASS, 'cursor-default font-medium text-muted-foreground opacity-60')}
            >
              {content}
            </span>
          )
        })}
      </nav>
      <Suspense fallback={<LoadingScreen />}>
        <Outlet />
      </Suspense>
    </div>
  )
}
