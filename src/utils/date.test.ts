import { formatDateTime, fromDateInputValue, toDateInputValue, toRelativeTime } from './date'

describe('date input helpers (BR13)', () => {
  it('reads an instant as the day it falls on in the user time zone', () => {
    expect(toDateInputValue('2026-11-02T18:30:00Z', 'Asia/Ho_Chi_Minh')).toBe('2026-11-03')
  })

  it('turns a picked day into 00:00 or 23:59 of that day in the user time zone', () => {
    expect(fromDateInputValue('2026-11-03', 'start', 'Asia/Ho_Chi_Minh')).toBe('2026-11-02T17:00:00.000Z')
    expect(fromDateInputValue('2026-11-03', 'end', 'Asia/Ho_Chi_Minh')).toBe('2026-11-03T16:59:00.000Z')
  })
})

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
