/**
 * @file Small helpers shared by the slices of the mock store.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import type { StateCreator } from 'zustand'

import type { MockDb } from '../seed'
import type { Activity, ActivityKind, GroupRole } from '../types'
import type { GroupSlice } from './groups-slice'
import type { ResultsSlice } from './results-slice'
import type { WorkSlice } from './work-slice'

export interface CoreSlice {
  /** Concept only: preview a group as another role without changing the data */
  roleOverride: Record<string, GroupRole>
  setRoleOverride: (groupId: string, role: GroupRole | null) => void
  resetDemo: () => void
}

export type MockState = MockDb & CoreSlice & GroupSlice & WorkSlice & ResultsSlice

export type Slice<T> = StateCreator<MockState, [], [], T>

let sequence = 0

/** Unique id for records created in the browser */
export function newId(prefix: string): string {
  sequence += 1
  return `${prefix}-${Date.now().toString(36)}-${sequence}`
}

export function nowIso(): string {
  return new Date().toISOString()
}

/** BR04: 6 uppercase letters and digits, without look-alike characters */
export function randomJoinCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from(
    { length: 6 },
    () => alphabet[Math.floor(Math.random() * alphabet.length)],
  ).join('')
}

/** F11.01: append-only activity log entry */
export function activity(
  groupId: string,
  actorId: string,
  kind: ActivityKind,
  params: Record<string, string> = {},
): Activity {
  return { id: newId('ac'), groupId, actorId, kind, params, createdAt: nowIso() }
}
