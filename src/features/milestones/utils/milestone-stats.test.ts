import type { Deliverable, Milestone } from '@/mocks'

import { milestoneSchema, resultSchema } from '../schemas/milestone.schema'
import { storageUsedBy, versionsOf, weightedScoreOf } from './milestone-stats'

const milestone = (id: string, patch: Partial<Milestone>) => ({ id, status: 'open', score: null, weight: null, ...patch }) as Milestone
const deliverable = (id: string, patch: Partial<Deliverable>) =>
  ({ id, milestoneId: 'm1', version: 1, kind: 'file', fileSize: 0, ...patch }) as Deliverable

describe('weightedScoreOf', () => {
  it('averages graded scores by their weight', () => {
    const result = weightedScoreOf([
      milestone('m1', { status: 'graded', score: 8, weight: 20 }),
      milestone('m2', { status: 'graded', score: 9, weight: 30 }),
      milestone('m3', { status: 'open', weight: 50 }),
      milestone('m4', { status: 'graded', score: 2, weight: null }),
    ])
    expect(result.gradedWeight).toBe(50)
    expect(result.score).toBeCloseTo(8.6)
  })

  it('has no score before any weighted milestone is graded', () => {
    expect(weightedScoreOf([milestone('m1', { weight: 20 })])).toEqual({ score: null, gradedWeight: 0 })
  })
})

describe('storageUsedBy and versionsOf', () => {
  const items = [
    deliverable('d1', { fileSize: 1000 }),
    deliverable('d2', { version: 3, kind: 'link', fileSize: null }),
    deliverable('d3', { version: 2, fileSize: 500 }),
    deliverable('d4', { milestoneId: 'other', fileSize: 9000 }),
  ]

  it('counts the files of the given milestones only (BR14)', () => {
    expect(storageUsedBy(items, new Set(['m1']))).toBe(1500)
  })

  it('lists the versions of a milestone, newest first', () => {
    expect(versionsOf(items, 'm1').map((item) => item.version)).toEqual([3, 2, 1])
  })
})

describe('milestone schemas', () => {
  const valid = { name: 'Nộp SRS', description: '', dueDate: '2026-11-20', dueTime: '23:59', weight: '' }

  it('needs a name, a due date and a time; the weight is optional but within 0-100', () => {
    expect(milestoneSchema.safeParse(valid).success).toBe(true)
    expect(milestoneSchema.safeParse({ ...valid, weight: '20' }).success).toBe(true)
    expect(milestoneSchema.safeParse({ ...valid, weight: '120' }).error?.issues[0]?.message).toBe(
      'milestones:validation.weightRange',
    )
    expect(milestoneSchema.safeParse({ ...valid, name: ' ', dueTime: '' }).error?.issues.map((issue) => issue.message)).toEqual([
      'milestones:validation.nameRequired',
      'milestones:validation.timeRequired',
    ])
  })

  it('needs a score between 0 and 10', () => {
    expect(resultSchema.safeParse({ score: '8.5', feedback: '' }).success).toBe(true)
    expect(resultSchema.safeParse({ score: '', feedback: '' }).success).toBe(false)
    expect(resultSchema.safeParse({ score: '11', feedback: '' }).success).toBe(false)
  })
})
