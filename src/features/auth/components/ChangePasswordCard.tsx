/**
 * @file "Change password" card of SCR-AUTH-05 (UC-AUTH-06, FR-AUTH-19, actions A2, A3).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  getCurrentUser,
  getListSessionsQueryKey,
  useChangePassword,
} from '@/api/generated/endpoints/auth/auth'
import type { CurrentUserResponse } from '@/api/generated/models'
import { toApiError } from '@/api/http-client'
import { FormPasswordField } from '@/components/form'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PASSWORD_MAX_LENGTH } from '@/config/constants'
import { ROUTES } from '@/config/routes'
import { useAuthStore } from '@/stores/auth.store'
import { formatDateTime } from '@/utils/date'

import { useAuthBanner } from '../hooks/useAuthBanner'
import {
  type ChangePasswordFormValues,
  changePasswordSchema,
} from '../schemas/change-password.schema'
import { applyFieldErrors } from '../utils/field-errors'
import { AuthBanner } from './AuthBanner'
import { PasswordCriteriaList } from './PasswordCriteriaList'

const EMPTY: ChangePasswordFormValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

export function ChangePasswordCard({ user }: { user: CurrentUserResponse }) {
  const { t } = useTranslation('auth')
  const { t: tCommon } = useTranslation()
  const queryClient = useQueryClient()
  const banner = useAuthBanner()
  const [serverViolations, setServerViolations] = useState<string[]>([])
  const schema = useMemo(() => changePasswordSchema(user.email), [user.email])
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
    mode: 'onTouched',
  })
  const values = useWatch({ control: form.control })
  const change = useChangePassword()
  const isEmpty = !values.currentPassword && !values.newPassword && !values.confirmPassword

  const clearForm = () => {
    form.reset(EMPTY)
    setServerViolations([])
    banner.clear()
  }

  // A2 success: this device stays signed in, the others are gone; refresh "last changed" and the device list
  const onSuccess = async () => {
    toast.success(t('message.passwordChanged'))
    clearForm()
    useAuthStore.getState().setUser(await getCurrentUser())
    await queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() })
  }

  const onError = (error: unknown) => {
    const apiError = toApiError(error)
    switch (apiError.code) {
      case 'AUTH_CURRENT_PASSWORD_WRONG':
        form.setValue('currentPassword', '')
        return form.setError(
          'currentPassword',
          { message: 'auth:message.currentPasswordWrong' },
          { shouldFocus: true },
        )
      case 'AUTH_PASSWORD_POLICY':
        setServerViolations(apiError.violations)
        return form.setError(
          'newPassword',
          { message: 'auth:message.passwordPolicy' },
          { shouldFocus: true },
        )
      case 'AUTH_PASSWORD_SAME_AS_OLD':
        return form.setError(
          'newPassword',
          { message: 'auth:message.passwordSameAsOld' },
          { shouldFocus: true },
        )
      case 'AUTH_ACCOUNT_TEMP_LOCKED':
        // UC-AUTH-06 3a: this session was revoked; the lockout message appears at the next login attempt
        queryClient.clear()
        return useAuthStore.getState().setAnonymous(ROUTES.login)
      default:
        if (!applyFieldErrors(error, form.setError)) banner.showError(error)
    }
  }

  const submit = form.handleSubmit(({ currentPassword, newPassword }) => {
    setServerViolations([])
    banner.clear()
    change.mutate({ data: { currentPassword, newPassword } }, { onSuccess, onError })
  })

  const isBusy = change.isPending
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="font-heading text-base leading-6 font-semibold">
            {t('security.changePasswordTitle')}
          </h2>
        </CardTitle>
        {user.passwordChangedAt && (
          <CardDescription>
            {t('security.lastChanged', { time: formatDateTime(user.passwordChangedAt) })}
          </CardDescription>
        )}
      </CardHeader>
      <form onSubmit={submit} noValidate aria-busy={isBusy} className="contents">
        <CardContent className="flex flex-col gap-4">
          {banner.kind && (
            <AuthBanner
              kind={banner.kind}
              remainingSeconds={banner.remainingSeconds}
              onDismiss={banner.clear}
            />
          )}
          <div className="grid grid-cols-1 gap-x-7 gap-y-4 md:grid-cols-2">
            <div className="flex flex-col gap-3.5">
              <FormPasswordField
                control={form.control}
                name="currentPassword"
                label={t('security.currentPassword')}
                autoComplete="current-password"
                disabled={isBusy}
              />
              <FormPasswordField
                control={form.control}
                name="newPassword"
                label={t('security.newPassword')}
                autoComplete="new-password"
                maxLength={PASSWORD_MAX_LENGTH}
                aria-describedby="change-password-criteria"
                disabled={isBusy}
              />
              <FormPasswordField
                control={form.control}
                name="confirmPassword"
                label={t('security.confirmNewPassword')}
                autoComplete="new-password"
                maxLength={PASSWORD_MAX_LENGTH}
                disabled={isBusy}
              />
            </div>
            <div className="flex flex-col gap-2.5 self-start rounded-lg bg-background px-4 py-3.5">
              <p className="text-[13px] font-semibold">{t('security.criteriaTitle')}</p>
              <PasswordCriteriaList
                id="change-password-criteria"
                password={values.newPassword ?? ''}
                email={user.email}
                isSubmitted={form.formState.isSubmitted}
                serverViolations={serverViolations}
                className="bg-transparent p-0"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t-0 bg-transparent">
          {!isEmpty && (
            <Button type="button" variant="ghost" onClick={clearForm} disabled={isBusy}>
              {tCommon('action.cancel')}
            </Button>
          )}
          <Button type="submit" disabled={isEmpty || isBusy || banner.isBlocked}>
            {isBusy && <Loader2 className="animate-spin" aria-hidden />}
            {isBusy ? t('security.saving') : t('security.save')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
