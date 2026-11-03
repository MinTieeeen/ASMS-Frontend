/**
 * @file Dialog that asks for a required note before a task action: the result when submitting for review, the
 *   reason when returning a task (UC09 steps 2 and 3).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FieldError } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface TaskNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  label: string
  confirmLabel: string
  onConfirm: (note: string) => void
}

export function TaskNoteDialog({ open, onOpenChange, title, description, label, confirmLabel, onConfirm }: TaskNoteDialogProps) {
  const { t } = useTranslation('tasks')
  const { t: tCommon } = useTranslation()
  const [note, setNote] = useState('')
  const [isInvalid, setIsInvalid] = useState(false)

  const close = (next: boolean) => {
    onOpenChange(next)
    if (!next) {
      setNote('')
      setIsInvalid(false)
    }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!note.trim()) {
      setIsInvalid(true)
      return
    }
    onConfirm(note.trim())
    close(false)
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-note">{label}</Label>
            <Textarea
              id="task-note"
              rows={4}
              value={note}
              aria-invalid={isInvalid}
              aria-describedby={isInvalid ? 'task-note-error' : undefined}
              onChange={(event) => {
                setNote(event.target.value)
                setIsInvalid(false)
              }}
            />
            {isInvalid && <FieldError id="task-note-error">{t('validation.required')}</FieldError>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => close(false)}>
              {tCommon('action.cancel')}
            </Button>
            <Button type="submit">{confirmLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
