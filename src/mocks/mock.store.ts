/**
 * @file In-memory mock backend of the group workflow concept. It stands in for the API until the backend exists;
 *   pages will then switch to Orval hooks and TanStack Query, and this store will be deleted.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { create } from 'zustand'

import { createSeed } from './seed'
import { createGroupSlice } from './store/groups-slice'
import type { MockState } from './store/helpers'
import { createResultsSlice } from './store/results-slice'
import { createWorkSlice } from './store/work-slice'

export const useMockStore = create<MockState>()((...args) => {
  const [set] = args
  return {
    ...createSeed(),
    roleOverride: {},
    setRoleOverride: (groupId, role) =>
      set((state) => {
        const next = { ...state.roleOverride }
        if (role) next[groupId] = role
        else delete next[groupId]
        return { roleOverride: next }
      }),
    resetDemo: () => set({ ...createSeed(), roleOverride: {} }),
    ...createGroupSlice(...args),
    ...createWorkSlice(...args),
    ...createResultsSlice(...args),
  }
})
