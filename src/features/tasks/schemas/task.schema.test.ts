import { NONE, taskSchema } from './task.schema'

const valid = {
  title: 'Thiết kế màn hình đăng nhập',
  description: '',
  assigneeId: NONE,
  startDate: '',
  dueDate: '',
  priority: 'medium' as const,
  phaseId: NONE,
}

describe('taskSchema (UC08)', () => {
  it('needs only a title; both dates stay optional', () => {
    expect(taskSchema.safeParse(valid).success).toBe(true)
    expect(taskSchema.safeParse({ ...valid, dueDate: '2026-11-03' }).success).toBe(true)
    expect(taskSchema.safeParse({ ...valid, startDate: '2026-11-03' }).success).toBe(true)
  })

  it('requires a title', () => {
    expect(taskSchema.safeParse({ ...valid, title: '  ' }).error?.issues[0]?.message).toBe(
      'tasks:validation.titleRequired',
    )
  })

  it('rejects a due date before the start date on the due date field', () => {
    const result = taskSchema.safeParse({ ...valid, startDate: '2026-11-10', dueDate: '2026-11-03' })
    expect(result.error?.issues[0]).toMatchObject({
      path: ['dueDate'],
      message: 'tasks:validation.dueBeforeStart',
    })
  })
})
