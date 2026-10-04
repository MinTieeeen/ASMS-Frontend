/**
 * @file Photo block of SCR-USER-01 (3)–(5), (12): current avatar, "Change photo" (SCR-USER-02) and "Remove photo"
 *   with confirmation (API-USER-04). Changes take effect at once, outside the profile form's Save.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-04
 * @modified 2026-10-04
 */

import { Camera } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { useRemoveMyAvatar } from '@/api/generated/endpoints/profiles/profiles'
import type { AvatarResponse } from '@/api/generated/models'
import { toApiError } from '@/api/http-client'
import { ConfirmDialog, UserAvatar } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { AvatarDialog } from './AvatarDialog'

interface AvatarSectionProps {
  userId: string
  fullName: string
  avatarUrl?: string
  disabled?: boolean
  /** New URLs after an upload, {@code null} after removal */
  onChange: (avatar: AvatarResponse | null) => void
}

export function AvatarSection({
  userId,
  fullName,
  avatarUrl,
  disabled,
  onChange,
}: AvatarSectionProps) {
  const { t } = useTranslation('profile')
  const { t: tCommon } = useTranslation()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isRemoveOpen, setIsRemoveOpen] = useState(false)
  const remove = useRemoveMyAvatar()

  const confirmRemove = () =>
    remove.mutate(undefined, {
      onSuccess: () => {
        setIsRemoveOpen(false)
        toast.success(t('avatarDialog.removed'))
        onChange(null)
      },
      onError: (error) =>
        toast.error(tCommon(toApiError(error).isNetworkError ? 'error.network' : 'error.generic')),
    })

  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <UserAvatar userId={userId} fullName={fullName} avatarUrl={avatarUrl} size={96} />
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[15px] font-semibold">{t('avatar.title')}</span>
            <span className="text-[13px] leading-4.5 text-muted-foreground">
              {t('avatar.hint')}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={() => setIsDialogOpen(true)}
            >
              <Camera aria-hidden />
              {t('avatar.change')}
            </Button>
            {avatarUrl && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-destructive-text hover:text-destructive-text"
                disabled={disabled}
                onClick={() => setIsRemoveOpen(true)}
              >
                {t('avatar.remove')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      <AvatarDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onUploaded={onChange} />
      <ConfirmDialog
        open={isRemoveOpen}
        onOpenChange={setIsRemoveOpen}
        title={t('avatarDialog.removeTitle')}
        description={t('avatarDialog.removeDescription')}
        confirmLabel={t('avatar.remove')}
        cancelLabel={tCommon('action.cancel')}
        onConfirm={confirmRemove}
        isPending={remove.isPending}
      />
    </Card>
  )
}
