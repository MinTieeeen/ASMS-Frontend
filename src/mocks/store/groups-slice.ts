/**
 * @file Mock backend of groups, members, invites, join requests and the group charter (M02, M03).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { DEFAULT_MAX_MEMBERS } from '@/config/constants'

import { daysFromNow, JOINABLE_GROUPS, ME_ID } from '../seed'
import type { Group, GroupRole, Phase, PhaseTemplate } from '../types'
import { activity, newId, nowIso, randomJoinCode, type Slice } from './helpers'

export interface CreateGroupInput {
  name: string
  topic: string
  description: string
  subjectCode: string
  subjectName: string
  semester: string
  lecturerName: string
  maxMembers: number
  template: PhaseTemplate
}

export type JoinResult = 'joined' | 'requested' | 'already' | 'full' | 'notFound'

export interface GroupSlice {
  createGroup: (input: CreateGroupInput) => string
  joinByCode: (code: string, isInvited?: boolean) => JoinResult
  declineInvitation: (invitationId: string) => void
  cancelJoinRequest: (code: string) => void
  updateGroup: (groupId: string, patch: Partial<Group>) => void
  regenerateJoinCode: (groupId: string) => void
  inviteByEmail: (groupId: string, email: string) => void
  revokeInvite: (inviteId: string) => void
  approveJoinRequest: (requestId: string) => void
  rejectJoinRequest: (requestId: string) => void
  changeRole: (groupId: string, userId: string, role: GroupRole) => void
  transferLeadership: (groupId: string, userId: string) => void
  removeMember: (groupId: string, userId: string, isLeaving?: boolean) => void
  updateCharter: (groupId: string, content: string[]) => void
  confirmCharter: (groupId: string) => void
  setArchived: (groupId: string, isArchived: boolean) => void
}

/** UC03 step 3: phase templates (the Admin will manage them in F12.02) */
const TEMPLATE_PHASES: Record<PhaseTemplate, string[]> = {
  blank: [],
  software: ['Phân tích', 'Thiết kế', 'Lập trình', 'Kiểm thử', 'Báo cáo'],
  research: ['Tìm tài liệu', 'Viết', 'Chỉnh sửa', 'Thuyết trình'],
}
const TEMPLATE_PHASE_DAYS = 14

export const createGroupSlice: Slice<GroupSlice> = (set, get) => ({
  createGroup: (input) => {
    const id = newId('g')
    const now = nowIso()
    const group: Group = {
      id,
      name: input.name,
      topic: input.topic,
      description: input.description,
      subjectCode: input.subjectCode || null,
      subjectName: input.subjectName || null,
      semester: input.semester || null,
      isSemesterEnded: false,
      lecturerName: input.lecturerName || null,
      maxMembers: input.maxMembers || DEFAULT_MAX_MEMBERS,
      joinCode: randomJoinCode(),
      inviteExpiresAt: daysFromNow(7),
      requireApproval: true,
      reviewEnabled: true,
      requireResultOnReview: false,
      status: 'active',
      createdAt: now,
      lastActivityAt: now,
      githubRepo: null,
    }
    const phases: Phase[] = TEMPLATE_PHASES[input.template].map((name, index) => ({
      id: newId('p'),
      groupId: id,
      name,
      goal: '',
      startDate: daysFromNow(index * TEMPLATE_PHASE_DAYS),
      endDate: daysFromNow((index + 1) * TEMPLATE_PHASE_DAYS - 1),
      position: index + 1,
      status: index === 0 ? 'active' : 'upcoming',
      closedAt: null,
      milestoneId: null,
      snapshot: null,
    }))
    set((state) => ({
      groups: [group, ...state.groups],
      members: [
        ...state.members,
        {
          id: newId('m'),
          groupId: id,
          userId: ME_ID,
          role: 'leader',
          status: 'active',
          joinedAt: now,
          leftAt: null,
        },
      ],
      phases: [...state.phases, ...phases],
      charters: [
        ...state.charters,
        { groupId: id, content: [], version: 0, updatedAt: now, confirmedBy: [] },
      ],
    }))
    return id
  },

  joinByCode: (rawCode, isInvited = false) => {
    const code = rawCode.trim().toUpperCase()
    const state = get()
    const existing = state.groups.find((item) => item.joinCode === code)
    if (
      existing &&
      state.members.some(
        (item) => item.groupId === existing.id && item.userId === ME_ID && item.status === 'active',
      )
    ) {
      return 'already'
    }
    const target = JOINABLE_GROUPS.find((item) => item.joinCode === code)
    if (!target) return 'notFound'
    if (target.id === 'g-full') return 'full'
    if (state.myPendingRequests.includes(code)) return 'requested'
    // UC04-1a: an e-mail invitation skips the approval step
    if (target.requireApproval && !isInvited) {
      set({ myPendingRequests: [...state.myPendingRequests, code] })
      return 'requested'
    }
    const now = nowIso()
    set({
      invitationsToMe: state.invitationsToMe.filter((item) => item.joinCode !== code),
      groups: [{ ...target, createdAt: now }, ...state.groups],
      members: [
        ...state.members,
        {
          id: newId('m'),
          groupId: target.id,
          userId: ME_ID,
          role: 'member',
          status: 'active',
          joinedAt: now,
          leftAt: null,
        },
      ],
      activities: [activity(target.id, ME_ID, 'memberJoined'), ...state.activities],
    })
    return 'joined'
  },

  declineInvitation: (invitationId) =>
    set((state) => ({
      invitationsToMe: state.invitationsToMe.filter((item) => item.id !== invitationId),
    })),

  cancelJoinRequest: (code) =>
    set((state) => ({
      myPendingRequests: state.myPendingRequests.filter((item) => item !== code),
    })),

  updateGroup: (groupId, patch) =>
    set((state) => ({
      groups: state.groups.map((item) => (item.id === groupId ? { ...item, ...patch } : item)),
      activities: [activity(groupId, ME_ID, 'groupUpdated'), ...state.activities],
    })),

  // UC04: the old link and code stop working at once
  regenerateJoinCode: (groupId) =>
    set((state) => ({
      groups: state.groups.map((item) =>
        item.id === groupId
          ? { ...item, joinCode: randomJoinCode(), inviteExpiresAt: daysFromNow(7) }
          : item,
      ),
    })),

  inviteByEmail: (groupId, email) =>
    set((state) => ({
      emailInvites: [
        { id: newId('iv'), groupId, email, invitedBy: ME_ID, createdAt: nowIso() },
        ...state.emailInvites,
      ],
    })),

  revokeInvite: (inviteId) =>
    set((state) => ({ emailInvites: state.emailInvites.filter((item) => item.id !== inviteId) })),

  approveJoinRequest: (requestId) => {
    const request = get().joinRequests.find((item) => item.id === requestId)
    if (!request) return
    set((state) => ({
      joinRequests: state.joinRequests.filter((item) => item.id !== requestId),
      members: [
        ...state.members,
        {
          id: newId('m'),
          groupId: request.groupId,
          userId: request.userId,
          role: 'member',
          status: 'active',
          joinedAt: nowIso(),
          leftAt: null,
        },
      ],
      activities: [activity(request.groupId, request.userId, 'memberJoined'), ...state.activities],
    }))
  },

  rejectJoinRequest: (requestId) =>
    set((state) => ({ joinRequests: state.joinRequests.filter((item) => item.id !== requestId) })),

  changeRole: (groupId, userId, role) => {
    const user = get().users.find((item) => item.id === userId)
    set((state) => ({
      members: state.members.map((item) =>
        item.groupId === groupId && item.userId === userId ? { ...item, role } : item,
      ),
      activities: [
        activity(groupId, ME_ID, 'roleChanged', { member: user?.fullName ?? '', role }),
        ...state.activities,
      ],
    }))
  },

  // UC05: the new leader takes over, the old one becomes a deputy
  transferLeadership: (groupId, userId) =>
    set((state) => ({
      members: state.members.map((item) => {
        if (item.groupId !== groupId || item.status !== 'active') return item
        if (item.userId === userId) return { ...item, role: 'leader' }
        if (item.role === 'leader') return { ...item, role: 'deputy' }
        return item
      }),
      roleOverride: Object.fromEntries(
        Object.entries(state.roleOverride).filter(([key]) => key !== groupId),
      ),
    })),

  // UC05 / BR10: unfinished tasks lose their assignee; history stays with a "left" label
  removeMember: (groupId, userId, isLeaving = false) =>
    set((state) => ({
      members: state.members.map((item) =>
        item.groupId === groupId && item.userId === userId
          ? { ...item, status: isLeaving ? 'left' : 'removed', leftAt: nowIso() }
          : item,
      ),
      tasks: state.tasks.map((item) =>
        item.groupId === groupId &&
        item.assigneeId === userId &&
        item.status !== 'done' &&
        item.status !== 'cancelled'
          ? { ...item, assigneeId: null }
          : item,
      ),
      activities: [activity(groupId, userId, 'memberLeft'), ...state.activities],
    })),

  // F03.08: a new version asks everyone to confirm again
  updateCharter: (groupId, content) =>
    set((state) => ({
      charters: state.charters.map((item) =>
        item.groupId === groupId
          ? {
              ...item,
              content,
              version: item.version + 1,
              updatedAt: nowIso(),
              confirmedBy: [ME_ID],
            }
          : item,
      ),
    })),

  confirmCharter: (groupId) =>
    set((state) => ({
      charters: state.charters.map((item) =>
        item.groupId === groupId && !item.confirmedBy.includes(ME_ID)
          ? { ...item, confirmedBy: [...item.confirmedBy, ME_ID] }
          : item,
      ),
      activities: [activity(groupId, ME_ID, 'charterConfirmed'), ...state.activities],
    })),

  setArchived: (groupId, isArchived) =>
    set((state) => ({
      groups: state.groups.map((item) =>
        item.id === groupId ? { ...item, status: isArchived ? 'archived' : 'active' } : item,
      ),
    })),
})
