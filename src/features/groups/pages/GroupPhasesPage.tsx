/**
 * @file Phases tab of the group workspace (M04): phases in order with progress; leader and deputies add, edit,
 *   reorder, close and delete them (F04.01-F04.03), the leader reopens a closed one (UC07).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { Milestone, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { EmptyState } from '@/components/common'
import { Button } from '@/components/ui/button'
import { byPosition, type GroupWorkspace, type Phase, useGroupWorkspace, useMockStore } from '@/mocks'

import { ClosePhaseDialog } from '../components/ClosePhaseDialog'
import { DeletePhaseDialog } from '../components/DeletePhaseDialog'
import { PhaseCard } from '../components/PhaseCard'
import { PhaseFormDialog } from '../components/PhaseFormDialog'

export default function GroupPhasesPage() {
  const workspace = useGroupWorkspace()
  return workspace ? <Phases workspace={workspace} /> : null
}

function Phases({ workspace }: { workspace: GroupWorkspace }) {
  const { t } = useTranslation('groups')
  const { group } = workspace
  const allPhases = useMockStore((state) => state.phases)
  const allTasks = useMockStore((state) => state.tasks)
  const milestones = useMockStore((state) => state.milestones)
  const movePhase = useMockStore((state) => state.movePhase)
  const reopenPhase = useMockStore((state) => state.reopenPhase)
  const [form, setForm] = useState<{ phase: Phase | null } | null>(null)
  const [closing, setClosing] = useState<Phase | null>(null)
  const [deleting, setDeleting] = useState<Phase | null>(null)

  const phases = useMemo(() => allPhases.filter((item) => item.groupId === group.id).sort(byPosition), [allPhases, group.id])
  const tasks = useMemo(() => allTasks.filter((item) => item.groupId === group.id), [allTasks, group.id])
  const canManage = workspace.can('managePhases')
  const canReopen = workspace.role === 'leader' && !workspace.isArchived

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{t('phases.count', { count: phases.length })}</p>
        {canManage && (
          <Button onClick={() => setForm({ phase: null })}>
            <Plus aria-hidden />
            {t('phases.add')}
          </Button>
        )}
      </div>

      {phases.length === 0 ? (
        <EmptyState
          icon={Milestone}
          title={t('phases.empty')}
          description={canManage ? t('phases.emptyHint') : t('phases.emptyMember')}
          action={canManage ? <Button onClick={() => setForm({ phase: null })}>{t('phases.add')}</Button> : undefined}
        />
      ) : (
        <ol className="flex flex-col gap-3" aria-label={t('phases.title')}>
          {phases.map((phase, index) => (
            <li key={phase.id}>
              <PhaseCard
                phase={phase}
                tasks={tasks.filter((item) => item.phaseId === phase.id)}
                milestoneName={milestones.find((item) => item.id === phase.milestoneId)?.name ?? null}
                isFirst={index === 0}
                isLast={index === phases.length - 1}
                canManage={canManage}
                canReopen={canReopen}
                actions={{
                  onMove: (offset) => movePhase(phase.id, offset),
                  onEdit: () => setForm({ phase }),
                  onClose: () => setClosing(phase),
                  onReopen: () => {
                    reopenPhase(phase.id)
                    toast.success(t('phases.toast.reopened', { name: phase.name }))
                  },
                  onDelete: () => setDeleting(phase),
                }}
              />
            </li>
          ))}
        </ol>
      )}

      <PhaseFormDialog
        groupId={group.id}
        phase={form?.phase ?? null}
        open={form !== null}
        onOpenChange={(open) => !open && setForm(null)}
      />
      <ClosePhaseDialog phase={closing} phases={phases} tasks={tasks} onClose={() => setClosing(null)} />
      <DeletePhaseDialog phase={deleting} phases={phases} tasks={tasks} onClose={() => setDeleting(null)} />
    </div>
  )
}
