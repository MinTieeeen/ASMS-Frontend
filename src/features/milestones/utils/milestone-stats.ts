/**
 * @file Numbers shown around milestones: the weighted score of the graded ones, the storage a group's files use
 *   (BR14) and the deliverables of one milestone, newest version first.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import type { Deliverable, Milestone } from '@/mocks'

export interface WeightedScore {
  /** Out of 10, null when no weighted milestone is graded */
  score: number | null
  /** Sum of the weights already graded, in percent */
  gradedWeight: number
}

/** Average of the graded scores, each counted by its weight; milestones without a weight are left out */
export function weightedScoreOf(milestones: Milestone[]): WeightedScore {
  const graded = milestones.filter((item) => item.status === 'graded' && item.score !== null && item.weight)
  const gradedWeight = graded.reduce((sum, item) => sum + (item.weight ?? 0), 0)
  if (gradedWeight === 0) return { score: null, gradedWeight: 0 }
  const total = graded.reduce((sum, item) => sum + (item.score ?? 0) * (item.weight ?? 0), 0)
  return { score: total / gradedWeight, gradedWeight }
}

/** Bytes of every file delivered for the given milestones (links take no space) */
export function storageUsedBy(deliverables: Deliverable[], milestoneIds: ReadonlySet<string>): number {
  return deliverables
    .filter((item) => milestoneIds.has(item.milestoneId) && item.kind === 'file')
    .reduce((sum, item) => sum + (item.fileSize ?? 0), 0)
}

export function versionsOf(deliverables: Deliverable[], milestoneId: string): Deliverable[] {
  return deliverables.filter((item) => item.milestoneId === milestoneId).sort((a, b) => b.version - a.version)
}
