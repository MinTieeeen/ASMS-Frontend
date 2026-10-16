import { useMemo } from 'react'

import { SidebarRecentGroups } from '@/components/layout/SidebarRecentGroups'
import { canDo, ME_ID, useMockStore, useMyGroups } from '@/mocks'

export function RecentGroupsNav({
  isRail,
  onNavigate,
}: {
  isRail: boolean
  onNavigate?: () => void
}) {
  const myGroups = useMyGroups()
  const joinRequests = useMockStore((state) => state.joinRequests)
  const reviewRounds = useMockStore((state) => state.reviewRounds)

  const groups = useMemo(
    () =>
      myGroups
        .filter(({ group }) => !group.isSemesterEnded)
        .map(({ group, role }) => {
          const pendingJoinRequests = canDo(role, group, 'approveRequest')
            ? joinRequests.filter((request) => request.groupId === group.id).length
            : 0
          const pendingReviews = reviewRounds.filter(
            (round) =>
              round.groupId === group.id &&
              round.status === 'open' &&
              !round.submittedBy.includes(ME_ID),
          ).length
          return {
            id: group.id,
            name: group.name,
            badgeCount: pendingJoinRequests + pendingReviews,
            lastActivityAt: group.lastActivityAt,
          }
        })
        .sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt))
        .slice(0, 5),
    [myGroups, joinRequests, reviewRounds],
  )

  return <SidebarRecentGroups groups={groups} isRail={isRail} onNavigate={onNavigate} />
}
