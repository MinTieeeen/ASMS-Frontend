/**
 * @file Forgot password page, SCR-AUTH-02 (UC-AUTH-04 steps 1-3, FR-AUTH-12, FR-AUTH-13).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { toast } from 'sonner'

import { useRequestPasswordReset } from '@/api/generated/endpoints/auth/auth'
import { toApiError } from '@/api/http-client'
import { FormTextField } from '@/components/form'
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { FORGOT_RESEND_COOLDOWN_SECONDS } from '@/config/constants'
import { ROUTES } from '@/config/routes'

import { AuthBanner } from '../components/AuthBanner'
import { useAuthBanner } from '../hooks/useAuthBanner'
import { useCountdown } from '../hooks/useCountdown'
import { type ForgotPasswordFormValues, forgotPasswordSchema } from '../schemas/login.schema'
import { applyFieldErrors } from '../utils/field-errors'

export default function ForgotPasswordPage() {
  const { t } = useTranslation('auth')
  const { t: tCommon } = useTranslation()
  const [sentTo, setSentTo] = useState<string | null>(null)
  const banner = useAuthBanner()
  const cooldown = useCountdown()
  const request = useRequestPasswordReset()
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onTouched',
  })

  useEffect(() => {
    if (sentTo === null) form.setFocus('email')
  }, [form, sentTo])

  // A2: the answer is the same whether or not the email exists (FR-AUTH-12)
  const onSubmit = form.handleSubmit(({ email: value }) => {
    request.mutate(
      { data: { email: value } },
      {
        onSuccess: () => {
          banner.clear()
          setSentTo(value)
          cooldown.start(FORGOT_RESEND_COOLDOWN_SECONDS)
        },
        onError: (error) => {
          if (!applyFieldErrors(error, form.setError)) banner.showError(error)
        },
      },
    )
  })

  const resendErrorMessage = (error: unknown): string => {
    const apiError = toApiError(error)
    if (apiError.code === 'AUTH_RATE_LIMITED') {
      return t('message.rateLimited', { count: apiError.retryAfterSeconds ?? 0 })
    }
    return apiError.isNetworkError ? tCommon('error.network') : tCommon('error.generic')
  }

  // A3: resend with the same email; results are toasts because the form is hidden
  const resend = () => {
    if (!sentTo) return
    request.mutate(
      { data: { email: sentTo } },
      {
        onSuccess: () => {
          toast.success(t('forgot.resent'))
          cooldown.start(FORGOT_RESEND_COOLDOWN_SECONDS)
        },
        onError: (error) => toast.error(resendErrorMessage(error)),
      },
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <Button asChild variant="ghost" size="sm" className="-ml-3 self-start">
        <Link to={ROUTES.login}>
          <ArrowLeft aria-hidden />
          {t('forgot.backToLogin')}
        </Link>
      </Button>

      <header className="flex flex-col gap-1.5">
        <h1 className="text-[28px] leading-9 font-semibold tracking-[-0.015em]">
          {t('forgot.title')}
        </h1>
        {sentTo === null && (
          <p className="text-sm text-muted-foreground">{t('forgot.description')}</p>
        )}
      </header>

      {sentTo === null ? (
        <form onSubmit={onSubmit} noValidate aria-busy={request.isPending}>
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
              name="email"
              label={t('field.email')}
              type="email"
              autoComplete="username"
              placeholder={t('field.emailPlaceholder')}
              disabled={request.isPending}
            />
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={request.isPending || banner.isBlocked}
            >
              {request.isPending && <Loader2 className="animate-spin" aria-hidden />}
              {request.isPending ? t('forgot.submitting') : t('forgot.submit')}
            </Button>
          </FieldGroup>
        </form>
      ) : (
        <div
          role="status"
          className="flex flex-col items-center gap-3 rounded-xl border bg-background px-6 py-7 text-center"
        >
          <div className="flex size-13 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Mail className="size-6" aria-hidden />
          </div>
          <h2 className="text-xl leading-7 font-semibold">{t('forgot.sentTitle')}</h2>
          <p className="text-sm leading-[22px] text-muted-foreground">
            {t('message.resetLinkSent')}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('forgot.sentEmail')}{' '}
            <strong className="font-semibold text-foreground">{sentTo}</strong>
          </p>
          <Button
            variant="outline"
            className="mt-1 w-full"
            onClick={resend}
            disabled={cooldown.isRunning || request.isPending}
          >
            {request.isPending && <Loader2 className="animate-spin" aria-hidden />}
            {cooldown.isRunning
              ? t('forgot.resendIn', { count: cooldown.remaining })
              : t('forgot.resend')}
          </Button>
          <Button variant="link" className="font-semibold" onClick={() => setSentTo(null)}>
            {t('forgot.useOtherEmail')}
          </Button>
        </div>
      )}
    </div>
  )
}
