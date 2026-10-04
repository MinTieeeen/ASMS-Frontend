/**
 * @file Security tab of the settings, SCR-AUTH-05 (UC-AUTH-06, UC-AUTH-09). The title and tabs come from
 *   SettingsLayout ("Settings" page template).
 * @author MinhTien
 * @version 2.0.0
 * @since 2026-09-29
 * @modified 2026-10-04
 */

import { selectUser, useAuthStore } from '@/stores/auth.store'

import { ChangePasswordCard } from '../components/ChangePasswordCard'
import { SessionsCard } from '../components/SessionsCard'

export default function SecuritySettingsPage() {
  const user = useAuthStore(selectUser)

  if (!user) return null
  return (
    <div className="flex flex-col gap-5">
      <ChangePasswordCard user={user} />
      <SessionsCard />
    </div>
  )
}
