/**
 * @file Members who left or were removed (BR10): kept with the date and reason so their history stays readable.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { useTranslation } from 'react-i18next'

import { UserAvatar } from '@/components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type Member, useUserMap } from '@/mocks'
import { formatDate } from '@/utils/date'

export function FormerMembers({ members }: { members: Member[] }) {
  const { t } = useTranslation('groups')
  const users = useUserMap()
  if (members.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('members.former')}</CardTitle>
        <CardDescription>{t('members.formerHint')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="-my-2.5 divide-y">
          {members.map((member) => {
            const fullName = users[member.userId]?.fullName ?? '?'
            return (
              <li key={member.id} className="flex items-center gap-3 py-2.5 text-muted-foreground">
                <UserAvatar userId={member.userId} fullName={fullName} size={28} className="opacity-70" />
                <span className="min-w-0 flex-1 truncate text-sm">{fullName}</span>
                <span className="shrink-0 text-xs">
                  {member.status === 'removed' ? t('members.removed') : t('members.left')}
                  {member.leftAt && ` · ${formatDate(member.leftAt)}`}
                </span>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
