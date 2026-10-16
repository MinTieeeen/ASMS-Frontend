/**
 * @file Read hooks over the mock store: the signed-in student's groups and the workspace of one group with the
 *   effective role and permissions (section 3.2).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { useMemo } from 'react'
import { useParams } from 'react-router'

import { useMockStore } from './mock.store'
import { canDo, type GroupAction } from './permissions'
import { ME_ID } from './seed'
import type { Group, GroupRole, Member, MockUser } from './types'

export function useUserMap(): Record<string, MockUser> {
  const users = useMockStore((state) => state.users)
  return useMemo(() => Object.fromEntries(users.map((user) => [user.id, user])), [users])
}

export interface MyGroup {
  group: Group
  role: GroupRole
  memberCount: number
}

/** Every group the signed-in student is an active member of */
export function useMyGroups(): MyGroup[] {
  const groups = useMockStore((state) => state.groups)
  const members = useMockStore((state) => state.members)
  return useMemo(
    () =>
      groups.flatMap((group) => {
        const mine = members.find(
          (item) => item.groupId === group.id && item.userId === ME_ID && item.status === 'active',
        )
        if (!mine) return []
        const memberCount = members.filter(
          (item) => item.groupId === group.id && item.status === 'active',
        ).length
        return [{ group, role: mine.role, memberCount }]
      }),
    [groups, members],
  )
}

export interface GroupWorkspace {
  group: Group
  /** Role used by the UI: the real one, or the one previewed with the concept role switcher */
  role: GroupRole
  actualRole: GroupRole
  /** Active members, leader first */
  members: Member[]
  /** BR10: members who left or were removed, still shown next to their history */
  formerMembers: Member[]
  can: (action: GroupAction) => boolean
  isArchived: boolean
}

const ROLE_ORDER: Record<GroupRole, number> = { leader: 0, deputy: 1, member: 2 }

/** Null when the group does not exist or the student is not (or no longer) a member */
export function useGroupWorkspace(groupIdArg?: string): GroupWorkspace | null {
  const params = useParams()
  const groupId = groupIdArg ?? params.groupId ?? ''
  const groups = useMockStore((state) => state.groups)
  const allMembers = useMockStore((state) => state.members)
  const override = useMockStore((state) => state.roleOverride[groupId])

  return useMemo(() => {
    const group = groups.find((item) => item.id === groupId)
    if (!group) return null
    const inGroup = allMembers.filter((item) => item.groupId === groupId)
    const mine = inGroup.find((item) => item.userId === ME_ID && item.status === 'active')
    if (!mine) return null
    const role = override ?? mine.role
    return {
      group,
      role,
      actualRole: mine.role,
      members: inGroup
        .filter((item) => item.status === 'active')
        .sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role]),
      formerMembers: inGroup.filter((item) => item.status !== 'active'),
      can: (action: GroupAction) => canDo(role, group, action),
      isArchived: group.status === 'archived',
    }
  }, [groups, allMembers, override, groupId])
}
