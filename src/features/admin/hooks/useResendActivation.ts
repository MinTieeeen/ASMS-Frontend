/**
 * @file "Resend activation email" from the user list and the user detail (UC-AUTH-08, API-AUTH-13).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-04
 * @modified 2026-10-04
 */

import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { useResendActivationEmail } from '@/api/generated/endpoints/admin-users/admin-users'
import { toApiError } from '@/api/http-client'

/** @param onStale called when the row is out of date (no longer pending, deleted) so the caller reloads it */
export function useResendActivation(onStale: () => void) {
  const { t: tAuth } = useTranslation('auth')
  const { t: tCommon } = useTranslation()
  const resend = useResendActivationEmail()

  const resendActivation = (user: { id: string; email: string }) =>
    resend.mutate(
      { userId: user.id },
      {
        onSuccess: () => toast.success(tAuth('message.activationResent', { email: user.email })),
        onError: (error) => {
          const apiError = toApiError(error)
          switch (apiError.code) {
            case 'USER_NOT_PENDING':
              toast.info(tAuth('message.userNotPending'))
              return onStale()
            case 'AUTH_RATE_LIMITED':
              return toast.error(
                tAuth('message.rateLimited', { count: apiError.retryAfterSeconds ?? 0 }),
              )
            case 'AUTH_FORBIDDEN':
              return toast.error(tCommon('error.forbidden'))
            default:
              toast.error(tCommon(apiError.isNetworkError ? 'error.network' : 'error.generic'))
              if (apiError.status === 404) onStale()
          }
        },
      },
    )

  return { resendActivation, isResending: resend.isPending }
}
