/**
 * @file Members tab of the group workspace (M03): member list with role management, former members, join requests
 *   (F03.04) and invite code / link (F03.02) for leader and deputies, and leaving the group.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { type GroupWorkspace, useGroupWorkspace } from '@/mocks'

import { FormerMembers } from '../components/FormerMembers'
import { InvitePanel } from '../components/InvitePanel'
import { JoinRequestsCard } from '../components/JoinRequestsCard'
import { LeaveGroupButton } from '../components/LeaveGroupButton'
import { MemberList } from '../components/MemberList'

export default function GroupMembersPage() {
  const workspace = useGroupWorkspace()
  return workspace ? <Members workspace={workspace} /> : null
}

function Members({ workspace }: { workspace: GroupWorkspace }) {
  const canApprove = workspace.can('approveRequest')
  const canInvite = workspace.can('invite')

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-5">
        <MemberList workspace={workspace} />
        <FormerMembers members={workspace.formerMembers} />
        <LeaveGroupButton workspace={workspace} />
      </div>
      {(canApprove || canInvite) && (
        <div className="flex flex-col gap-5">
          {canApprove && <JoinRequestsCard workspace={workspace} />}
          {canInvite && <InvitePanel workspace={workspace} />}
        </div>
      )}
    </div>
  )
}
