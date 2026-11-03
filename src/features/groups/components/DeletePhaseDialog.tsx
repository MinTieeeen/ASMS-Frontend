/**
 * @file Delete a phase (UC06, F04.02): a phase that still has tasks needs another phase to receive them.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/common'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { byPosition, type Phase, type Task, useMockStore } from '@/mocks'

interface DeletePhaseDialogProps {
  /** Null closes the dialog */
  phase: Phase | null
  phases: Phase[]
  tasks: Task[]
  onClose: () => void
}

export function DeletePhaseDialog({ phase, phases, tasks, onClose }: DeletePhaseDialogProps) {
  const { t } = useTranslation('groups')
  const { t: tCommon } = useTranslation()
  const deletePhase = useMockStore((state) => state.deletePhase)
  const [pickedId, setPickedId] = useState<string | null>(null)
  const taskCount = phase ? tasks.filter((item) => item.phaseId === phase.id).length : 0
  const others = [...phases].sort(byPosition).filter((item) => item.id !== phase?.id)
  const targetId = pickedId ?? others[0]?.id ?? null

  const close = () => {
    setPickedId(null)
    onClose()
  }

  return (
    <ConfirmDialog
      open={phase !== null}
      onOpenChange={(open) => !open && close()}
      title={t('phases.delete_dialog.title', { name: phase?.name ?? '' })}
      confirmLabel={t('phases.delete')}
      cancelLabel={tCommon('action.cancel')}
      description={
        taskCount === 0 ? (
          t('phases.delete_dialog.description')
        ) : others.length === 0 ? (
          t('phases.delete_dialog.noTarget')
        ) : (
          <span className="flex flex-col gap-2">
            <span>{t('phases.delete_dialog.hasTasks', { count: taskCount })}</span>
            <Label htmlFor="delete-phase-target" className="sr-only">
              {t('phases.delete_dialog.target')}
            </Label>
            <Select value={targetId ?? undefined} onValueChange={setPickedId}>
              <SelectTrigger id="delete-phase-target" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {others.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </span>
        )
      }
      onConfirm={() => {
        if (!phase) return
        deletePhase(phase.id, taskCount > 0 ? targetId : null)
        toast.success(t('phases.toast.deleted', { name: phase.name }))
        close()
      }}
    />
  )
}
