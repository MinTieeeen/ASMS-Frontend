/**
 * @file Close a phase (UC07, F04.03): summary of done, unfinished and overdue tasks, then where the unfinished
 *   ones go: the next phase, another open phase, or stay.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { byPosition, type CarryOver, isTaskClosed, isTaskOverdue, type Phase, type Task, useMockStore } from '@/mocks'

type Mode = CarryOver['mode']

interface ClosePhaseDialogProps {
  /** Null closes the dialog */
  phase: Phase | null
  /** Every phase and task of the group */
  phases: Phase[]
  tasks: Task[]
  onClose: () => void
}

export function ClosePhaseDialog({ phase, phases, tasks, onClose }: ClosePhaseDialogProps) {
  const { t } = useTranslation('groups')
  return (
    <Dialog open={phase !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('phases.close_dialog.title', { name: phase?.name ?? '' })}</DialogTitle>
          <DialogDescription>{t('phases.close_dialog.readOnlyHint')}</DialogDescription>
        </DialogHeader>
        {phase && <CloseForm phase={phase} phases={phases} tasks={tasks} onDone={onClose} />}
      </DialogContent>
    </Dialog>
  )
}

function CloseForm({ phase, phases, tasks, onDone }: Omit<ClosePhaseDialogProps, 'phase' | 'onClose'> & { phase: Phase; onDone: () => void }) {
  const { t } = useTranslation('groups')
  const { t: tCommon } = useTranslation()
  const closePhase = useMockStore((state) => state.closePhase)
  const own = tasks.filter((item) => item.phaseId === phase.id && !item.parentTaskId && item.status !== 'cancelled')
  const unfinished = own.filter((item) => !isTaskClosed(item))
  const summary = [
    { key: 'done', value: own.filter((item) => item.status === 'done').length },
    { key: 'unfinished', value: unfinished.length },
    { key: 'overdue', value: unfinished.filter((item) => isTaskOverdue(item)).length },
  ] as const
  const ordered = [...phases].sort(byPosition)
  const next = ordered.slice(ordered.findIndex((item) => item.id === phase.id) + 1)[0]
  const others = ordered.filter((item) => item.id !== phase.id && item.status !== 'closed')
  const [mode, setMode] = useState<Mode>(next ? 'next' : 'keep')
  const [targetId, setTargetId] = useState(others[0]?.id ?? '')

  const confirm = () => {
    const carryOver: CarryOver = mode === 'phase' ? { mode, phaseId: targetId } : { mode }
    closePhase(phase.id, carryOver)
    toast.success(t('phases.toast.closed', { name: phase.name }))
    onDone()
  }

  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-3 gap-2 text-center">
        {summary.map((item) => (
          <div key={item.key} className="rounded-lg border p-3">
            <dt className="text-xs text-muted-foreground">{t(`phases.close_dialog.${item.key}`)}</dt>
            <dd className="text-xl font-semibold tabular-nums">{item.value}</dd>
          </div>
        ))}
      </dl>
      {unfinished.length > 0 && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 text-sm font-medium">
            {t('phases.close_dialog.carryTitle', { count: unfinished.length })}
          </legend>
          <RadioGroup value={mode} onValueChange={(value) => setMode(value as Mode)}>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="carry-next" value="next" disabled={!next} />
              <Label htmlFor="carry-next" className="font-normal">
                {next ? t('phases.close_dialog.next', { name: next.name }) : t('phases.close_dialog.noNext')}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="carry-phase" value="phase" disabled={others.length === 0} />
              <Label htmlFor="carry-phase" className="font-normal">
                {t('phases.close_dialog.other')}
              </Label>
            </div>
            {mode === 'phase' && (
              <Select value={targetId} onValueChange={setTargetId}>
                <SelectTrigger className="ml-6 w-[calc(100%-1.5rem)]" aria-label={t('phases.close_dialog.pickPhase')}>
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
            )}
            <div className="flex items-center gap-2">
              <RadioGroupItem id="carry-keep" value="keep" />
              <Label htmlFor="carry-keep" className="font-normal">
                {t('phases.close_dialog.keep')}
              </Label>
            </div>
          </RadioGroup>
        </fieldset>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={onDone}>
          {tCommon('action.cancel')}
        </Button>
        <Button onClick={confirm}>{t('phases.close')}</Button>
      </DialogFooter>
    </div>
  )
}
