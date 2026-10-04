/**
 * @file Profile form of SCR-USER-01: photo block, personal information, save bar, conflict banner (UC-USER-01, A2–A6).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-04
 * @modified 2026-10-04
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, TriangleAlert } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { getListActiveSchoolsQueryKey } from '@/api/generated/endpoints/catalogs/catalogs'
import {
  getGetMyProfileQueryKey,
  getMyProfile,
  useUpdateMyProfile,
} from '@/api/generated/endpoints/profiles/profiles'
import type {
  AvatarResponse,
  UpdateProfileRequest,
  UserProfileResponse,
} from '@/api/generated/models'
import { toApiError } from '@/api/http-client'
import { UnsavedChangesDialog } from '@/components/common'
import { FormTextField } from '@/components/form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { translateKey } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { collapseWhitespace } from '@/utils/search'

import {
  BIO_MAX_LENGTH,
  type ProfileFormValues,
  profileSchema,
  textLength,
} from '../schemas/profile.schema'
import { AvatarSection } from './AvatarSection'
import { SchoolCombobox } from './SchoolCombobox'

/** Server field → form field and message key; codes are not distinguished (the form shows one message per field) */
const FIELD_ERRORS: Record<string, { field: keyof ProfileFormValues; message: string }> = {
  fullName: { field: 'fullName', message: 'auth:message.fullNameLength' },
  bio: { field: 'bio', message: 'profile:message.bioTooLong' },
  schoolId: { field: 'school', message: 'profile:message.schoolNotAvailable' },
}

function toValues(profile: UserProfileResponse): ProfileFormValues {
  return { fullName: profile.fullName, school: profile.school ?? null, bio: profile.bio ?? '' }
}

/** Only the fields that differ from the saved profile are sent (API-USER-02 is a PATCH) */
function changedFields(values: ProfileFormValues, saved: UserProfileResponse) {
  const changes: Omit<UpdateProfileRequest, 'version'> = {}
  const fullName = collapseWhitespace(values.fullName)
  if (fullName !== saved.fullName) changes.fullName = fullName
  const schoolId = values.school?.id ?? null
  if (schoolId !== (saved.school?.id ?? null)) changes.schoolId = schoolId
  const bio = values.bio.trim() === '' ? null : values.bio.trim()
  if (bio !== (saved.bio ?? null)) changes.bio = bio
  return changes
}

export function ProfileForm({ initialProfile }: { initialProfile: UserProfileResponse }) {
  const { t } = useTranslation('profile')
  const { t: tCommon } = useTranslation()
  const { t: tAuth } = useTranslation('auth')
  const queryClient = useQueryClient()
  const [saved, setSaved] = useState(initialProfile)
  // Version sent with the next save; "keep my edits" moves it forward without touching the form (A6)
  const [version, setVersion] = useState(initialProfile.version)
  const [hasConflict, setHasConflict] = useState(false)
  const update = useUpdateMyProfile()
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: toValues(initialProfile),
    mode: 'onTouched',
  })
  const values = useWatch({ control: form.control }) as ProfileFormValues
  const hasChanges = Object.keys(changedFields(values, saved)).length > 0
  const isBusy = update.isPending

  const applySaved = (profile: UserProfileResponse) => {
    setSaved(profile)
    setVersion(profile.version)
    form.reset(toValues(profile))
    queryClient.setQueryData(getGetMyProfileQueryKey(), profile)
  }

  // The photo is saved by its own API: only the photo changes, the fields being edited stay as they are
  const applyAvatar = (avatar: AvatarResponse | null) => {
    const urls = { avatarUrl: avatar?.avatarUrl, avatarThumbUrl: avatar?.avatarThumbUrl }
    setSaved((current) => ({ ...current, ...urls }))
    queryClient.setQueryData<UserProfileResponse>(getGetMyProfileQueryKey(), (current) =>
      current ? { ...current, ...urls } : current,
    )
    const { user, setUser } = useAuthStore.getState()
    if (user) setUser({ ...user, avatarUrl: avatar?.avatarUrl })
  }

  const onError = (error: unknown) => {
    const apiError = toApiError(error)
    if (apiError.code === 'USER_VERSION_CONFLICT') return setHasConflict(true)
    if (apiError.code === 'VALIDATION_ERROR' && apiError.fieldErrors.length > 0) {
      apiError.fieldErrors.forEach(({ field }, index) => {
        const mapped = FIELD_ERRORS[field]
        if (mapped)
          form.setError(mapped.field, { message: mapped.message }, { shouldFocus: index === 0 })
        else toast.error(tCommon('error.generic'))
        // The school list is out of date: drop the cached copy so the picker reloads it
        if (field === 'schoolId') {
          void queryClient.invalidateQueries({ queryKey: getListActiveSchoolsQueryKey() })
        }
      })
      return
    }
    if (apiError.code === 'AUTH_RATE_LIMITED') {
      return toast.error(tAuth('message.rateLimited', { count: apiError.retryAfterSeconds ?? 0 }))
    }
    toast.error(tCommon(apiError.isNetworkError ? 'error.network' : 'error.generic'))
  }

  const submit = form.handleSubmit((formValues) => {
    const changes = changedFields(formValues, saved)
    if (Object.keys(changes).length === 0) return
    update.mutate(
      { data: { version, ...changes } },
      {
        onSuccess: (profile) => {
          applySaved(profile)
          setHasConflict(false)
          toast.success(t('message.saved'))
          // The header shows the name of the signed-in user
          const { user, setUser } = useAuthStore.getState()
          if (user) setUser({ ...user, fullName: profile.fullName })
        },
        onError,
      },
    )
  })

  // A5: drop the edits and show the latest version
  const reload = async () => {
    try {
      applySaved(await getMyProfile())
      setHasConflict(false)
    } catch {
      toast.error(tCommon('error.generic'))
    }
  }

  // A6: keep the edits, only take the latest version so that the next save overwrites it
  const keepEditing = async () => {
    try {
      const latest = await getMyProfile()
      setVersion(latest.version)
      setHasConflict(false)
    } catch {
      toast.error(tCommon('error.generic'))
    }
  }

  // Ctrl+Enter saves while the focus is in the form (A3)
  const formRef = useRef<HTMLFormElement>(null)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || !(event.ctrlKey || event.metaKey)) return
      if (!formRef.current?.contains(event.target as Node)) return
      event.preventDefault()
      formRef.current.requestSubmit()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const bioLength = textLength(values.bio ?? '')
  return (
    <form
      onSubmit={submit}
      ref={formRef}
      noValidate
      aria-busy={isBusy}
      className="flex flex-col gap-5"
    >
      <UnsavedChangesDialog when={hasChanges && !isBusy} />
      <p className="-mt-1 text-sm text-muted-foreground">{t('description')}</p>

      {hasConflict && (
        <Alert className="border-highlight bg-highlight-soft text-highlight-text">
          <TriangleAlert aria-hidden />
          <AlertTitle>{t('message.conflictTitle')}</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center justify-between gap-2 text-highlight-text">
            <span>{t('message.conflictDescription')}</span>
            <span className="flex gap-2">
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

      <AvatarSection
        userId={saved.id}
        fullName={saved.fullName}
        avatarUrl={saved.avatarUrl}
        disabled={isBusy}
        onChange={applyAvatar}
      />

      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="font-heading text-base leading-6 font-semibold">{t('info.title')}</h2>
          </CardTitle>
          <CardDescription>{t('info.description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
          <FormTextField
            control={form.control}
            name="fullName"
            label={t('field.fullName')}
            autoComplete="name"
            disabled={isBusy}
          />
          <ReadOnlyField
            id="profile-email"
            label={t('field.email')}
            value={saved.email}
            hint={t('field.emailHint')}
          />
          <ReadOnlyField
            id="profile-user-code"
            label={t('field.userCode')}
            value={saved.userCode}
            hint={t('field.userCodeHint')}
            mono
          />
          <Controller
            control={form.control}
            name="school"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="profile-school">
                  {t('field.school')}{' '}
                  <span className="font-normal text-muted-foreground">{t('field.optional')}</span>
                </FieldLabel>
                <SchoolCombobox
                  id="profile-school"
                  value={field.value}
                  onChange={(school) => {
                    field.onChange(school)
                    form.clearErrors('school')
                  }}
                  disabled={isBusy}
                  invalid={fieldState.invalid}
                  aria-describedby={fieldState.invalid ? 'profile-school-error' : undefined}
                />
                {fieldState.error?.message && (
                  <FieldError id="profile-school-error">
                    {translateKey(fieldState.error.message)}
                  </FieldError>
                )}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="bio"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="md:col-span-2">
                <FieldLabel htmlFor="profile-bio">
                  {t('field.bio')}{' '}
                  <span className="font-normal text-muted-foreground">{t('field.optional')}</span>
                </FieldLabel>
                <div className="relative">
                  <Textarea
                    {...field}
                    id="profile-bio"
                    rows={4}
                    placeholder={t('field.bioPlaceholder')}
                    disabled={isBusy}
                    aria-invalid={fieldState.invalid}
                    aria-describedby="profile-bio-count"
                    className="min-h-24 resize-y bg-card pb-6"
                  />
                  <span
                    id="profile-bio-count"
                    className={cn(
                      'pointer-events-none absolute right-3 bottom-2 text-xs text-muted-foreground',
                      bioLength > BIO_MAX_LENGTH && 'text-destructive-text',
                    )}
                  >
                    {bioLength}/{BIO_MAX_LENGTH}
                  </span>
                </div>
                {fieldState.error?.message && (
                  <FieldError>{translateKey(fieldState.error.message)}</FieldError>
                )}
              </Field>
            )}
          />
        </CardContent>
        {/* Below 768 px the save bar sticks to the bottom of the screen */}
        <CardFooter className="sticky bottom-0 z-10 justify-end gap-2 border-t bg-card/95 backdrop-blur md:static md:border-t-0 md:bg-transparent">
          {hasChanges && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => form.reset(toValues(saved))}
              disabled={isBusy}
            >
              {t('action.discard')}
            </Button>
          )}
          <Button type="submit" disabled={!hasChanges || isBusy}>
            {isBusy && <Loader2 className="animate-spin" aria-hidden />}
            {isBusy ? t('action.saving') : t('action.save')}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

interface ReadOnlyFieldProps {
  id: string
  label: string
  value: string
  hint: string
  mono?: boolean
}

function ReadOnlyField({ id, label, value, hint, mono }: ReadOnlyFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        value={value}
        readOnly
        aria-describedby={`${id}-hint`}
        className={cn('bg-muted text-muted-foreground', mono && 'font-mono')}
      />
      <FieldDescription id={`${id}-hint`}>{hint}</FieldDescription>
    </Field>
  )
}
