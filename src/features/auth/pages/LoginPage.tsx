/**
 * @file Login page, SCR-AUTH-01 (UC-AUTH-01, FR-AUTH-01 to FR-AUTH-06, FR-AUTH-25, FR-AUTH-26).
 * @author MinhTien
 * @version 2.0.0
 * @since 2026-09-26
 * @modified 2026-09-29
 */

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import { LOGIN_QUERY } from '@/config/routes'

import type { BannerKind } from '../components/AuthBanner'
import { LoginForm } from '../components/LoginForm'
import { LOGIN_NOTICES, type LoginNotice } from '../utils/redirect'

const NOTICE_BANNER: Record<LoginNotice, BannerKind> = {
  activated: 'activated',
  reset: 'reset',
  session_expired: 'sessionExpired',
  logged_out_all: 'loggedOutAll',
  account_locked: 'accountLocked',
}

function toNotice(value: string | null): LoginNotice | null {
  return LOGIN_NOTICES.find((notice) => notice === value) ?? null
}

export default function LoginPage() {
  const { t } = useTranslation('auth')
  const [searchParams, setSearchParams] = useSearchParams()
  // Read once: the message is then removed so a reload does not show it again (screen conventions, "msg")
  const [notice] = useState(() => toNotice(searchParams.get(LOGIN_QUERY.msg)))
  const [initialUserCode] = useState(() => searchParams.get(LOGIN_QUERY.userCode) ?? '')

  useEffect(() => {
    if (!searchParams.has(LOGIN_QUERY.msg)) return
    setSearchParams(
      (params) => {
        params.delete(LOGIN_QUERY.msg)
        return params
      },
      { replace: true },
    )
  }, [searchParams, setSearchParams])

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-5">
        <header className="flex flex-col gap-1.5">
          <h1 className="text-[28px] leading-9 font-semibold tracking-[-0.015em]">
            {t('login.title')}
          </h1>
          <p className="text-sm text-muted-foreground">{t('login.description')}</p>
        </header>
        <LoginForm
          initialUserCode={initialUserCode}
          initialNotice={notice ? NOTICE_BANNER[notice] : null}
        />
      </div>
      <p className="text-center text-sm text-muted-foreground">{t('login.footer')}</p>
    </div>
  )
}
