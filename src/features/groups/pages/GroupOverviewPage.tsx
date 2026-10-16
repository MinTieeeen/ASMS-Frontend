/**
 * @file Group dashboard (F07.01): progress, overdue and waiting-for-review counts, next milestone, phase timeline,
 *   status breakdown, tasks needing attention, member workload, recent activity and the charter reminder (F03.08).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { CircleCheckBig, Flag, Hourglass, ScrollText, TriangleAlert } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { DueDate, StatTile, TaskListItem } from '@/components/common'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/config/routes'
import {
  countByStatus,
  type GroupWorkspace,
  isTaskClosed,
  isTaskOverdue,
  ME_ID,
  progressOf,
  useGroupWorkspace,
  useMockStore,
  useUserMap,
} from '@/mocks'
import { formatPercent } from '@/utils/format'

import { ActivityItem } from '../components/ActivityItem'
import { MemberWorkload } from '../components/MemberWorkload'
import { PhaseTimeline } from '../components/PhaseTimeline'
import { StatusBreakdown } from '../components/StatusBreakdown'

const ATTENTION_DAYS = 3
const ATTENTION_LIMIT = 6

export default function GroupOverviewPage() {
  const workspace = useGroupWorkspace()
  return workspace ? <Overview workspace={workspace} /> : null
}

function Overview({ workspace }: { workspace: GroupWorkspace }) {
  const { t } = useTranslation('groups')
  const { group, members } = workspace
  const users = useUserMap()
  const allTasks = useMockStore((state) => state.tasks)
  const phases = useMockStore((state) => state.phases)
  const milestones = useMockStore((state) => state.milestones)
  const activities = useMockStore((state) => state.activities)
  const charter = useMockStore((state) => state.charters.find((item) => item.groupId === group.id))

  const tasks = useMemo(() => allTasks.filter((item) => item.groupId === group.id), [allTasks, group.id])
  const progress = progressOf(tasks)
  const overdue = tasks.filter((item) => isTaskOverdue(item) && !item.parentTaskId)
  const inReview = tasks.filter((item) => item.status === 'in_review')
  const nextMilestone = milestones
    .filter((item) => item.groupId === group.id && new Date(item.dueAt) >= new Date())
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))[0]
  const horizon = Date.now() + ATTENTION_DAYS * 86_400_000
  const attention = tasks
    .filter((item) => !item.parentTaskId && !isTaskClosed(item))
    .filter((item) => item.status === 'in_review' || (item.dueAt && new Date(item.dueAt).getTime() <= horizon))
    .sort((a, b) => (a.dueAt ?? '').localeCompare(b.dueAt ?? ''))
    .slice(0, ATTENTION_LIMIT)
  const recent = activities.filter((item) => item.groupId === group.id).slice(0, 6)
  const formerIds = new Set(workspace.formerMembers.map((item) => item.userId))
  const needsCharter = charter && charter.content.length > 0 && !charter.confirmedBy.includes(ME_ID)

  return (
    <div className="flex flex-col gap-5">
      {needsCharter && (
        <Alert className="border-highlight bg-highlight-soft text-highlight-text">
          <ScrollText aria-hidden />
          <AlertTitle>{t('overview.charterTitle', { version: charter.version })}</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center justify-between gap-2 text-highlight-text">
            {t('overview.charterDescription')}
            <Button asChild size="sm" variant="outline">
              <Link to={`${ROUTES.groupSettings(group.id)}#charter`}>{t('overview.charterOpen')}</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={CircleCheckBig} tone="success" value={formatPercent(progress.ratio)} label={t('overview.progress')} hint={<span className="text-muted-foreground">{t('overview.progressDetail', { done: progress.done, total: progress.total })}</span>} />
        <StatTile icon={TriangleAlert} tone={overdue.length ? 'danger' : 'default'} value={overdue.length} label={t('overview.overdue')} />
        <StatTile icon={Hourglass} tone={inReview.length ? 'attention' : 'default'} value={inReview.length} label={t('overview.inReview')} hint={inReview.length > 0 && workspace.can('approveTask') ? <Link className="font-medium text-primary hover:underline" to={`${ROUTES.groupTasks(group.id)}?status=in_review`}>{t('overview.reviewNow')}</Link> : undefined} />
        <StatTile icon={Flag} tone="info" value={nextMilestone ? <span className="text-base">{nextMilestone.name}</span> : '—'} label={t('overview.nextMilestone')} hint={nextMilestone ? <DueDate dueAt={nextMilestone.dueAt} withTime /> : undefined} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('overview.phases')}</CardTitle>
          <CardAction>
            <Button asChild variant="link" size="sm">
              <Link to={ROUTES.groupPhases(group.id)}>{t('overview.managePhases')}</Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <PhaseTimeline phases={phases.filter((item) => item.groupId === group.id)} tasks={tasks} />
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>{t('overview.attention')}</CardTitle>
              <CardAction>
                <Button asChild variant="link" size="sm">
                  <Link to={ROUTES.groupTasks(group.id)}>{t('overview.allTasks')}</Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              {attention.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">{t('overview.nothingUrgent')}</p>
              ) : (
                <ul className="divide-y">
                  {attention.map((task) => (
                    <li key={task.id}>
                      <TaskListItem task={task} assignee={task.assigneeId ? (users[task.assigneeId] ?? null) : null} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('overview.statusBreakdown')}</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusBreakdown counts={countByStatus(tasks)} />
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>{t('overview.workloadTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <MemberWorkload members={members} tasks={tasks} users={users} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('overview.recentActivity')}</CardTitle>
              <CardAction>
                <Button asChild variant="link" size="sm">
                  <Link to={ROUTES.groupActivity(group.id)}>{t('overview.allActivity')}</Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <ul className="-my-2.5 divide-y">
                {recent.map((item) => (
                  <li key={item.id}>
                    <ActivityItem activity={item} actor={users[item.actorId]} isFormer={formerIds.has(item.actorId)} />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
