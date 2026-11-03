/**
 * @file Breadcrumb of the group workspace (shadcn/ui Breadcrumb): My groups › group › current tab › milestone,
 *   read from the URL so every tab gets it without passing anything.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import type { GroupTabKey } from '@/config/group-tabs'
import { ROUTES } from '@/config/routes'
import { type Group, useMockStore } from '@/mocks'

const TAB_PATHS: Record<string, Exclude<GroupTabKey, 'overview'>> = {
  tasks: 'tasks',
  phases: 'phases',
  milestones: 'milestones',
  members: 'members',
  settings: 'settings',
}

interface Crumb {
  label: string
  /** Absent on the current page */
  to?: string
}

export function GroupBreadcrumb({ group }: { group: Group }) {
  const { t } = useTranslation('groups')
  const { t: tCommon } = useTranslation()
  const { pathname } = useLocation()
  // /groups/:groupId/<tab>/<id>
  const [, , , tabPath, itemId] = pathname.split('/')
  const tab = tabPath ? TAB_PATHS[tabPath] : undefined
  const milestone = useMockStore((state) =>
    tab === 'milestones' && itemId ? state.milestones.find((item) => item.id === itemId) : undefined,
  )

  const crumbs: Crumb[] = [
    { label: tCommon('nav.groups'), to: ROUTES.groups },
    { label: group.name, to: tab ? ROUTES.groupDetail(group.id) : undefined },
  ]
  if (tab) crumbs.push({ label: t(`tab.${tab}`), to: milestone ? ROUTES.groupMilestones(group.id) : undefined })
  if (milestone) crumbs.push({ label: milestone.name })

  return (
    <Breadcrumb aria-label={t('workspace.breadcrumb')}>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => (
          <Fragment key={crumb.label}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem className="min-w-0">
              {crumb.to ? (
                <BreadcrumbLink asChild>
                  <Link to={crumb.to} className="max-w-56 truncate">
                    {crumb.label}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="max-w-72 truncate">{crumb.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
