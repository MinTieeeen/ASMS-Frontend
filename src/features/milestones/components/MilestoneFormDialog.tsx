/**
 * @file Add or edit a milestone (UC10 step 1, F06.01): name, the lecturer's requirements, the real due date and
 *   time, and an optional score weight with the group's weight total as a guide.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { FormTextareaField, FormTextField } from '@/components/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { type Milestone, useMockStore } from '@/mocks'
import { fromDateTimeInputValues, toDateInputValue, toTimeInputValue } from '@/utils/date'

import { type MilestoneFormValues,milestoneSchema } from '../schemas/milestone.schema'

const DEFAULT_DUE_IN_DAYS = 7
const DEFAULT_DUE_TIME = '23:59'
const DAY_MS = 86_400_000
const FULL_WEIGHT = 100

interface MilestoneFormDialogProps {
  groupId: string
  /** Null adds a new milestone */
  milestone: Milestone | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MilestoneFormDialog({ groupId, milestone, open, onOpenChange }: MilestoneFormDialogProps) {
  const { t } = useTranslation('milestones')
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{milestone ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
        </DialogHeader>
        {/* Mounted only while open, so every opening starts from fresh values */}
        <MilestoneForm groupId={groupId} milestone={milestone} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function MilestoneForm({ groupId, milestone, onDone }: { groupId: string; milestone: Milestone | null; onDone: () => void }) {
  const { t } = useTranslation('milestones')
  const { t: tCommon } = useTranslation()
  const createMilestone = useMockStore((state) => state.createMilestone)
  const updateMilestone = useMockStore((state) => state.updateMilestone)
  const otherWeight = useMockStore((state) =>
    state.milestones
      .filter((item) => item.groupId === groupId && item.id !== milestone?.id)
      .reduce((sum, item) => sum + (item.weight ?? 0), 0),
  )
  const [defaultValues] = useState(() => defaultsOf(milestone))
  const form = useForm<MilestoneFormValues>({ resolver: zodResolver(milestoneSchema), defaultValues })
  const weight = Number(useWatch({ control: form.control, name: 'weight' }) || 0)
  const total = otherWeight + (Number.isFinite(weight) ? weight : 0)

  const submit = form.handleSubmit((values) => {
    const input = {
      name: values.name,
      description: values.description,
      dueAt: fromDateTimeInputValues(values.dueDate, values.dueTime),
      weight: values.weight.trim() === '' ? null : Number(values.weight),
    }
    if (milestone) updateMilestone(milestone.id, input)
    else createMilestone(groupId, input)
    toast.success(t(milestone ? 'toast.updated' : 'toast.created', { name: values.name }))
    onDone()
  })

  return (
    <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-4" noValidate>
      <FormTextField control={form.control} name="name" label={t('field.name')} placeholder={t('field.namePlaceholder')} />
      <FormTextareaField control={form.control} name="description" label={t('field.description')} rows={4} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormTextField control={form.control} name="dueDate" type="date" label={t('field.dueDate')} />
        <FormTextField control={form.control} name="dueTime" type="time" label={t('field.dueTime')} />
      </div>
      <FormTextField
        control={form.control}
        name="weight"
        type="number"
        inputMode="decimal"
        min={0}
        max={FULL_WEIGHT}
        className="w-32"
        label={t('field.weight')}
        description={t('field.weightHint', { total: otherWeight })}
      />
      {total > FULL_WEIGHT && (
        <Alert>
          <TriangleAlert aria-hidden />
          <AlertDescription>{t('field.weightOver', { total })}</AlertDescription>
        </Alert>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          {tCommon('action.cancel')}
        </Button>
        <Button type="submit">{milestone ? t('form.save') : t('form.create')}</Button>
      </DialogFooter>
    </form>
  )
}

function defaultsOf(milestone: Milestone | null): MilestoneFormValues {
  if (milestone) {
    return {
      name: milestone.name,
      description: milestone.description,
      dueDate: toDateInputValue(milestone.dueAt),
      dueTime: toTimeInputValue(milestone.dueAt),
      weight: milestone.weight === null ? '' : String(milestone.weight),
    }
  }
  return {
    name: '',
    description: '',
    dueDate: toDateInputValue(new Date(Date.now() + DEFAULT_DUE_IN_DAYS * DAY_MS).toISOString()),
    dueTime: DEFAULT_DUE_TIME,
    weight: '',
  }
}
