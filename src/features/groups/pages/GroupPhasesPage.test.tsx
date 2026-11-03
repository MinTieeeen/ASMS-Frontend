import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useMockStore } from '@/mocks'
import { renderPage } from '@/test/render'

import GroupPhasesPage from './GroupPhasesPage'

function renderPhases(groupId: string) {
  return renderPage(<GroupPhasesPage />, {
    path: '/groups/:groupId/phases',
    route: `/groups/${groupId}/phases`,
  })
}

const phaseNames = () =>
  within(screen.getByRole('list', { name: 'Giai đoạn' }))
    .getAllByRole('listitem')
    .map((item) => item.querySelector('[data-slot="card-title"]')?.firstChild?.textContent)

const phaseOf = (id: string) => useMockStore.getState().phases.find((item) => item.id === id)

describe('GroupPhasesPage (M04)', () => {
  beforeEach(() => useMockStore.getState().resetDemo())

  it('lists phases in order and shows the numbers saved when a phase was closed', () => {
    renderPhases('g1')

    expect(phaseNames()).toEqual(['Phân tích yêu cầu', 'Thiết kế', 'Lập trình', 'Kiểm thử', 'Báo cáo'])
    expect(screen.getByText('Khi kết thúc: 6 xong · 1 dở dang · 1 quá hạn')).toBeInTheDocument()
  })

  it('reorders phases with the move buttons (UC06 step 3)', async () => {
    renderPhases('g1')

    await userEvent.click(screen.getByRole('button', { name: 'Đưa Lập trình lên trước' }))

    expect(phaseNames().slice(1, 3)).toEqual(['Lập trình', 'Thiết kế'])
  })

  it('refuses an end date before the start date (UC06 step 2)', async () => {
    renderPhases('g1')

    await userEvent.click(screen.getByRole('button', { name: 'Thêm giai đoạn' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.type(within(dialog).getByLabelText('Tên giai đoạn'), 'Bảo vệ')
    await userEvent.clear(within(dialog).getByLabelText('Ngày kết thúc'))
    await userEvent.type(within(dialog).getByLabelText('Ngày kết thúc'), '2020-01-01')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Thêm giai đoạn' }))

    expect(await within(dialog).findByText('Ngày kết thúc không được trước ngày bắt đầu.')).toBeInTheDocument()
  })

  it('closes a phase and moves its unfinished tasks to the next phase (UC07)', async () => {
    renderPhases('g1')
    const unfinished = useMockStore
      .getState()
      .tasks.filter((item) => item.phaseId === 'g1-p2' && ['todo', 'in_progress', 'in_review'].includes(item.status))

    await userEvent.click(screen.getByRole('button', { name: 'Thao tác với giai đoạn Thiết kế' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Kết thúc giai đoạn' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByLabelText('Chuyển sang giai đoạn kế tiếp (Lập trình)')).toBeChecked()
    await userEvent.click(within(dialog).getByRole('button', { name: 'Kết thúc giai đoạn' }))

    expect(phaseOf('g1-p2')?.status).toBe('closed')
    const moved = useMockStore.getState().tasks.filter((item) => unfinished.some((task) => task.id === item.id))
    expect(moved.every((item) => item.phaseId === 'g1-p3')).toBe(true)
  })

  it('shows a plain member the phases without management actions', () => {
    renderPhases('g3')

    expect(screen.queryByRole('button', { name: 'Thêm giai đoạn' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Thao tác với giai đoạn/ })).not.toBeInTheDocument()
  })
})
