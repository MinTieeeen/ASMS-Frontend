/**
 * @file Compact header of the group workspace: breadcrumb, group name and my role, members, group code and the
 *   concept role switcher. Subject, semester, lecturer and topic live in the overview's group info card.
 * @author MinhTien
 * @version 2.0.0
 * @since 2026-10-16
 * @modified 2026-11-03
 */

import { Copy } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AvatarStack, GroupRoleBadge } from '@/components/common'
import { Button } from '@/components/ui/button'
import { useCopyToClipboard } from '@/hooks'
import { type GroupWorkspace, type MockUser, useUserMap } from '@/mocks'

import { GroupBreadcrumb } from './GroupBreadcrumb'
import { RoleSwitcher } from './RoleSwitcher'

export function GroupHeader({ workspace }: { workspace: GroupWorkspace }) {
  const { t } = useTranslation('groups')
  const { t: tCommon } = useTranslation()
  const users = useUserMap()
  const copy = useCopyToClipboard()
  const { group, role, actualRole, members } = workspace
  const people = members.flatMap((item) => (users[item.userId] ? [users[item.userId] as MockUser] : []))

  return (
    <header className="flex flex-col gap-2.5">
      <GroupBreadcrumb group={group} />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
          <h1 className="min-w-0 truncate font-heading text-xl leading-7 font-semibold tracking-[-0.01em]">{group.name}</h1>
          <GroupRoleBadge role={role} />
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <AvatarStack people={people} max={5} label={tCommon('domain.members', { count: people.length })} />
          <Button variant="outline" size="sm" onClick={() => copy(group.joinCode)} aria-label={t('header.copyCode', { code: group.joinCode })}>
            <span className="font-mono tracking-widest">{group.joinCode}</span>
            <Copy aria-hidden />
          </Button>
          <RoleSwitcher groupId={group.id} role={role} actualRole={actualRole} />
        </div>
      </div>
    </header>
  )
}
