/**
 * @file Confirmation before logging out of every device, SCR-AUTH-07 component 10 (FR-AUTH-11).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/common'

import { useLogout } from '../hooks/useLogout'

interface LogoutAllDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** A4: on success the user lands on /login with MSG-29; on another error the dialog stays open with MSG-21. */
export function LogoutAllDialog({ open, onOpenChange }: LogoutAllDialogProps) {
  const { t } = useTranslation('auth')
  const { t: tCommon } = useTranslation()
  const { logoutEveryDevice, isLoggingOutAll } = useLogout()

  const confirm = async () => {
    try {
      await logoutEveryDevice()
    } catch {
      toast.error(tCommon('error.generic'))
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('menu.logoutAllTitle')}
      description={t('menu.logoutAllDescription')}
      confirmLabel={t('menu.logoutAllConfirm')}
      cancelLabel={tCommon('action.cancel')}
      onConfirm={confirm}
      isPending={isLoggingOutAll}
    />
  )
}
