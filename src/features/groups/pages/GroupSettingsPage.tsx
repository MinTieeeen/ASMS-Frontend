/**
 * @file Settings tab of the group workspace: group information with subject and semester (F02.01, UC02), joining
 *   (UC04, BR04), task workflow (BR07) and archiving (F03.09, BR09). Only the leader changes them (section 3.2);
 *   everyone else reads them.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { Lock } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { type GroupWorkspace, useGroupWorkspace } from '@/mocks'

import { ArchiveSettings } from '../components/ArchiveSettings'
import { GroupInfoSettings } from '../components/GroupInfoSettings'
import { JoinSettings } from '../components/JoinSettings'
import { WorkflowSettings } from '../components/WorkflowSettings'

export default function GroupSettingsPage() {
  const workspace = useGroupWorkspace()
  return workspace ? <Settings workspace={workspace} /> : null
}

function Settings({ workspace }: { workspace: GroupWorkspace }) {
  const { t } = useTranslation('groups')
  const { group, role, members } = workspace
  const isLeader = role === 'leader'
  // can() is false for every edit once the group is archived (BR09)
  const canEdit = workspace.can('editGroup')

  return (
    <div className="flex flex-col gap-5">
      {/* An archived group already shows the read-only banner of the workspace */}
      {!isLeader && (
        <Alert>
          <Lock aria-hidden />
          <AlertTitle>{t('settings.readOnlyTitle')}</AlertTitle>
          <AlertDescription>{t('settings.readOnlyDescription')}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {/* Remount when the leader saves elsewhere or the group is restored, so the form shows fresh values */}
        <GroupInfoSettings key={`${group.id}-${group.status}`} group={group} memberCount={members.length} canEdit={canEdit} />
        <div className="flex min-w-0 flex-col gap-5">
          <JoinSettings group={group} canEdit={canEdit} />
          <WorkflowSettings group={group} canEdit={canEdit} />
          {isLeader && <ArchiveSettings group={group} />}
        </div>
      </div>
    </div>
  )
}
