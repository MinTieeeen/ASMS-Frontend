/**
 * @file Add or edit a task (UC08, F05.01-F05.02): title, description, assignee, priority, phase, start and due dates. A
 *   plain member can only take the task or leave it unassigned (UC08-2a); a due date after the phase ends is
 *   only a warning (UC08-2b).
 * @author MinhTien
 * @version 1.1.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { type Control, Controller, type FieldPath, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { FormTextareaField, FormTextField } from '@/components/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { byPosition, type GroupWorkspace, ME_ID, type Task, useMockStore, useUserMap } from '@/mocks'
import { formatDate, fromDateInputValue, toDateInputValue } from '@/utils/date'

import { NONE, type TaskFormValues,taskSchema } from '../schemas/task.schema'

const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const

interface TaskFormDialogProps {
  workspace: GroupWorkspace
  /** Null adds a new task */
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskFormDialog({ workspace, task, open, onOpenChange }: TaskFormDialogProps) {
  const { t } = useTranslation('tasks')
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{task ? t('form.editTitle', { code: task.code }) : t('form.createTitle')}</DialogTitle>
        </DialogHeader>
        {/* Mounted only while open, so every opening starts from fresh values */}
        <TaskForm workspace={workspace} task={task} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function TaskForm({ workspace, task, onDone }: { workspace: GroupWorkspace; task: Task | null; onDone: () => void }) {
  const { t } = useTranslation('tasks')
  const { t: tCommon } = useTranslation()
  const { group, members } = workspace
  const users = useUserMap()
  const allPhases = useMockStore((state) => state.phases)
  const createTask = useMockStore((state) => state.createTask)
  const updateTask = useMockStore((state) => state.updateTask)
  const phases = allPhases.filter((item) => item.groupId === group.id && item.status !== 'closed').sort(byPosition)
  const canAssignOthers = workspace.can('assignOthers')
  const assignees = canAssignOthers ? members.map((item) => item.userId) : [ME_ID]
  const defaultPhaseId = (phases.find((item) => item.status === 'active') ?? phases[0])?.id
  const form = useForm<TaskFormValues>({ resolver: zodResolver(taskSchema), defaultValues: defaultsOf(task, defaultPhaseId) })
  const [dueDate, phaseId] = useWatch({ control: form.control, name: ['dueDate', 'phaseId'] })
  const phase = phases.find((item) => item.id === phaseId)
  const isDueAfterPhase = !!phase && !!dueDate && fromDateInputValue(dueDate, 'end') > phase.endDate

  const submit = form.handleSubmit((values) => {
    const input = {
      title: values.title,
      description: values.description,
      assigneeId: values.assigneeId === NONE ? null : values.assigneeId,
      startAt: values.startDate ? fromDateInputValue(values.startDate, 'start') : null,
      dueAt: values.dueDate ? fromDateInputValue(values.dueDate, 'end') : null,
      priority: values.priority,
      phaseId: values.phaseId === NONE ? null : values.phaseId,
    }
    if (task) {
      updateTask(task.id, input)
      toast.success(t('detail.updated', { code: task.code }))
    } else {
      const id = createTask({ ...input, groupId: group.id, estimateHours: null, labelIds: [] })
      const code = useMockStore.getState().tasks.find((item) => item.id === id)?.code ?? ''
      toast.success(t('detail.created', { code }))
    }
    onDone()
  })

  return (
    <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-4" noValidate>
      <FormTextField control={form.control} name="title" label={t('field.title')} placeholder={t('field.titlePlaceholder')} />
      <FormTextareaField control={form.control} name="description" label={t('field.description')} rows={4} />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField control={form.control} name="assigneeId" label={t('field.assignee')} hint={canAssignOthers ? undefined : t('field.selfOnly')}>
          <SelectItem value={NONE}>{t('field.unassigned')}</SelectItem>
          {assignees.map((userId) => (
            <SelectItem key={userId} value={userId}>
              {users[userId]?.fullName ?? '?'}
            </SelectItem>
          ))}
        </SelectField>
        <SelectField control={form.control} name="priority" label={t('field.priority')}>
          {PRIORITIES.map((priority) => (
            <SelectItem key={priority} value={priority}>
              {tCommon(`domain.priority.${priority}`)}
            </SelectItem>
          ))}
        </SelectField>
      </div>
      <SelectField control={form.control} name="phaseId" label={t('field.phase')}>
        <SelectItem value={NONE}>{t('field.noPhase')}</SelectItem>
        {phases.map((item) => (
          <SelectItem key={item.id} value={item.id}>
            {item.name}
          </SelectItem>
        ))}
      </SelectField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormTextField control={form.control} name="startDate" type="date" label={t('field.startDate')} />
        <FormTextField control={form.control} name="dueDate" type="date" label={t('field.dueDate')} />
      </div>
      {isDueAfterPhase && (
        <Alert>
          <TriangleAlert aria-hidden />
          <AlertDescription>
            {t('form.dueAfterPhase', { phase: phase.name, date: formatDate(phase.endDate) })}
          </AlertDescription>
        </Alert>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          {tCommon('action.cancel')}
        </Button>
        <Button type="submit">{task ? t('form.save') : t('form.create')}</Button>
      </DialogFooter>
    </form>
  )
}

interface SelectFieldProps {
  control: Control<TaskFormValues>
  name: FieldPath<TaskFormValues>
  label: string
  hint?: string
  children: ReactNode
}

function SelectField({ control, name, label, hint, children }: SelectFieldProps) {
  const id = `field-${name}`
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger id={id}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>{children}</SelectContent>
          </Select>
          {hint && <FieldDescription>{hint}</FieldDescription>}
        </Field>
      )}
    />
  )
}

function defaultsOf(task: Task | null, firstOpenPhaseId: string | undefined): TaskFormValues {
  if (!task) {
    return {
      title: '',
      description: '',
      assigneeId: NONE,
      startDate: '',
      dueDate: '',
      priority: 'medium',
      phaseId: firstOpenPhaseId ?? NONE,
    }
  }
  return {
    title: task.title,
    description: task.description,
    assigneeId: task.assigneeId ?? NONE,
    startDate: task.startAt ? toDateInputValue(task.startAt) : '',
    dueDate: task.dueAt ? toDateInputValue(task.dueAt) : '',
    priority: task.priority,
    phaseId: task.phaseId ?? NONE,
  }
}
