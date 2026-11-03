import { NO_MILESTONE, phaseSchema } from './phase.schema'

const valid = {
  name: 'Thiết kế',
  goal: '',
  startDate: '2026-11-03',
  endDate: '2026-11-16',
  milestoneId: NO_MILESTONE,
}

describe('phaseSchema (UC06)', () => {
  it('accepts a phase that starts and ends on the same day', () => {
    expect(phaseSchema.safeParse({ ...valid, endDate: valid.startDate }).success).toBe(true)
  })

  it('requires a name and both dates', () => {
    const result = phaseSchema.safeParse({ ...valid, name: '  ', startDate: '', endDate: '' })
    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      'groups:validation.phaseNameRequired',
      'groups:validation.dateRequired',
      'groups:validation.dateRequired',
    ])
  })

  it('rejects an end date before the start date on the end date field', () => {
    const result = phaseSchema.safeParse({ ...valid, endDate: '2026-11-01' })
    expect(result.error?.issues[0]).toMatchObject({
      path: ['endDate'],
      message: 'groups:validation.endBeforeStart',
    })
  })
})
