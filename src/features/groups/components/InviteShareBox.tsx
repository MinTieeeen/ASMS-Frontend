/**
 * @file Group code and invite link with copy buttons (UC04 step 1, BR04); the leader can make a new code, which
 *   disables the old link at once.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { Copy, Link2, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ConfirmDialog } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ROUTES } from '@/config/routes'
import { useCopyToClipboard } from '@/hooks'
import type { Group } from '@/mocks'
import { formatDate } from '@/utils/date'

interface InviteShareBoxProps {
  group: Group
  /** Shown only to whoever may regenerate (leader) */
  onRegenerate?: () => void
}

export function InviteShareBox({ group, onRegenerate }: InviteShareBoxProps) {
  const { t } = useTranslation('groups')
  const { t: tCommon } = useTranslation()
  const copy = useCopyToClipboard()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const link = `${window.location.origin}${ROUTES.joinGroup(group.joinCode)}`

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 p-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{t('invite.code')}</p>
          <p className="font-mono text-2xl font-semibold tracking-[0.3em]">{group.joinCode}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => copy(group.joinCode)}>
          <Copy aria-hidden />
          {tCommon('action.copy')}
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`invite-link-${group.id}`} className="text-sm font-medium">
          {t('invite.link')}
        </label>
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Link2 className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground" aria-hidden />
            <Input id={`invite-link-${group.id}`} value={link} readOnly className="pl-9 font-mono text-xs" onFocus={(event) => event.currentTarget.select()} />
          </div>
          <Button variant="outline" onClick={() => copy(link)} aria-label={t('invite.copyLink')}>
            <Copy aria-hidden />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {group.inviteExpiresAt
            ? t('invite.expiresAt', { date: formatDate(group.inviteExpiresAt) })
            : t('invite.noExpiry')}
          {' · '}
          {group.requireApproval ? t('invite.needsApproval') : t('invite.joinsDirectly')}
        </p>
      </div>

      {onRegenerate && (
        <>
          <Button variant="ghost" size="sm" className="self-start" onClick={() => setIsConfirmOpen(true)}>
            <RefreshCw aria-hidden />
            {t('invite.regenerate')}
          </Button>
          <ConfirmDialog
            open={isConfirmOpen}
            onOpenChange={setIsConfirmOpen}
            title={t('invite.regenerateTitle')}
            description={t('invite.regenerateDescription')}
            confirmLabel={t('invite.regenerate')}
            cancelLabel={tCommon('action.cancel')}
            onConfirm={() => {
              onRegenerate()
              setIsConfirmOpen(false)
            }}
          />
        </>
      )}
    </div>
  )
}
