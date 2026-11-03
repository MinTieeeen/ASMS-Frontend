import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useMockStore } from '@/mocks'
import { renderPage } from '@/test/render'

import GroupMilestonesPage from './GroupMilestonesPage'

function renderMilestones(groupId: string) {
  return renderPage(<GroupMilestonesPage />, {
    path: '/groups/:groupId/milestones',
    route: `/groups/${groupId}/milestones`,
  })
}

const names = () =>
  within(screen.getByRole('list', { name: 'Danh sách mốc nộp' }))
    .getAllByRole('link')
    .map((link) => link.textContent)

async function openMenu(name: string) {
  await userEvent.click(screen.getByRole('button', { name: `Thao tác với mốc ${name}` }))
}

describe('GroupMilestonesPage (F06.01)', () => {
  beforeEach(() => useMockStore.getState().resetDemo())

  it('lists milestones by due date with the weighted score so far', () => {
    renderMilestones('g1')

    expect(names()).toEqual([
      'Nộp đặc tả yêu cầu (SRS)',
      'Nộp tài liệu thiết kế (SDD)',
      'Demo giữa kỳ',
      'Báo cáo và sản phẩm cuối kỳ',
    ])
    expect(screen.getByText('8.50/10')).toBeInTheDocument()
    expect(screen.getByText('Điểm 8.5/10')).toBeInTheDocument()
  })

  it('refuses to delete a milestone that already has deliverables', async () => {
    renderMilestones('g1')

    await openMenu('Nộp đặc tả yêu cầu (SRS)')
    const item = await screen.findByRole('menuitem', { name: /Xóa mốc/ })
    expect(item).toHaveAttribute('aria-disabled', 'true')
    expect(within(item).getByText('Mốc đã có sản phẩm nên không thể xóa.')).toBeInTheDocument()
  })

  it('deletes an empty milestone and unlinks its phases', async () => {
    renderMilestones('g1')

    await openMenu('Demo giữa kỳ')
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Xóa mốc' }))
    const dialog = await screen.findByRole('alertdialog')
    expect(within(dialog).getByText(/1 giai đoạn đang liên kết/)).toBeInTheDocument()
    await userEvent.click(within(dialog).getByRole('button', { name: 'Xóa mốc' }))

    expect(names()).not.toContain('Demo giữa kỳ')
    expect(useMockStore.getState().phases.find((item) => item.id === 'g1-p3')?.milestoneId).toBeNull()
  })

  it('adds a milestone with its real due time', async () => {
    renderMilestones('g1')

    await userEvent.click(screen.getByRole('button', { name: 'Thêm mốc nộp' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.type(within(dialog).getByLabelText('Tên mốc nộp'), 'Nộp poster')
    await userEvent.clear(within(dialog).getByLabelText('Ngày hạn nộp'))
    await userEvent.type(within(dialog).getByLabelText('Ngày hạn nộp'), '2026-12-20')
    await userEvent.clear(within(dialog).getByLabelText('Giờ hạn nộp'))
    await userEvent.type(within(dialog).getByLabelText('Giờ hạn nộp'), '17:00')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Thêm mốc' }))

    const created = useMockStore.getState().milestones.find((item) => item.name === 'Nộp poster')
    // 17:00 in Vietnam
    expect(created?.dueAt).toBe('2026-12-20T10:00:00.000Z')
  })

  it('shows a plain member the milestones without management actions', () => {
    renderMilestones('g3')

    expect(screen.queryByRole('button', { name: 'Thêm mốc nộp' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Thao tác với mốc/ })).not.toBeInTheDocument()
  })
})
