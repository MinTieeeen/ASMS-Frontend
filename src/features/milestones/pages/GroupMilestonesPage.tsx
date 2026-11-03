/**
 * @file Milestones tab of the group workspace (M06, F06.01): milestones by due date with their submission state and
 *   score, a summary (submitted, graded, weighted score so far); leader and deputies add, edit and delete them.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { Award, CircleCheckBig, Flag, Plus, Upload } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { EmptyState, StatTile } from '@/components/common'
import { Button } from '@/components/ui/button'
import { type GroupWorkspace, useGroupWorkspace, useMockStore } from '@/mocks'

import { MilestoneCard } from '../components/MilestoneCard'
import { MilestoneFormDialog } from '../components/MilestoneFormDialog'
import { versionsOf, weightedScoreOf } from '../utils/milestone-stats'

export default function GroupMilestonesPage() {
  const workspace = useGroupWorkspace()
  return workspace ? <Milestones workspace={workspace} /> : null
}

function Milestones({ workspace }: { workspace: GroupWorkspace }) {
  const { t } = useTranslation('milestones')
  const { group } = workspace
  const allMilestones = useMockStore((state) => state.milestones)
  const deliverables = useMockStore((state) => state.deliverables)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const milestones = useMemo(
    () => allMilestones.filter((item) => item.groupId === group.id).sort((a, b) => a.dueAt.localeCompare(b.dueAt)),
    [allMilestones, group.id],
  )
  const canManage = workspace.can('manageMilestones')
  const weighted = weightedScoreOf(milestones)
  const submitted = milestones.filter((item) => deliverables.some((entry) => entry.milestoneId === item.id)).length
  const graded = milestones.filter((item) => item.status === 'graded').length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{t('list.count', { count: milestones.length })}</p>
        {canManage && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus aria-hidden />
            {t('list.add')}
          </Button>
        )}
      </div>

      {milestones.length === 0 ? (
        <EmptyState
          icon={Flag}
          title={t('list.empty')}
          description={canManage ? t('list.emptyHint') : t('list.emptyMember')}
          action={canManage ? <Button onClick={() => setIsCreateOpen(true)}>{t('list.add')}</Button> : undefined}
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatTile icon={Upload} tone="info" value={`${submitted}/${milestones.length}`} label={t('list.submitted')} />
            <StatTile icon={CircleCheckBig} tone="success" value={`${graded}/${milestones.length}`} label={t('list.graded')} />
            <StatTile
              icon={Award}
              tone="attention"
              value={weighted.score === null ? '—' : `${weighted.score.toFixed(2)}/10`}
              label={t('list.weightedScore')}
              hint={
                weighted.score === null ? undefined : (
                  <span className="text-muted-foreground">{t('list.weightedScoreHint', { weight: weighted.gradedWeight })}</span>
                )
              }
            />
          </div>
          <ol className="flex flex-col gap-3" aria-label={t('list.label')}>
            {milestones.map((milestone) => (
              <li key={milestone.id}>
                <MilestoneCard milestone={milestone} versions={versionsOf(deliverables, milestone.id)} canManage={canManage} />
              </li>
            ))}
          </ol>
        </>
      )}

      <MilestoneFormDialog groupId={group.id} milestone={null} open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  )
}
