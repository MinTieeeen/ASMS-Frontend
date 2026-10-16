/**
 * @file Mock backend of milestones and deliverables, progress updates, peer reviews, resources, meeting notes, polls
 *   and notifications (M06-M10).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { PEER_REVIEW_MIN_REVIEWS } from '@/config/constants'

import { ME_ID } from '../seed'
import type { Milestone, ReviewCriterion, ReviewDraft, ReviewResult } from '../types'
import { activity, newId, nowIso, type Slice } from './helpers'

export interface MilestoneInput {
  name: string
  description: string
  dueAt: string
  weight: number | null
}

export interface DeliverableInput {
  kind: 'file' | 'link'
  url: string
  fileName: string | null
  fileSize: number | null
  note: string
}

export interface ReviewRoundInput {
  name: string
  deadline: string
  criteria: ReviewCriterion[]
  allowSelfReview: boolean
}

export interface ResultsSlice {
  createMilestone: (groupId: string, input: MilestoneInput) => void
  updateMilestone: (milestoneId: string, patch: Partial<Milestone>) => void
  toggleMilestoneChecklist: (milestoneId: string, itemId: string) => void
  uploadDeliverable: (milestoneId: string, input: DeliverableInput) => void
  setPrimaryDeliverable: (deliverableId: string) => void
  recordResult: (milestoneId: string, score: number, feedback: string) => void
  postProgressUpdate: (groupId: string, done: string, next: string, blockers: string) => void
  openReviewRound: (groupId: string, input: ReviewRoundInput) => void
  saveReviewDraft: (roundId: string, revieweeId: string, draft: ReviewDraft) => void
  submitReview: (roundId: string) => void
  closeReviewRound: (roundId: string) => void
  addResource: (
    groupId: string,
    input: { kind: 'file' | 'link'; title: string; url: string; folder: string },
  ) => void
  deleteResource: (resourceId: string) => void
  convertActionItem: (noteId: string, itemId: string) => void
  votePoll: (pollId: string, optionId: string) => void
  markNotificationRead: (notificationId: string) => void
  markAllNotificationsRead: () => void
}

/** Deterministic pseudo score so that a closed concept round shows stable numbers */
function mockScore(userId: string, criterionId: string): number {
  let hash = 0
  for (const char of userId + criterionId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return 3 + (hash % 9) / 4
}

export const createResultsSlice: Slice<ResultsSlice> = (set, get) => ({
  createMilestone: (groupId, input) =>
    set((state) => ({
      milestones: [
        ...state.milestones,
        {
          id: newId('ms'),
          groupId,
          ...input,
          status: 'open',
          score: null,
          feedback: null,
          checklist: [],
        },
      ],
    })),

  updateMilestone: (milestoneId, patch) =>
    set((state) => ({
      milestones: state.milestones.map((item) =>
        item.id === milestoneId ? { ...item, ...patch } : item,
      ),
    })),

  toggleMilestoneChecklist: (milestoneId, itemId) =>
    set((state) => ({
      milestones: state.milestones.map((item) =>
        item.id === milestoneId
          ? {
              ...item,
              checklist: item.checklist.map((entry) =>
                entry.id === itemId ? { ...entry, isDone: !entry.isDone } : entry,
              ),
            }
          : item,
      ),
    })),

  // UC10-4: a new version becomes the primary one; after the due date it is flagged late
  uploadDeliverable: (milestoneId, input) => {
    const state = get()
    const milestone = state.milestones.find((item) => item.id === milestoneId)
    if (!milestone) return
    const versions = state.deliverables.filter((item) => item.milestoneId === milestoneId)
    const version = Math.max(0, ...versions.map((item) => item.version)) + 1
    set({
      deliverables: [
        ...state.deliverables.map((item) =>
          item.milestoneId === milestoneId ? { ...item, isPrimary: false } : item,
        ),
        {
          id: newId('d'),
          milestoneId,
          version,
          ...input,
          isPrimary: true,
          isLate: new Date(milestone.dueAt) < new Date(),
          uploadedBy: ME_ID,
          createdAt: nowIso(),
        },
      ],
      milestones: state.milestones.map((item) =>
        item.id === milestoneId && item.status === 'open' ? { ...item, status: 'submitted' } : item,
      ),
      activities: [
        activity(milestone.groupId, ME_ID, 'deliverableUploaded', {
          milestone: milestone.name,
          version: `v${version}`,
        }),
        ...state.activities,
      ],
    })
  },

  setPrimaryDeliverable: (deliverableId) =>
    set((state) => {
      const target = state.deliverables.find((item) => item.id === deliverableId)
      if (!target) return {}
      return {
        deliverables: state.deliverables.map((item) =>
          item.milestoneId === target.milestoneId
            ? { ...item, isPrimary: item.id === deliverableId }
            : item,
        ),
      }
    }),

  recordResult: (milestoneId, score, feedback) => {
    const milestone = get().milestones.find((item) => item.id === milestoneId)
    if (!milestone) return
    set((state) => ({
      milestones: state.milestones.map((item) =>
        item.id === milestoneId ? { ...item, status: 'graded', score, feedback } : item,
      ),
      activities: [
        activity(milestone.groupId, ME_ID, 'milestoneGraded', {
          milestone: milestone.name,
          score: String(score),
        }),
        ...state.activities,
      ],
    }))
  },

  postProgressUpdate: (groupId, done, next, blockers) =>
    set((state) => ({
      progressUpdates: [
        { id: newId('pu'), groupId, userId: ME_ID, done, next, blockers, createdAt: nowIso() },
        ...state.progressUpdates,
      ],
    })),

  openReviewRound: (groupId, input) =>
    set((state) => ({
      reviewRounds: [
        { id: newId('rv'), groupId, ...input, status: 'open', submittedBy: [], results: null },
        ...state.reviewRounds,
      ],
      activities: [
        activity(groupId, ME_ID, 'reviewOpened', { round: input.name }),
        ...state.activities,
      ],
    })),

  saveReviewDraft: (roundId, revieweeId, draft) =>
    set((state) => ({
      reviewDrafts: {
        ...state.reviewDrafts,
        [roundId]: { ...state.reviewDrafts[roundId], [revieweeId]: draft },
      },
    })),

  submitReview: (roundId) =>
    set((state) => ({
      reviewRounds: state.reviewRounds.map((item) =>
        item.id === roundId && !item.submittedBy.includes(ME_ID)
          ? { ...item, submittedBy: [...item.submittedBy, ME_ID] }
          : item,
      ),
    })),

  // UC12-4: averages per criterion; BR12 hides members with fewer than 2 reviews
  closeReviewRound: (roundId) =>
    set((state) => {
      const round = state.reviewRounds.find((item) => item.id === roundId)
      if (!round) return {}
      const members = state.members.filter(
        (item) => item.groupId === round.groupId && item.status === 'active',
      )
      const results: ReviewResult[] = members.map((item) => {
        const reviewCount = round.submittedBy.filter(
          (reviewer) => round.allowSelfReview || reviewer !== item.userId,
        ).length
        const isPublished = reviewCount >= PEER_REVIEW_MIN_REVIEWS
        return {
          userId: item.userId,
          reviewCount,
          scores: isPublished
            ? Object.fromEntries(
                round.criteria.map((criterion) => [
                  criterion.id,
                  mockScore(item.userId, criterion.id),
                ]),
              )
            : {},
          comments: isPublished ? ['Hoàn thành tốt phần việc được giao.'] : [],
        }
      })
      return {
        reviewRounds: state.reviewRounds.map((item) =>
          item.id === roundId ? { ...item, status: 'closed', results } : item,
        ),
      }
    }),

  addResource: (groupId, input) =>
    set((state) => ({
      resources: [
        {
          id: newId('rs'),
          groupId,
          ...input,
          size: input.kind === 'file' ? 512_000 : null,
          addedBy: ME_ID,
          createdAt: nowIso(),
        },
        ...state.resources,
      ],
    })),

  deleteResource: (resourceId) =>
    set((state) => ({ resources: state.resources.filter((item) => item.id !== resourceId) })),

  // F09.02: an action item of a meeting becomes a task in the group
  convertActionItem: (noteId, itemId) => {
    const note = get().meetingNotes.find((item) => item.id === noteId)
    const actionItem = note?.actionItems.find((item) => item.id === itemId)
    if (!note || !actionItem) return
    const taskId = get().createTask({
      groupId: note.groupId,
      phaseId: null,
      title: actionItem.text,
      description: '',
      priority: 'medium',
      assigneeId: actionItem.assigneeId,
      dueAt: null,
      estimateHours: null,
      labelIds: [],
    })
    set((state) => ({
      meetingNotes: state.meetingNotes.map((item) =>
        item.id === noteId
          ? {
              ...item,
              actionItems: item.actionItems.map((entry) =>
                entry.id === itemId ? { ...entry, taskId } : entry,
              ),
            }
          : item,
      ),
    }))
  },

  votePoll: (pollId, optionId) =>
    set((state) => ({
      polls: state.polls.map((poll) =>
        poll.id === pollId
          ? {
              ...poll,
              options: poll.options.map((option) => ({
                ...option,
                voterIds:
                  option.id === optionId
                    ? [...option.voterIds.filter((id) => id !== ME_ID), ME_ID]
                    : option.voterIds.filter((id) => id !== ME_ID),
              })),
            }
          : poll,
      ),
    })),

  markNotificationRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((item) =>
        item.id === notificationId && !item.readAt ? { ...item, readAt: nowIso() } : item,
      ),
    })),

  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((item) =>
        item.readAt ? item : { ...item, readAt: nowIso() },
      ),
    })),
})
