/**
 * @file Invite panel of the members page (F03.02): remaining spots, group code and invite link.
 * @author MinhTien
 * @version 2.0.0
 * @since 2026-10-16
 * @modified 2026-11-03
 */

import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type GroupWorkspace, useMockStore } from '@/mocks'

import { InviteShareBox } from './InviteShareBox'

// TODO(F03.02): invite by e-mail and pending e-mail invitations come back in GĐ2 (out of the reduced MVP scope)
export function InvitePanel({ workspace }: { workspace: GroupWorkspace }) {
  const { t } = useTranslation('groups')
  const { group, members, can } = workspace
  const regenerateJoinCode = useMockStore((state) => state.regenerateJoinCode)
  const isFull = members.length >= group.maxMembers

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('invite.title')}</CardTitle>
        <CardDescription>
          {isFull ? t('invite.full') : t('invite.slots', { count: group.maxMembers - members.length })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <InviteShareBox
          group={group}
          onRegenerate={can('changeRole') ? () => regenerateJoinCode(group.id) : undefined}
        />
      </CardContent>
    </Card>
  )
}
