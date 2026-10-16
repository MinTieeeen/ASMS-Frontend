/**
 * @file Row menu of a member (F03.05-F03.07): make deputy / member (BR01: at most 2 deputies), transfer leadership,
 *   remove from the group. Only the leader sees it.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { Crown, Ellipsis, ShieldCheck, UserMinus, UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Member } from '@/mocks'

interface MemberActionsProps {
  member: Member
  fullName: string
  isDeputyLimitReached: boolean
  onMakeDeputy: () => void
  onMakeMember: () => void
  onTransfer: () => void
  onRemove: () => void
}

export function MemberActions({
  member,
  fullName,
  isDeputyLimitReached,
  onMakeDeputy,
  onMakeMember,
  onTransfer,
  onRemove,
}: MemberActionsProps) {
  const { t } = useTranslation('groups')
  if (member.role === 'leader') return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={t('members.actionsFor', { name: fullName })}>
          <Ellipsis aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        {member.role === 'member' ? (
          <DropdownMenuItem disabled={isDeputyLimitReached} onSelect={onMakeDeputy} className="flex-wrap">
            <ShieldCheck aria-hidden />
            {t('members.makeDeputy')}
            {isDeputyLimitReached && (
              <span className="basis-full pl-6 text-xs text-muted-foreground">{t('members.deputyLimit')}</span>
            )}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={onMakeMember}>
            <UserRound aria-hidden />
            {t('members.makeMember')}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={onTransfer}>
          <Crown aria-hidden />
          {t('members.transfer')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onRemove}>
          <UserMinus aria-hidden />
          {t('members.remove')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
