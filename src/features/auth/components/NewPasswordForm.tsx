/**
 * @file "Set a password" form shared by reset (SCR-AUTH-03) and activation (SCR-AUTH-04): new password, live
 * criteria, confirmation.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { toApiError } from '@/api/http-client'
import { FormPasswordField } from '@/components/form'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PASSWORD_MAX_LENGTH } from '@/config/constants'

import { useAuthBanner } from '../hooks/useAuthBanner'
import { type NewPasswordFormValues, newPasswordSchema } from '../schemas/new-password.schema'
import { applyFieldErrors } from '../utils/field-errors'
import { AuthBanner } from './AuthBanner'
import { PasswordCriteriaList } from './PasswordCriteriaList'

interface NewPasswordFormProps {
  /** Full email: enables the email criterion; `null` on the reset page, where only a masked email is known */
  email: string | null
  /** Read-only email field shown above the password (activation, component 3) */
  showEmailField?: boolean
  passwordLabel: string
  submitLabel: string
  submittingLabel: string
  isPending: boolean
  /** Calls the API; a rejected promise is handled here */
  onSubmit: (password: string) => Promise<unknown>
  /** AUTH_TOKEN_INVALID: the page switches to its "link no longer valid" state */
  onTokenInvalid: () => void
  /** AUTH_ACCOUNT_ALREADY_ACTIVE (activation only) */
  onAlreadyActive?: () => void
}

export function NewPasswordForm({
  email,
  showEmailField = false,
  passwordLabel,
  submitLabel,
  submittingLabel,
  isPending,
  onSubmit,
  onTokenInvalid,
  onAlreadyActive,
}: NewPasswordFormProps) {
  const { t } = useTranslation('auth')
  const banner = useAuthBanner()
  const [serverViolations, setServerViolations] = useState<string[]>([])
  const schema = useMemo(() => newPasswordSchema(email), [email])
  const form = useForm<NewPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onTouched',
  })
  const password = useWatch({ control: form.control, name: 'password' })

  useEffect(() => {
    form.setFocus('password')
  }, [form])

  const handleError = (error: unknown) => {
    const apiError = toApiError(error)
    switch (apiError.code) {
      case 'AUTH_TOKEN_INVALID':
        return onTokenInvalid()
      case 'AUTH_ACCOUNT_ALREADY_ACTIVE':
        return onAlreadyActive?.()
      case 'AUTH_PASSWORD_POLICY':
        setServerViolations(apiError.violations)
        return form.setError(
          'password',
          { message: 'auth:message.passwordPolicy' },
          { shouldFocus: true },
        )
      case 'AUTH_PASSWORD_SAME_AS_OLD':
        return form.setError(
          'password',
          { message: 'auth:message.passwordSameAsOld' },
          { shouldFocus: true },
        )
      default:
        if (!applyFieldErrors(error, form.setError, { newPassword: 'password' }))
          banner.showError(error)
    }
  }

  const submit = form.handleSubmit(async (values) => {
    setServerViolations([])
    banner.clear()
    await onSubmit(values.password).catch(handleError)
  })

  return (
    <form onSubmit={submit} noValidate aria-busy={isPending}>
      <FieldGroup className="gap-4">
        {banner.kind && (
          <AuthBanner
            kind={banner.kind}
            remainingSeconds={banner.remainingSeconds}
            onDismiss={banner.clear}
          />
        )}
        {showEmailField && email && (
          <Field>
            <FieldLabel htmlFor="new-password-email">{t('field.email')}</FieldLabel>
            <Input
              id="new-password-email"
              type="email"
              autoComplete="username"
              value={email}
              readOnly
            />
          </Field>
        )}
        <FormPasswordField
          control={form.control}
          name="password"
          label={passwordLabel}
          autoComplete="new-password"
          maxLength={PASSWORD_MAX_LENGTH}
          aria-describedby="new-password-criteria"
          disabled={isPending}
        >
          <PasswordCriteriaList
            id="new-password-criteria"
            password={password}
            email={email}
            isSubmitted={form.formState.isSubmitted}
            serverViolations={serverViolations}
          />
        </FormPasswordField>
        <FormPasswordField
          control={form.control}
          name="confirmPassword"
          label={t('field.confirmPassword')}
          autoComplete="new-password"
          maxLength={PASSWORD_MAX_LENGTH}
          disabled={isPending}
        />
        <Button type="submit" size="lg" className="w-full" disabled={isPending || banner.isBlocked}>
          {isPending && <Loader2 className="animate-spin" aria-hidden />}
          {isPending ? submittingLabel : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  )
}
