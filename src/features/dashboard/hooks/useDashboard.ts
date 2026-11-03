/**
 * @file Dashboard numbers of the signed-in student from the group data, computed once per page visit.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { useMemo, useState } from 'react'

import { ME_ID, useMockStore, useMyGroups } from '@/mocks'

import { buildDashboard, type DashboardData } from '../utils/dashboard-data'

export function useDashboard(): { data: DashboardData; now: Date } {
  const myGroups = useMyGroups()
  const tasks = useMockStore((state) => state.tasks)
  const phases = useMockStore((state) => state.phases)
  const milestones = useMockStore((state) => state.milestones)
  // "Now" is fixed for the visit so the numbers do not shift while the page is open
  const [now] = useState(() => new Date())
  const data = useMemo(
    () => buildDashboard({ myGroups, tasks, phases, milestones, meId: ME_ID, now }),
    [myGroups, tasks, phases, milestones, now],
  )
  return { data, now }
}
