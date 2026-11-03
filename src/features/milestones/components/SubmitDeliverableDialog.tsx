/**
 * @file Submit a deliverable for a milestone (UC10 steps 3-4, F06.02): upload a file or paste a link, with a version
 *   note. Files over 25 MB or past the group's 1 GB are refused (BR14); a submission after the due date is flagged
 *   late (UC10-4a). The mock keeps only the file's name and size.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { TriangleAlert } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FieldDescription, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { GROUP_STORAGE_LIMIT_BYTES, MAX_UPLOAD_SIZE_BYTES } from '@/config/constants'
import { type Milestone, useMockStore } from '@/mocks'
import { formatFileSize } from '@/utils/format'

type Kind = 'file' | 'link'

const urlSchema = z.url({ protocol: /^https?$/ })

interface SubmitDeliverableDialogProps {
  milestone: Milestone
  /** Bytes already used by the group's files */
  storageUsed: number
  nextVersion: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubmitDeliverableDialog({ milestone, storageUsed, nextVersion, open, onOpenChange }: SubmitDeliverableDialogProps) {
  const { t } = useTranslation('milestones')
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{t('submit.title', { name: milestone.name })}</DialogTitle>
        </DialogHeader>
        {/* Mounted only while open, so every opening starts empty */}
        <SubmitForm milestone={milestone} storageUsed={storageUsed} nextVersion={nextVersion} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

type SubmitFormProps = Omit<SubmitDeliverableDialogProps, 'open' | 'onOpenChange'> & { onDone: () => void }

function SubmitForm({ milestone, storageUsed, nextVersion, onDone }: SubmitFormProps) {
  const { t } = useTranslation('milestones')
  const { t: tCommon } = useTranslation()
  const uploadDeliverable = useMockStore((state) => state.uploadDeliverable)
  const [kind, setKind] = useState<Kind>('file')
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLate] = useState(() => new Date(milestone.dueAt) < new Date())
  const max = formatFileSize(MAX_UPLOAD_SIZE_BYTES)
  const limit = formatFileSize(GROUP_STORAGE_LIMIT_BYTES)

  const validate = (): string | null => {
    if (kind === 'link') return urlSchema.safeParse(url.trim()).success ? null : t('validation.urlInvalid')
    if (!file) return t('validation.fileRequired')
    if (file.size > MAX_UPLOAD_SIZE_BYTES) return t('validation.fileTooLarge', { max })
    if (storageUsed + file.size > GROUP_STORAGE_LIMIT_BYTES) return t('validation.storageFull', { limit })
    return null
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const problem = validate()
    setError(problem)
    if (problem) return
    uploadDeliverable(milestone.id, {
      kind,
      // TODO(F06.02): upload the file to object storage once the backend exposes it; the mock keeps name and size
      url: kind === 'link' ? url.trim() : '#',
      fileName: kind === 'file' ? (file?.name ?? null) : null,
      fileSize: kind === 'file' ? (file?.size ?? null) : null,
      note: note.trim(),
    })
    toast.success(t('submit.done', { version: nextVersion }))
    onDone()
  }

  const errorId = 'deliverable-error'
  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">{t('submit.kind')}</legend>
        <RadioGroup
          value={kind}
          onValueChange={(value) => {
            setKind(value === 'link' ? 'link' : 'file')
            setError(null)
          }}
          className="flex gap-6"
        >
          {(['file', 'link'] as const).map((option) => (
            <div key={option} className="flex items-center gap-2">
              <RadioGroupItem id={`deliverable-kind-${option}`} value={option} />
              <Label htmlFor={`deliverable-kind-${option}`} className="font-normal">
                {t(`submit.${option}`)}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </fieldset>

      {kind === 'file' ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="deliverable-file">{t('submit.chooseFile')}</Label>
          <Input
            id="deliverable-file"
            type="file"
            aria-invalid={!!error}
            aria-describedby={error ? errorId : 'deliverable-file-hint'}
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null)
              setError(null)
            }}
          />
          <FieldDescription id="deliverable-file-hint">
            {t('submit.fileHint', { max, used: formatFileSize(storageUsed), limit })}
          </FieldDescription>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="deliverable-url">{t('submit.url')}</Label>
          <Input
            id="deliverable-url"
            type="url"
            value={url}
            placeholder={t('submit.urlPlaceholder')}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : 'deliverable-url-hint'}
            onChange={(event) => {
              setUrl(event.target.value)
              setError(null)
            }}
          />
          <FieldDescription id="deliverable-url-hint">{t('submit.urlHint')}</FieldDescription>
        </div>
      )}
      {error && <FieldError id={errorId}>{error}</FieldError>}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="deliverable-note">{t('submit.note')}</Label>
        <Textarea id="deliverable-note" rows={2} value={note} placeholder={t('submit.notePlaceholder')} onChange={(event) => setNote(event.target.value)} />
      </div>

      {isLate && (
        <Alert>
          <TriangleAlert aria-hidden />
          <AlertDescription>{t('submit.late')}</AlertDescription>
        </Alert>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          {tCommon('action.cancel')}
        </Button>
        <Button type="submit">{t('submit.confirm', { version: nextVersion })}</Button>
      </DialogFooter>
    </form>
  )
}
