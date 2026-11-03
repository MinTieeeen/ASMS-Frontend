/**
 * @file Add or edit a phase (UC06, F04.01-F04.02): name, goal, dates and an optional related milestone; warns
 *   about overlapping phases without blocking the save (UC06-2a).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { FormTextareaField, FormTextField } from '@/components/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { overlappingPhases, type Phase, useMockStore } from '@/mocks'
import { fromDateInputValue, toDateInputValue } from '@/utils/date'

import { NO_MILESTONE, type PhaseFormValues,phaseSchema } from '../schemas/phase.schema'

const DEFAULT_LENGTH_DAYS = 14
const DAY_MS = 86_400_000

interface PhaseFormDialogProps {
  groupId: string
  /** Null adds a new phase */
  phase: Phase | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PhaseFormDialog({ groupId, phase, open, onOpenChange }: PhaseFormDialogProps) {
  const { t } = useTranslation('groups')
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{phase ? t('phases.form.editTitle') : t('phases.form.createTitle')}</DialogTitle>
        </DialogHeader>
        {/* Mounted only while open, so every opening starts from fresh values */}
        <PhaseForm groupId={groupId} phase={phase} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function PhaseForm({ groupId, phase, onDone }: { groupId: string; phase: Phase | null; onDone: () => void }) {
  const { t } = useTranslation('groups')
  const { t: tCommon } = useTranslation()
  const allPhases = useMockStore((state) => state.phases)
  const allMilestones = useMockStore((state) => state.milestones)
  const createPhase = useMockStore((state) => state.createPhase)
  const updatePhase = useMockStore((state) => state.updatePhase)
  const phases = allPhases.filter((item) => item.groupId === groupId)
  const milestones = allMilestones.filter((item) => item.groupId === groupId)
  const [defaultValues] = useState(() => defaultsOf(phase, phases))
  const form = useForm<PhaseFormValues>({ resolver: zodResolver(phaseSchema), defaultValues })
  const [startDate, endDate] = useWatch({ control: form.control, name: ['startDate', 'endDate'] })

  const overlaps =
    startDate && endDate && endDate >= startDate
      ? overlappingPhases(
          phases,
          fromDateInputValue(startDate, 'start'),
          fromDateInputValue(endDate, 'end'),
          phase?.id,
        )
      : []

  const submit = form.handleSubmit((values) => {
    const input = {
      name: values.name,
      goal: values.goal,
      startDate: fromDateInputValue(values.startDate, 'start'),
      endDate: fromDateInputValue(values.endDate, 'end'),
      milestoneId: values.milestoneId === NO_MILESTONE ? null : values.milestoneId,
    }
    if (phase) updatePhase(phase.id, input)
    else createPhase(groupId, input)
    toast.success(t(phase ? 'phases.toast.updated' : 'phases.toast.created', { name: values.name }))
    onDone()
  })

  return (
    <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-4" noValidate>
      <FormTextField control={form.control} name="name" label={t('phases.form.name')} placeholder={t('phases.form.namePlaceholder')} />
      <FormTextareaField control={form.control} name="goal" label={t('phases.form.goal')} rows={2} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormTextField control={form.control} name="startDate" type="date" label={t('phases.form.startDate')} />
        <FormTextField control={form.control} name="endDate" type="date" label={t('phases.form.endDate')} />
      </div>
      {overlaps.length > 0 && (
        <Alert>
          <TriangleAlert aria-hidden />
          <AlertDescription>
            {t('phases.form.overlap', { names: overlaps.map((item) => item.name).join(', ') })}
          </AlertDescription>
        </Alert>
      )}
      <Controller
        control={form.control}
        name="milestoneId"
        render={({ field }) => (
          <Field>
            <FieldLabel htmlFor="field-milestoneId">{t('phases.form.milestone')}</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="field-milestoneId">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_MILESTONE}>{t('phases.form.noMilestone')}</SelectItem>
                {milestones.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      />
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          {tCommon('action.cancel')}
        </Button>
        <Button type="submit">{phase ? t('phases.form.save') : t('phases.form.create')}</Button>
      </DialogFooter>
    </form>
  )
}

/** A new phase starts the day after the last one ends (or today) and lasts two weeks */
function defaultsOf(phase: Phase | null, phases: Phase[]): PhaseFormValues {
  if (phase) {
    return {
      name: phase.name,
      goal: phase.goal,
      startDate: toDateInputValue(phase.startDate),
      endDate: toDateInputValue(phase.endDate),
      milestoneId: phase.milestoneId ?? NO_MILESTONE,
    }
  }
  const lastEnd = Math.max(0, ...phases.map((item) => new Date(item.endDate).getTime()))
  const start = Math.max(Date.now(), lastEnd + DAY_MS)
  return {
    name: '',
    goal: '',
    startDate: toDateInputValue(new Date(start).toISOString()),
    endDate: toDateInputValue(new Date(start + (DEFAULT_LENGTH_DAYS - 1) * DAY_MS).toISOString()),
    milestoneId: NO_MILESTONE,
  }
}
