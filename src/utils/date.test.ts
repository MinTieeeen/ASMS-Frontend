import { formatDateTime, toRelativeTime } from './date'

describe('toRelativeTime (screen conventions)', () => {
  const now = new Date('2026-09-29T10:00:00Z')

  it.each([
    ['2026-09-29T09:59:30Z', { unit: 'justNow' }],
    ['2026-09-29T09:55:00Z', { unit: 'minutes', count: 5 }],
    ['2026-09-29T07:00:00Z', { unit: 'hours', count: 3 }],
    ['2026-09-27T10:00:00Z', { unit: 'days', count: 2 }],
  ])('describes %s', (iso, expected) => {
    expect(toRelativeTime(iso, now)).toEqual(expected)
  })

  it('shows the full date beyond 7 days, in the user time zone', () => {
    expect(toRelativeTime('2026-09-20T01:30:00Z', now)).toEqual({
      unit: 'date',
      text: '20/09/2026 08:30',
    })
  })
})

describe('formatDateTime', () => {
  it('uses dd/MM/yyyy HH:mm in Asia/Ho_Chi_Minh', () => {
    expect(formatDateTime('2026-08-12T14:14:00Z')).toBe('12/08/2026 21:14')
  })
})
