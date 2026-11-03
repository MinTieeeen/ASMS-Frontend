/**
 * @file How people join the group (UC04, BR04): whether a join needs approval and when the invite code and link
 *   expire. Each change is saved at once.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { type Group, useMockStore } from '@/mocks'
import { formatDateTime } from '@/utils/date'

import { SettingSwitch } from './SettingSwitch'

const DAY_MS = 86_400_000
const EXPIRY_OPTIONS = ['none', '1', '7', '30'] as const

export function JoinSettings({ group, canEdit }: { group: Group; canEdit: boolean }) {
  const { t } = useTranslation('groups')
  const updateGroup = useMockStore((state) => state.updateGroup)
  const [now] = useState(() => Date.now())
  const isExpired = !!group.inviteExpiresAt && new Date(group.inviteExpiresAt).getTime() < now

  const setExpiry = (option: string) => {
    const days = Number(option)
    updateGroup(group.id, {
      inviteExpiresAt: option === 'none' ? null : new Date(Date.now() + days * DAY_MS).toISOString(),
    })
    toast.success(t('settings.join.saved'))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.join.title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <SettingSwitch
          id="setting-require-approval"
          label={t('settings.join.requireApproval')}
          hint={t('settings.join.requireApprovalHint')}
          checked={group.requireApproval}
          disabled={!canEdit}
          onCheckedChange={(checked) => {
            updateGroup(group.id, { requireApproval: checked })
            toast.success(t('settings.join.saved'))
          }}
        />
        <div className="flex flex-col gap-1.5 border-t pt-4">
          <Label htmlFor="setting-invite-expiry">{t('settings.join.expiry')}</Label>
          <p className={cn('text-sm font-medium', isExpired && 'text-destructive-text')}>
            {!group.inviteExpiresAt
              ? t('settings.join.noExpiry')
              : t(isExpired ? 'settings.join.expired' : 'settings.join.expiresAt', {
                  date: formatDateTime(group.inviteExpiresAt),
                })}
          </p>
          <p className="text-[13px] text-muted-foreground">{t('settings.join.expiryHint')}</p>
          {canEdit && (
            // Always back on the placeholder: each pick is an action, not a stored choice
            <Select value="" onValueChange={setExpiry}>
              <SelectTrigger id="setting-invite-expiry" className="mt-1 w-64">
                <SelectValue placeholder={t('settings.join.change')} />
              </SelectTrigger>
              <SelectContent>
                {EXPIRY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {t(`settings.join.option.${option}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
