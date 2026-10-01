/**
 * @file Reset password page, SCR-AUTH-03 (UC-AUTH-04 steps 4-9, FR-AUTH-14 to FR-AUTH-16, FR-AUTH-18).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { useQuery } from '@tanstack/react-query'
import { formatInTimeZone } from 'date-fns-tz'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { useResetPassword, validateResetToken } from '@/api/generated/endpoints/auth/auth'
import { toApiError } from '@/api/http-client'
import { Badge } from '@/components/ui/badge'
import { env } from '@/config/env'

import {
  InvalidLinkPanel,
  LinkCheckError,
  LinkCheckingSkeleton,
} from '../components/AuthStatePanels'
import { NewPasswordForm } from '../components/NewPasswordForm'
import { useUrlToken } from '../hooks/useUrlToken'
import { loginPath } from '../utils/redirect'

const TIME_FORMAT = 'HH:mm'

export default function ResetPasswordPage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const token = useUrlToken()
  const [isLinkInvalid, setIsLinkInvalid] = useState(token === null)
  const reset = useResetPassword()

  // A1: the token is checked before the form is shown (FR-AUTH-15)
  const check = useQuery({
    queryKey: ['auth', 'reset-token', token],
    queryFn: ({ signal }) => validateResetToken({ token: token ?? '' }, undefined, signal),
    enabled: token !== null,
    retry: false,
    gcTime: 0,
    refetchOnWindowFocus: false,
  })

  if (isLinkInvalid || toApiError(check.error).code === 'AUTH_TOKEN_INVALID') {
    return <InvalidLinkPanel requestLabel={t('link.requestNew')} />
  }
  if (check.isError) {
    return <LinkCheckError error={check.error} onRetry={() => void check.refetch()} />
  }
  if (!check.data || token === null) {
    return <LinkCheckingSkeleton />
  }

  // A3: no automatic login afterwards; every session was revoked by the server (FR-AUTH-16)
  const submit = (password: string) =>
    reset
      .mutateAsync({ data: { token, newPassword: password } })
      .then(() => navigate(loginPath({ msg: 'reset' }), { replace: true }))

  return (
    <div className="flex flex-col gap-4.5">
      <header className="flex flex-col gap-1">
        <h1 className="text-[28px] leading-9 font-semibold tracking-[-0.015em]">
          {t('reset.title')}
        </h1>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {t('reset.account')}{' '}
            <strong className="font-semibold text-foreground">{check.data.maskedEmail}</strong>
          </p>
          <Badge variant="secondary">
            {t('reset.validUntil', {
              time: formatInTimeZone(check.data.expiresAt, env.defaultTimezone, TIME_FORMAT),
            })}
          </Badge>
        </div>
      </header>
      <NewPasswordForm
        email={null}
        passwordLabel={t('field.newPassword')}
        submitLabel={t('reset.submit')}
        submittingLabel={t('reset.submitting')}
        isPending={reset.isPending}
        onSubmit={submit}
        onTokenInvalid={() => setIsLinkInvalid(true)}
      />
    </div>
  )
}
