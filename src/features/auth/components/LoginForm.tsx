/**
 * @file Login form of SCR-AUTH-01 (components 3 to 10, actions A2 to A6, UC-AUTH-01).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useLogin } from '@/api/generated/endpoints/auth/auth'
import { FormPasswordField, FormTextField } from '@/components/form'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FieldGroup } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { LOGIN_PASSWORD_MAX_LENGTH, USER_CODE_MAX_LENGTH } from '@/config/constants'
import { ROUTES } from '@/config/routes'
import { useAuthStore } from '@/stores/auth.store'

import { useAuthBanner } from '../hooks/useAuthBanner'
import { type LoginFormValues, loginSchema } from '../schemas/login.schema'
import { applyFieldErrors } from '../utils/field-errors'
import { AuthBanner, type BannerKind } from './AuthBanner'

interface LoginFormProps {
  /** From `?userCode=` (after activation): pre-fills the User ID and focuses the password */
  initialUserCode: string
  /** From `?msg=`: notice shown when the page opens (S08) */
  initialNotice: BannerKind | null
}

/**
 * On success the session is stored and GuestOnly takes the user to `redirect` or the role's home page. The previous
 * account's query cache is cleared first (SCR-AUTH-01 notes).
 */
export function LoginForm({ initialUserCode, initialNotice }: LoginFormProps) {
  const { t } = useTranslation('auth')
  const queryClient = useQueryClient()
  const banner = useAuthBanner(initialNotice)
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { userCode: initialUserCode, password: '', rememberMe: false },
    mode: 'onTouched',
  })
  const login = useLogin()
  const isBusy = login.isPending

  // A1: focus the User ID, or the password when the User ID is pre-filled
  useEffect(() => {
    form.setFocus(initialUserCode ? 'password' : 'userCode')
  }, [form, initialUserCode])

  const onSubmit = form.handleSubmit((values) => {
    login.mutate(
      { data: values },
      {
        onSuccess: (session) => {
          queryClient.clear()
          useAuthStore.getState().setSession(session.accessToken, session.user)
        },
        onError: (error) => {
          if (applyFieldErrors(error, form.setError)) return
          banner.showError(error)
          // A4: after an error clear the password and focus it, keep the User ID and "remember me"
          form.setValue('password', '')
          form.setFocus('password')
        },
      },
    )
  })

  // A2: editing the credentials hides the "wrong User ID or password" banner
  const handleChange = () => {
    if (banner.kind === 'invalidCredentials') banner.clear()
  }

  return (
    <form onSubmit={onSubmit} onChange={handleChange} noValidate aria-busy={isBusy}>
      <FieldGroup>
        {banner.kind && (
          <AuthBanner
            kind={banner.kind}
            remainingSeconds={banner.remainingSeconds}
            onDismiss={banner.clear}
          />
        )}
        <FormTextField
          control={form.control}
          name="userCode"
          label={t('field.userCode')}
          autoComplete="username"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={USER_CODE_MAX_LENGTH}
          placeholder={t('field.userCodePlaceholder')}
          disabled={isBusy}
        />
        <FormPasswordField
          control={form.control}
          name="password"
          label={t('field.password')}
          autoComplete="current-password"
          placeholder={t('field.passwordPlaceholder')}
          maxLength={LOGIN_PASSWORD_MAX_LENGTH}
          showCapsLockHint
          disabled={isBusy}
        />
        <div className="flex items-start justify-between gap-3">
          <Controller
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="login-remember"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    aria-describedby="login-remember-hint"
                    disabled={isBusy}
                  />
                  <Label htmlFor="login-remember" className="font-normal">
                    {t('login.rememberMe')}
                  </Label>
                </div>
              </div>
            )}
          />
          <Link
            to={ROUTES.forgotPassword}
            className="rounded-sm text-sm font-semibold text-primary hover:text-primary-hover focus-visible:shadow-focus focus-visible:outline-none"
          >
            {t('login.forgotPassword')}
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={isBusy || banner.isBlocked}>
          {isBusy && <Loader2 className="animate-spin" aria-hidden />}
          {isBusy ? t('login.submitting') : t('login.submit')}
        </Button>
      </FieldGroup>
    </form>
  )
}
