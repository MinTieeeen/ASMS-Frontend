/**
 * @file Account activation page, SCR-AUTH-04 (UC-AUTH-05, FR-AUTH-15, FR-AUTH-17, FR-AUTH-18).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { useQuery } from '@tanstack/react-query'
import { CircleCheck } from 'lucide-react'
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'

import { useActivateAccount, validateActivationToken } from '@/api/generated/endpoints/auth/auth'
import { toApiError } from '@/api/http-client'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/config/routes'

import {
  InvalidLinkPanel,
  LinkCheckError,
  LinkCheckingSkeleton,
  ResultPanel,
} from '../components/AuthStatePanels'
import { NewPasswordForm } from '../components/NewPasswordForm'
import { useUrlToken } from '../hooks/useUrlToken'
import { loginPath } from '../utils/redirect'

type LinkState = 'checking' | 'invalid' | 'alreadyActive'

export default function ActivatePage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const token = useUrlToken()
  const [linkState, setLinkState] = useState<LinkState>(token === null ? 'invalid' : 'checking')
  const activate = useActivateAccount()

  const check = useQuery({
    queryKey: ['auth', 'activation-token', token],
    queryFn: ({ signal }) => validateActivationToken({ token: token ?? '' }, undefined, signal),
    enabled: token !== null,
    retry: false,
    gcTime: 0,
    refetchOnWindowFocus: false,
  })
  const checkCode = toApiError(check.error).code

  if (linkState === 'alreadyActive' || checkCode === 'AUTH_ACCOUNT_ALREADY_ACTIVE') {
    return (
      <ResultPanel
        role="status"
        icon={CircleCheck}
        tone="success"
        title={t('message.alreadyActive')}
        description={t('activate.alreadyActiveDescription')}
      >
        <Button asChild size="lg" className="w-full">
          <Link to={ROUTES.login}>{t('activate.goToLogin')}</Link>
        </Button>
      </ResultPanel>
    )
  }
  if (linkState === 'invalid' || checkCode === 'AUTH_TOKEN_INVALID') {
    return (
      <InvalidLinkPanel hint={t('activate.invalidHint')} requestLabel={t('activate.getNewLink')} />
    )
  }
  if (check.isError) {
    return <LinkCheckError error={check.error} onRetry={() => void check.refetch()} />
  }
  if (!check.data || token === null) {
    return <LinkCheckingSkeleton />
  }

  const { email, userCode, fullName } = check.data
  // A3: no automatic login; the login page opens with the User ID filled in and MSG-12
  const submit = (password: string) =>
    activate
      .mutateAsync({ data: { token, password } })
      .then(() => navigate(loginPath({ msg: 'activated', userCode }), { replace: true }))

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-[28px] leading-9 font-semibold tracking-[-0.015em]">
          {t('activate.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          <Trans
            t={t}
            i18nKey="activate.greeting"
            values={{ name: fullName }}
            components={{ bold: <strong className="font-semibold text-foreground" /> }}
          />
        </p>
      </header>
      <NewPasswordForm
        email={email}
        showEmailField
        passwordLabel={t('field.password')}
        submitLabel={t('activate.submit')}
        submittingLabel={t('activate.submitting')}
        isPending={activate.isPending}
        onSubmit={submit}
        onTokenInvalid={() => setLinkState('invalid')}
        onAlreadyActive={() => setLinkState('alreadyActive')}
      />
    </div>
  )
}
