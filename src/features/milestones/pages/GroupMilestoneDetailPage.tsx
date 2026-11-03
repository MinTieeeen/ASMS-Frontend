/**
 * @file Milestone detail (UC10, F06.01-F06.03): due time, status, weight and related phases, the lecturer's
 *   requirements, every submitted version with the submit action, and the result.
 * @author MinhTien
 * @version 1.1.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { SearchX, Upload } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router'

import { DueDate, EmptyState, MilestoneStatusBadge } from '@/components/common'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/config/routes'
import { type GroupWorkspace, type Milestone, useGroupWorkspace, useMockStore } from '@/mocks'

import { DeliverableTable } from '../components/DeliverableTable'
import { MilestoneActions } from '../components/MilestoneActions'
import { MilestoneResult } from '../components/MilestoneResult'
import { SubmitDeliverableDialog } from '../components/SubmitDeliverableDialog'
import { storageUsedBy, versionsOf } from '../utils/milestone-stats'

export default function GroupMilestoneDetailPage() {
  const { t } = useTranslation('milestones')
  const workspace = useGroupWorkspace()
  const { milestoneId = '' } = useParams()
  const milestone = useMockStore((state) =>
    state.milestones.find((item) => item.id === milestoneId && item.groupId === workspace?.group.id),
  )
  if (!workspace) return null
  if (!milestone) {
    return (
      <EmptyState
        icon={SearchX}
        title={t('detail.notFound')}
        description={t('detail.notFoundHint')}
        action={
          <Button asChild variant="outline">
            <Link to={ROUTES.groupMilestones(workspace.group.id)}>{t('detail.back')}</Link>
          </Button>
        }
        className="mx-auto mt-8 max-w-md"
      />
    )
  }
  return <MilestoneDetail workspace={workspace} milestone={milestone} />
}

function MilestoneDetail({ workspace, milestone }: { workspace: GroupWorkspace; milestone: Milestone }) {
  const { t } = useTranslation('milestones')
  const navigate = useNavigate()
  const { group } = workspace
  const deliverables = useMockStore((state) => state.deliverables)
  const allMilestones = useMockStore((state) => state.milestones)
  const allPhases = useMockStore((state) => state.phases)
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)

  const versions = useMemo(() => versionsOf(deliverables, milestone.id), [deliverables, milestone.id])
  const storageUsed = useMemo(
    () => storageUsedBy(deliverables, new Set(allMilestones.filter((item) => item.groupId === group.id).map((item) => item.id))),
    [deliverables, allMilestones, group.id],
  )
  const phases = allPhases.filter((item) => item.milestoneId === milestone.id)
  const canManage = workspace.can('manageMilestones')
  const listPath = ROUTES.groupMilestones(group.id)

  return (
    <div className="flex flex-col gap-5">
      {/* The workspace breadcrumb already leads back to the milestone list */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-2">
            <h2 className="font-heading text-xl font-semibold">{milestone.name}</h2>
            <div className="flex flex-wrap items-center gap-2 text-[13px]">
              <MilestoneStatusBadge status={milestone.status} />
              {milestone.weight !== null && <Badge variant="outline">{t('card.weight', { weight: milestone.weight })}</Badge>}
              <span className="text-muted-foreground">{t('detail.due')}:</span>
              <DueDate dueAt={milestone.dueAt} isClosed={milestone.status !== 'open'} withTime />
            </div>
            {phases.length > 0 && (
              <p className="text-[13px] text-muted-foreground">
                {t('detail.phases')}:{' '}
                {phases.map((phase, index) => (
                  <span key={phase.id}>
                    {index > 0 && ', '}
                    <Link to={ROUTES.groupPhases(group.id)} className="font-medium text-foreground hover:underline">
                      {phase.name}
                    </Link>
                  </span>
                ))}
              </p>
            )}
          </div>
          {canManage && <MilestoneActions milestone={milestone} onDeleted={() => void navigate(listPath, { replace: true })} />}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>{t('deliverables.title')}</CardTitle>
              <CardDescription>{t('deliverables.description')}</CardDescription>
              {workspace.can('uploadDeliverable') && (
                <CardAction>
                  <Button size="sm" onClick={() => setIsSubmitOpen(true)}>
                    <Upload aria-hidden />
                    {t('deliverables.submit')}
                  </Button>
                </CardAction>
              )}
            </CardHeader>
            <CardContent>
              {versions.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">{t('deliverables.empty')}</p>
              ) : (
                <DeliverableTable versions={versions} canChoosePrimary={canManage} />
              )}
            </CardContent>
          </Card>
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>{t('detail.requirements')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-line">
                {milestone.description || <span className="text-muted-foreground">{t('detail.noRequirements')}</span>}
              </p>
            </CardContent>
          </Card>
          <MilestoneResult milestone={milestone} canRecord={workspace.can('recordResult')} />
        </div>
      </div>

      <SubmitDeliverableDialog
        milestone={milestone}
        storageUsed={storageUsed}
        nextVersion={(versions[0]?.version ?? 0) + 1}
        open={isSubmitOpen}
        onOpenChange={setIsSubmitOpen}
      />
    </div>
  )
}
