/**
 * @file Create account dialog, SCR-AUTH-06 (UC-AUTH-07, FR-AUTH-15, actions A1 to A3).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Info, Loader2, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  getListUsersQueryKey,
  useCreateUser,
} from '@/api/generated/endpoints/admin-users/admin-users'
import { toApiError } from '@/api/http-client'
import { ConfirmDialog } from '@/components/common'
import { FormTextField } from '@/components/form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FieldLegend, FieldSet } from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { EMAIL_MAX_LENGTH, USER_CODE_MAX_LENGTH } from '@/config/constants'
import { cn } from '@/lib/utils'

import { type CreateUserFormValues, createUserSchema } from '../schemas/create-user.schema'
import { applyFieldErrors } from '../utils/field-errors'

const EMPTY: CreateUserFormValues = { email: '', fullName: '', userCode: '', systemRole: 'USER' }
const ROLES = ['USER', 'ADMIN'] as const

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const { t } = useTranslation('auth')
  const { t: tCommon } = useTranslation()
  const queryClient = useQueryClient()
  const [isDiscardOpen, setIsDiscardOpen] = useState(false)
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: EMPTY,
    mode: 'onTouched',
  })
  // Read during render: RHF only tracks isDirty for components that subscribe to it
  const { isDirty } = form.formState
  const create = useCreateUser()

  const close = () => {
    form.reset(EMPTY)
    onOpenChange(false)
  }

  // A3: closing with typed data asks first (Esc, overlay, X and "Cancel" all go through here)
  const requestClose = () => {
    if (create.isPending) return
    if (isDirty) setIsDiscardOpen(true)
    else close()
  }

  const onError = (error: unknown) => {
    const apiError = toApiError(error)
    switch (apiError.code) {
      case 'USER_EMAIL_EXISTS':
        return form.setError(
          'email',
          { message: 'auth:message.emailExists' },
          { shouldFocus: true },
        )
      case 'USER_CODE_EXISTS':
        return form.setError(
          'userCode',
          { message: 'auth:message.userCodeExists' },
          { shouldFocus: true },
        )
      case 'AUTH_FORBIDDEN':
        close()
        return toast.error(tCommon('error.forbidden'))
      default:
        if (!applyFieldErrors(error, form.setError)) {
          toast.error(tCommon(apiError.isNetworkError ? 'error.network' : 'error.generic'))
        }
    }
  }

  const submit = form.handleSubmit(({ email, fullName, userCode, systemRole }) => {
    create.mutate(
      { data: { email, fullName, userCode, systemRole } },
      {
        onSuccess: (user) => {
          close()
          toast.success(t('message.userCreated', { email: user.email }))
          void queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() })
        },
        onError,
      },
    )
  })

  const isBusy = create.isPending
  return (
    <>
      <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : requestClose())}>
        <DialogContent className="gap-5 p-6 sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">{t('createUser.title')}</DialogTitle>
            <DialogDescription>{t('createUser.description')}</DialogDescription>
          </DialogHeader>

          <form
            id="create-user-form"
            onSubmit={submit}
            noValidate
            aria-busy={isBusy}
            className="flex flex-col gap-4"
          >
            <FormTextField
              control={form.control}
              name="email"
              label={t('field.email')}
              type="email"
              autoComplete="off"
              maxLength={EMAIL_MAX_LENGTH}
              disabled={isBusy}
            />
            <FormTextField
              control={form.control}
              name="fullName"
              label={t('createUser.fullName')}
              autoComplete="off"
              disabled={isBusy}
            />
            <FormTextField
              control={form.control}
              name="userCode"
              label={t('createUser.userCode')}
              description={t('createUser.userCodeHint')}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={USER_CODE_MAX_LENGTH}
              className="font-mono"
              disabled={isBusy}
            />

            <Controller
              control={form.control}
              name="systemRole"
              render={({ field }) => (
                <FieldSet className="gap-2">
                  <FieldLegend variant="label">{t('createUser.role')}</FieldLegend>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isBusy}
                    className="grid-cols-2"
                  >
                    {ROLES.map((role) => (
                      <label
                        key={role}
                        className={cn(
                          'flex h-11 cursor-pointer items-center gap-2.5 rounded-lg border px-3 text-sm font-medium',
                          field.value === role && 'border-primary bg-accent',
                        )}
                      >
                        <RadioGroupItem value={role} />
                        {role === 'USER' ? t('createUser.roleUser') : t('createUser.roleAdmin')}
                      </label>
                    ))}
                  </RadioGroup>
                  {field.value === 'ADMIN' && (
                    <p className="flex items-start gap-2 rounded-md bg-highlight-soft px-3 py-2 text-[13px] text-highlight-text">
                      <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                      {t('createUser.adminWarning')}
                    </p>
                  )}
                </FieldSet>
              )}
            />

            <p className="flex items-start gap-2 text-[13px] text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              {t('createUser.note')}
            </p>
          </form>

          <DialogFooter className="mx-0 mb-0 border-t-0 bg-transparent p-0">
            <Button type="button" variant="outline" onClick={requestClose} disabled={isBusy}>
              {tCommon('action.cancel')}
            </Button>
            <Button type="submit" form="create-user-form" disabled={isBusy}>
              {isBusy && <Loader2 className="animate-spin" aria-hidden />}
              {isBusy ? t('createUser.submitting') : t('createUser.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDiscardOpen}
        onOpenChange={setIsDiscardOpen}
        title={t('createUser.discardTitle')}
        description={t('createUser.discardDescription')}
        confirmLabel={t('createUser.discard')}
        cancelLabel={t('createUser.keepEditing')}
        onConfirm={() => {
          setIsDiscardOpen(false)
          close()
        }}
      />
    </>
  )
}
