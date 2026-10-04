/**
 * @file Page GitHub sends the browser back to (SCR-USER-01 A11): finishes the connection with the code and state of
 *   the URL (API-USER-18), then returns to the profile.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-04
 * @modified 2026-10-04
 */

import { Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { completeGithubConnection } from '@/api/generated/endpoints/git-hub/git-hub'
import { toApiError } from '@/api/http-client'
import { ROUTES } from '@/config/routes'

import type { GithubConnectError } from '../components/GithubCard'

/** Navigation state read by the profile page to show the error inside the GitHub block */
export interface GithubCallbackState {
  githubError?: GithubConnectError
}

export default function GithubCallbackPage() {
  const { t } = useTranslation('profile')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // The code works once: React's development double effect must not send it twice
  const isStarted = useRef(false)

  useEffect(() => {
    if (isStarted.current) return
    isStarted.current = true
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const back = (navState?: GithubCallbackState) =>
      navigate(ROUTES.profileSettings, { replace: true, state: navState })

    if (searchParams.get('error') === 'access_denied') {
      toast.info(t('github.cancelled'))
      back()
      return
    }
    if (!code || !state) {
      back({ githubError: 'stateInvalid' })
      return
    }
    completeGithubConnection({ code, state })
      .then((account) => {
        toast.success(t('github.connectedToast', { login: account.login }))
        back()
      })
      .catch((caught: unknown) => back({ githubError: connectErrorOf(caught) }))
  }, [navigate, searchParams, t])

  return (
    <div className="flex items-center gap-2.5 text-sm text-muted-foreground" role="status">
      <Loader2 className="size-4 animate-spin" aria-hidden />
      {t('github.connecting')}
    </div>
  )
}

function connectErrorOf(caught: unknown): GithubConnectError | undefined {
  switch (toApiError(caught).code) {
    // Connected meanwhile (another tab): the profile shows the account, nothing to report
    case 'GITHUB_ALREADY_CONNECTED':
      return undefined
    case 'GITHUB_ACCOUNT_IN_USE':
      return 'inUse'
    case 'GITHUB_STATE_INVALID':
      return 'stateInvalid'
    case 'GITHUB_UNAVAILABLE':
      return 'unavailable'
    default:
      return 'generic'
  }
}
