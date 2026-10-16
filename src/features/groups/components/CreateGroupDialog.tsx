/**
 * @file Create group dialog (UC03): step 1 information and optional subject / semester (UC02), step 2 phase
 *   template, step 3 the 6-character code and invite link (BR04).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DEFAULT_MAX_MEMBERS } from '@/config/constants'
import { ROUTES } from '@/config/routes'
import { useMockStore } from '@/mocks'

import {
  CREATE_GROUP_INFO_FIELDS,
  createGroupSchema,
  type CreateGroupFormValues,
} from '../schemas/create-group.schema'
import { GroupInfoFields } from './GroupInfoFields'
import { InviteShareBox } from './InviteShareBox'
import { TemplatePicker } from './TemplatePicker'

type Step = 'info' | 'template' | 'done'

const DEFAULT_VALUES: CreateGroupFormValues = {
  name: '',
  topic: '',
  description: '',
  subjectCode: '',
  subjectName: '',
  semester: '',
  lecturerName: '',
  maxMembers: String(DEFAULT_MAX_MEMBERS),
  template: 'software',
}

interface CreateGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const { t } = useTranslation('groups')
  const { t: tCommon } = useTranslation()
  const navigate = useNavigate()
  const createGroup = useMockStore((state) => state.createGroup)
  const groups = useMockStore((state) => state.groups)
  const [step, setStep] = useState<Step>('info')
  const [createdId, setCreatedId] = useState<string | null>(null)
  const form = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: DEFAULT_VALUES,
  })
  const created = groups.find((item) => item.id === createdId)

  const close = (next: boolean) => {
    onOpenChange(next)
    if (!next) {
      form.reset(DEFAULT_VALUES)
      setStep('info')
      setCreatedId(null)
    }
  }

  const goToTemplate = async () => {
    if (await form.trigger(CREATE_GROUP_INFO_FIELDS)) setStep('template')
  }

  const submit = form.handleSubmit((values) => {
    setCreatedId(createGroup({ ...values, maxMembers: Number(values.maxMembers) }))
    setStep('done')
  })

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{step === 'done' ? t('create.doneTitle') : t('create.title')}</DialogTitle>
          <DialogDescription>
            {step === 'done'
              ? t('create.doneDescription')
              : t('create.step', { current: step === 'info' ? 1 : 2, total: 2 })}
          </DialogDescription>
        </DialogHeader>

        {step === 'info' && <GroupInfoFields control={form.control} setValue={form.setValue} />}
        {step === 'template' && <TemplatePicker control={form.control} />}
        {step === 'done' && created && <InviteShareBox group={created} />}

        <DialogFooter>
          {step === 'info' && (
            <>
              <Button variant="outline" onClick={() => close(false)}>
                {tCommon('action.cancel')}
              </Button>
              <Button onClick={() => void goToTemplate()}>{t('create.next')}</Button>
            </>
          )}
          {step === 'template' && (
            <>
              <Button variant="outline" onClick={() => setStep('info')}>
                {tCommon('action.back')}
              </Button>
              <Button onClick={() => void submit()}>{t('create.submit')}</Button>
            </>
          )}
          {step === 'done' && created && (
            <Button
              onClick={() => {
                close(false)
                void navigate(ROUTES.groupDetail(created.id))
              }}
            >
              {t('create.openGroup')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
