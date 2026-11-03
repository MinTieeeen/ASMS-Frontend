import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ME_ID, useMockStore } from '@/mocks'
import { renderPage } from '@/test/render'

import MyTasksPage from './MyTasksPage'

function renderMyTasks(search = '') {
  return renderPage(<MyTasksPage />, { path: '/tasks', route: `/tasks${search}` })
}

const table = () => screen.getByRole('table', { name: 'Danh sách công việc' })
const groupCells = () =>
  within(table())
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[0]?.textContent)

describe('MyTasksPage (UC11)', () => {
  beforeEach(() => useMockStore.getState().resetDemo())

  it('lists only my open tasks across groups, with the group first and no assignee column', () => {
    renderMyTasks()

    const headers = within(table()).getAllByRole('columnheader').map((cell) => cell.textContent)
    expect(headers[0]).toBe('Nhóm')
    expect(headers).not.toContain('Người phụ trách')
    expect(within(table()).getByText('Thiết kế kiến trúc hệ thống')).toBeInTheDocument()
    // #5 belongs to another member
    expect(within(table()).queryByText('Thiết kế lược đồ CSDL')).not.toBeInTheDocument()
    expect(new Set(groupCells()).size).toBeGreaterThan(1)
  })

  it('filters by group from the URL', () => {
    renderMyTasks('?group=g1')

    expect(new Set(groupCells())).toEqual(new Set(['Nhóm 3 – Phòng trọ thông minh']))
  })

  it('opens a task in its own group', () => {
    renderMyTasks()

    expect(within(table()).getByRole('link', { name: 'Thiết kế kiến trúc hệ thống' })).toHaveAttribute(
      'href',
      '/groups/g1/tasks?task=t7',
    )
  })

  it("changes a task's status with the rules of its group", async () => {
    renderMyTasks()

    await userEvent.click(screen.getByRole('button', { name: 'Đổi trạng thái của #7' }))
    await userEvent.click(await screen.findByRole('menuitemradio', { name: 'Chưa làm' }))

    expect(useMockStore.getState().tasks.find((item) => item.id === 't7')?.status).toBe('todo')
  })

  it('invites to the group list when nothing is assigned to me', () => {
    useMockStore.setState((state) => ({
      tasks: state.tasks.map((item) => (item.assigneeId === ME_ID ? { ...item, assigneeId: null } : item)),
    }))
    renderMyTasks()

    expect(screen.getByText('Bạn chưa được giao công việc nào')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Xem nhóm của tôi' })).toHaveAttribute('href', '/groups')
  })
})
