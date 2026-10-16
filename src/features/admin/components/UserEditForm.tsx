/**
 * @file Edit mode of the "Profile" card on the user detail, SCR-USER-05 (6)–(9), (13), (14) (UC-USER-06; API-USER-09):
 *   full name, email while pending, user ID, school. GitHub and bio stay read-only.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-05
 * @modified 2026-10-05
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, TriangleAlert } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  getAdminUser,
  getGetAdminUserQueryKey,
  getListUsersQueryKey,
  useUpdateAdminUser,
} from '@/api/generated/endpoints/admin-users/admin-users'
import { getListActiveSchoolsQueryKey } from '@/api/generated/endpoints/catalogs/catalogs'
import type { AdminUpdateUserRequest, AdminUserDetailResponse } from '@/api/generated/models'
import { toApiError } from '@/api/http-client'
import { ConfirmDialog, UnsavedChangesDialog } from '@/components/common'
import { FormTextField } from '@/components/form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { EMAIL_MAX_LENGTH, USER_CODE_MAX_LENGTH } from '@/config/constants'
import { SchoolCombobox } from '@/features/profile'
import { translateKey } from '@/lib/i18n'
import { collapseWhitespace } from '@/utils/search'

import { type EditUserFormValues, editUserSchema } from '../schemas/edit-user.schema'

/** Server field → form field and message key per error code ("default" for the others) */
const FIELD_ERRORS: Record<
  string,
  { field: keyof EditUserFormValues; messages: Record<string, string> & { default: string } }
> = {
  fullName: { field: 'fullName', messages: { default: 'auth:message.fullNameLength' } },
  email: {
    field: 'email',
    messages: { REQUIRED: 'auth:message.emailRequired', default: 'auth:message.emailInvalid' },
  },
  userCode: {
    field: 'userCode',
    messages: { REQUIRED: 'auth:message.userCodeRequired', default: 'auth:message.userCodeFormat' },
  },
  schoolId: { field: 'school', messages: { default: 'admin:message.schoolNotAvailable' } },
}

function toValues(user: AdminUserDetailResponse): EditUserFormValues {
  return {
    fullName: user.fullName,
    email: user.email,
    userCode: user.userCode,
    school: user.school ?? null,
  }
}

/** Only the fields that differ from the saved user are sent (API-USER-09 is a PATCH) */
function changedFields(values: EditUserFormValues, saved: AdminUserDetailResponse) {
  const changes: Omit<AdminUpdateUserRequest, 'version'> = {}
  const fullName = collapseWhitespace(values.fullName)
  if (fullName !== saved.fullName) changes.fullName = fullName
  // The backend stores both lowercase / uppercase: a change of case only is not a change
  const email = values.email.trim().toLowerCase()
  if (saved.status === 'PENDING_ACTIVATION' && email !== saved.email) changes.email = email
  const userCode = values.userCode.trim().toUpperCase()
  if (userCode !== saved.userCode) changes.userCode = userCode
  const schoolId = values.school?.id ?? null
  if (schoolId !== (saved.school?.id ?? null)) changes.schoolId = schoolId
  return changes
}

interface UserEditFormProps {
  user: AdminUserDetailResponse
  /** Leaves edit mode; called after a save or a confirmed cancel */
  onDone: () => void
}

export function UserEditForm({ user, onDone }: UserEditFormProps) {
  const { t } = useTranslation('admin')
  const { t: tAuth } = useTranslation('auth')
  const { t: tCommon } = useTranslation()
  const queryClient = useQueryClient()
  const update = useUpdateAdminUser()
  const [saved, setSaved] = useState(user)
  // Version sent with the next save; "keep my edits" moves it forward without touching the form
  const [version, setVersion] = useState(user.version)
  const [hasConflict, setHasConflict] = useState(false)
  const [isDiscardOpen, setIsDiscardOpen] = useState(false)
  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: toValues(user),
    mode: 'onTouched',
  })
  const values = useWatch({ control: form.control }) as EditUserFormValues
  const hasChanges = Object.keys(changedFields(values, saved)).length > 0
  const isBusy = update.isPending
  const isPending = saved.status === 'PENDING_ACTIVATION'

  const applySaved = (detail: AdminUserDetailResponse) => {
    setSaved(detail)
    setVersion(detail.version)
    form.reset(toValues(detail))
    queryClient.setQueryData(getGetAdminUserQueryKey(detail.id), detail)
  }

  const fetchLatest = async () => {
    try {
      return await getAdminUser(saved.id)
    } catch {
      toast.error(tCommon('error.generic'))
      return null
    }
  }

  const onError = (error: unknown) => {
    const apiError = toApiError(error)
    switch (apiError.code) {
      case 'USER_VERSION_CONFLICT':
        return setHasConflict(true)
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
      case 'USER_EMAIL_CHANGE_NOT_ALLOWED':
        // The account was activated meanwhile: show its current state, the email field becomes read-only
        form.setError('email', { message: 'admin:message.emailChangeNotAllowed' })
        void fetchLatest().then((latest) => {
          if (!latest) return
          setSaved(latest)
          setVersion(latest.version)
          form.setValue('email', latest.email)
          queryClient.setQueryData(getGetAdminUserQueryKey(latest.id), latest)
        })
        return
      case 'VALIDATION_ERROR':
        if (apiError.fieldErrors.length === 0) break
        apiError.fieldErrors.forEach(({ field, code }, index) => {
          const mapped = FIELD_ERRORS[field]
          if (!mapped) return toast.error(tCommon('error.generic'))
          form.setError(
            mapped.field,
            { message: mapped.messages[code] ?? mapped.messages.default },
            { shouldFocus: index === 0 },
          )
          if (field === 'schoolId') {
            void queryClient.invalidateQueries({ queryKey: getListActiveSchoolsQueryKey() })
          }
        })
        return
      case 'AUTH_RATE_LIMITED':
        return toast.error(tAuth('message.rateLimited', { count: apiError.retryAfterSeconds ?? 0 }))
      case 'USER_NOT_FOUND':
        return toast.error(t('detail.notFound'))
    }
    toast.error(tCommon(apiError.isNetworkError ? 'error.network' : 'error.generic'))
  }

  const submit = form.handleSubmit((formValues) => {
    const changes = changedFields(formValues, saved)
    if (Object.keys(changes).length === 0) return
    update.mutate(
      { userId: saved.id, data: { version, ...changes } },
      {
        onSuccess: (detail) => {
          applySaved(detail)
          void queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() })
          toast.success(
            changes.email ? t('message.savedEmail', { email: detail.email }) : t('message.saved'),
          )
          onDone()
        },
        onError,
      },
    )
  })

  // Drop the edits and show the latest version
  const reload = async () => {
    const latest = await fetchLatest()
    if (!latest) return
    applySaved(latest)
    setHasConflict(false)
  }

  // Keep the edits, only take the latest version so that the next save overwrites it
  const keepEditing = async () => {
    const latest = await fetchLatest()
    if (!latest) return
    setSaved(latest)
    setVersion(latest.version)
    setHasConflict(false)
  }

  // A4: Esc or Cancel; with changes, ask first (MSG-68)
  const cancel = () => (hasChanges ? setIsDiscardOpen(true) : onDone())
  // A native listener on the form: Esc in a portal (school picker, discard dialog) never reaches it and only closes
  // that layer
  const formRef = useRef<HTMLFormElement>(null)
  const cancelRef = useRef(cancel)
  useEffect(() => {
    cancelRef.current = cancel
  })
  useEffect(() => {
    const element = formRef.current
    if (!element || isBusy) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      cancelRef.current()
    }
    element.addEventListener('keydown', onKeyDown)
    return () => element.removeEventListener('keydown', onKeyDown)
  }, [isBusy])

  // A2: edit mode starts in the full name
  useEffect(() => form.setFocus('fullName'), [form])

  return (
    <form
      onSubmit={submit}
      ref={formRef}
      noValidate
      aria-busy={isBusy}
      className="flex flex-col gap-4"
    >
      <UnsavedChangesDialog when={hasChanges && !isBusy} />

      {hasConflict && (
        <Alert className="border-highlight bg-highlight-soft text-highlight-text">
          <TriangleAlert aria-hidden />
          <AlertTitle>{t('message.conflictTitle')}</AlertTitle>
          <AlertDescription className="flex flex-col gap-2 text-highlight-text">
            <span>{t('message.conflictDescription')}</span>
            <span className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => void reload()}>
                {t('action.reload')}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => void keepEditing()}>
                {t('action.keepEditing')}
              </Button>
            </span>
          </AlertDescription>
        </Alert>
      )}

      <FormTextField
        control={form.control}
        name="fullName"
        label={t('users.column.fullName')}
        autoComplete="off"
        disabled={isBusy}
      />
      <FormTextField
        control={form.control}
        name="email"
        type="email"
        label={t('users.column.email')}
        autoComplete="off"
        maxLength={EMAIL_MAX_LENGTH}
        readOnly={!isPending}
        disabled={isBusy}
        className={isPending ? undefined : 'bg-muted text-muted-foreground'}
        description={isPending ? t('edit.emailPendingHint') : t('edit.emailLockedHint')}
      />
      <FormTextField
        control={form.control}
        name="userCode"
        label={t('users.column.userCode')}
        autoComplete="off"
        maxLength={USER_CODE_MAX_LENGTH}
        disabled={isBusy}
        className="font-mono uppercase"
        description={t('edit.userCodeHint')}
      />
      <Controller
        control={form.control}
        name="school"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="admin-user-school">{t('detail.school')}</FieldLabel>
            <SchoolCombobox
              id="admin-user-school"
              value={field.value}
              onChange={(school) => {
                field.onChange(school)
                form.clearErrors('school')
              }}
              disabled={isBusy}
              invalid={fieldState.invalid}
              aria-describedby={fieldState.invalid ? 'admin-user-school-error' : undefined}
            />
            {fieldState.error?.message && (
              <FieldError id="admin-user-school-error">
                {translateKey(fieldState.error.message)}
              </FieldError>
            )}
          </Field>
        )}
      />

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={cancel} disabled={isBusy}>
          {t('action.cancel')}
        </Button>
        <Button type="submit" disabled={!hasChanges || isBusy}>
          {isBusy && <Loader2 className="animate-spin" aria-hidden />}
          {isBusy ? t('action.saving') : t('action.save')}
        </Button>
      </div>

      <ConfirmDialog
        open={isDiscardOpen}
        onOpenChange={setIsDiscardOpen}
        title={t('message.discardTitle')}
        description={t('message.discardDescription')}
        confirmLabel={t('message.discard')}
        cancelLabel={t('message.keep')}
        onConfirm={() => {
          setIsDiscardOpen(false)
          onDone()
        }}
      />
    </form>
  )
}
