import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { MAX_UPLOAD_SIZE_BYTES } from '@/config/constants'
import { useMockStore } from '@/mocks'
import { renderPage } from '@/test/render'

import GroupMilestoneDetailPage from './GroupMilestoneDetailPage'

function renderMilestone(groupId: string, milestoneId: string) {
  return renderPage(<GroupMilestoneDetailPage />, {
    path: '/groups/:groupId/milestones/:milestoneId',
    route: `/groups/${groupId}/milestones/${milestoneId}`,
  })
}

const versionsOf = (milestoneId: string) =>
  useMockStore
    .getState()
    .deliverables.filter((item) => item.milestoneId === milestoneId)
    .sort((a, b) => a.version - b.version)

async function openSubmit() {
  await userEvent.click(screen.getByRole('button', { name: 'Nộp sản phẩm' }))
  return screen.findByRole('dialog')
}

describe('GroupMilestoneDetailPage (UC10)', () => {
  beforeEach(() => useMockStore.getState().resetDemo())

  it('lists versions newest first and lets a manager pick another primary version', async () => {
    renderMilestone('g1', 'g1-m2')

    const rows = within(screen.getByRole('table', { name: 'Sản phẩm đã nộp' })).getAllByRole('row').slice(1)
    expect(rows.map((row) => within(row).getAllByRole('cell')[0]?.textContent)).toEqual(['v2Bản chính', 'v1'])

    await userEvent.click(screen.getByRole('button', { name: 'Đặt v1 làm bản chính' }))
    expect(versionsOf('g1-m2').map((item) => item.isPrimary)).toEqual([true, false])
  })

  it('submits a link as a new primary version and rejects an invalid link', async () => {
    renderMilestone('g1', 'g1-m2')

    const dialog = await openSubmit()
    await userEvent.click(within(dialog).getByLabelText('Dán link'))
    await userEvent.type(within(dialog).getByLabelText('Đường dẫn'), 'github.com/nhom3')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Nộp phiên bản v3' }))
    expect(within(dialog).getByText(/Nhập đường dẫn hợp lệ/)).toBeInTheDocument()

    await userEvent.clear(within(dialog).getByLabelText('Đường dẫn'))
    await userEvent.type(within(dialog).getByLabelText('Đường dẫn'), 'https://github.com/nhom3')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Nộp phiên bản v3' }))

    const latest = versionsOf('g1-m2').at(-1)
    expect(latest).toMatchObject({ version: 3, kind: 'link', url: 'https://github.com/nhom3', isPrimary: true })
  })

  it('refuses a file over the 25 MB limit (BR14)', async () => {
    renderMilestone('g1', 'g1-m2')

    const dialog = await openSubmit()
    const file = new File(['x'], 'video.mp4', { type: 'video/mp4' })
    Object.defineProperty(file, 'size', { value: MAX_UPLOAD_SIZE_BYTES + 1 })
    await userEvent.upload(within(dialog).getByLabelText('Chọn file'), file)
    await userEvent.click(within(dialog).getByRole('button', { name: 'Nộp phiên bản v3' }))

    expect(within(dialog).getByText(/File vượt quá/)).toBeInTheDocument()
    expect(versionsOf('g1-m2')).toHaveLength(2)
  })

  it('records the result, which marks the milestone graded (UC10 step 5)', async () => {
    renderMilestone('g1', 'g1-m2')

    await userEvent.click(screen.getByRole('button', { name: 'Ghi kết quả' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.type(within(dialog).getByLabelText('Điểm (thang 10)'), '9.25')
    await userEvent.type(within(dialog).getByLabelText('Nhận xét của giảng viên'), 'Thiết kế tốt')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Lưu' }))

    expect(useMockStore.getState().milestones.find((item) => item.id === 'g1-m2')).toMatchObject({
      status: 'graded',
      score: 9.25,
      feedback: 'Thiết kế tốt',
    })
  })

  it('lets a plain member submit but not record results or pick the primary version', () => {
    renderMilestone('g3', 'g3-m1')

    expect(screen.getByRole('button', { name: 'Nộp sản phẩm' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Ghi kết quả' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Thao tác với mốc/ })).not.toBeInTheDocument()
  })

  it('says when the milestone does not exist', () => {
    renderMilestone('g1', 'missing')

    expect(screen.getByText('Không tìm thấy mốc nộp')).toBeInTheDocument()
  })
})
