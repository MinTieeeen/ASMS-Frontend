import type { Phase, Task } from '@/mocks'

import { buildGantt } from './gantt'

const TZ = 'Asia/Ho_Chi_Minh'

const phase = {
  id: 'p1',
  name: 'Thiết kế',
  position: 1,
  // 05/11 to 10/11 in Vietnam
  startDate: '2026-11-04T17:00:00Z',
  endDate: '2026-11-10T16:59:00Z',
} as Phase

function taskOf(code: number, patch: Partial<Task>): Task {
  return {
    id: `t${code}`,
    code,
    phaseId: null,
    createdAt: '2026-11-02T03:00:00Z',
    startAt: null,
    dueAt: null,
    ...patch,
  } as Task
}

describe('buildGantt (F05.11)', () => {
  it('runs a bar from the start date to the due date', () => {
    const layout = buildGantt(
      [phase],
      // 07/11 to 09/11 in Vietnam
      [taskOf(1, { phaseId: 'p1', startAt: '2026-11-06T17:00:00Z', dueAt: '2026-11-09T16:59:00Z' })],
      TZ,
    )

    expect(layout.sections[0]?.rows[0]?.span).toEqual({ from: 4, to: 6 })
  })

  it('without a start date, starts the bar at the phase start when the task was created earlier', () => {
    const layout = buildGantt([phase], [taskOf(1, { phaseId: 'p1', dueAt: '2026-11-08T16:59:00Z' })], TZ)

    // 2 padding days before the phase start
    expect(layout.days[0]).toBe('2026-11-03')
    expect(layout.sections[0]?.span).toEqual({ from: 2, to: 7 })
    expect(layout.sections[0]?.rows[0]?.span).toEqual({ from: 2, to: 5 })
  })

  it('counts days in the user time zone', () => {
    // 01/11 18:00 UTC is already 02/11 in Vietnam
    const layout = buildGantt([], [taskOf(1, { createdAt: '2026-11-01T18:00:00Z', dueAt: '2026-11-03T16:59:00Z' })], TZ)

    expect(layout.days[layout.sections[0]?.rows[0]?.span.from ?? -1]).toBe('2026-11-02')
  })

  it('draws a one-day bar when the due date is before the start', () => {
    const layout = buildGantt([], [taskOf(1, { createdAt: '2026-11-05T03:00:00Z', dueAt: '2026-11-03T16:59:00Z' })], TZ)

    expect(layout.sections[0]?.rows[0]?.span).toEqual({ from: 2, to: 2 })
  })

  it('puts tasks without a phase last and leaves out tasks without a due date', () => {
    const layout = buildGantt(
      [phase],
      [
        taskOf(1, { dueAt: '2026-11-06T16:59:00Z' }),
        taskOf(2, { phaseId: 'p1', dueAt: '2026-11-06T16:59:00Z' }),
        taskOf(3, {}),
      ],
      TZ,
    )

    expect(layout.sections.map((section) => section.phase?.id ?? null)).toEqual(['p1', null])
    expect(layout.withoutDueDate).toBe(1)
  })
})
