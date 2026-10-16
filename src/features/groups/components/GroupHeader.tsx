/**
 * @file Header of the group workspace: back link, name and my role, subject / semester / lecturer (UC02), members,
 *   group code, and the concept role switcher.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { ChevronLeft, Copy, GraduationCap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { AvatarStack, GroupRoleBadge } from '@/components/common'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/config/routes'
import { useCopyToClipboard } from '@/hooks'
import { type GroupWorkspace, type MockUser, useUserMap } from '@/mocks'

import { RoleSwitcher } from './RoleSwitcher'

export function GroupHeader({ workspace }: { workspace: GroupWorkspace }) {
  const { t } = useTranslation('groups')
  const { t: tCommon } = useTranslation()
  const users = useUserMap()
  const copy = useCopyToClipboard()
  const { group, role, actualRole, members } = workspace
  const people = members.flatMap((item) => (users[item.userId] ? [users[item.userId] as MockUser] : []))
  const subject = [group.subjectCode, group.subjectName].filter(Boolean).join(' · ')

  return (
    <header className="flex flex-col gap-3">
      <Link
        to={ROUTES.groups}
        className="inline-flex w-fit items-center gap-1 rounded-sm text-[13px] text-muted-foreground outline-none hover:text-foreground focus-visible:shadow-focus"
      >
        <ChevronLeft className="size-4" aria-hidden />
        {tCommon('nav.groups')}
      </Link>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h1 className="font-heading text-[26px] leading-9 font-semibold tracking-[-0.015em]">{group.name}</h1>
            <GroupRoleBadge role={role} />
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
            {subject ? <span className="font-medium text-foreground">{subject}</span> : <Badge variant="outline">{tCommon('domain.unclassified')}</Badge>}
            {group.semester && <span>· {group.semester}</span>}
            {group.lecturerName && (
              <span className="inline-flex items-center gap-1">
                · <GraduationCap className="size-3.5" aria-hidden /> {group.lecturerName}
              </span>
            )}
          </p>
          {group.topic && <p className="mt-1 text-sm">{t('header.topic', { topic: group.topic })}</p>}
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
