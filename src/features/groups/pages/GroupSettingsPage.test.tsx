import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useMockStore } from '@/mocks'
import { renderPage } from '@/test/render'

import GroupSettingsPage from './GroupSettingsPage'

function renderSettings(groupId: string) {
  return renderPage(<GroupSettingsPage />, { path: '/groups/:groupId/settings', route: `/groups/${groupId}/settings` })
}

const groupOf = (id: string) => useMockStore.getState().groups.find((item) => item.id === id)

describe('GroupSettingsPage', () => {
  beforeEach(() => useMockStore.getState().resetDemo())

  it('lets the leader edit the group information and classification (F02.01)', async () => {
    renderSettings('g1')

    const topic = screen.getByLabelText('Đề tài')
    await userEvent.clear(topic)
    await userEvent.type(topic, 'Ứng dụng tìm phòng trọ')
    await userEvent.clear(screen.getByLabelText('Giảng viên'))
    await userEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    expect(groupOf('g1')).toMatchObject({ topic: 'Ứng dụng tìm phòng trọ', lecturerName: null })
  })

  it('does not offer a member limit below the current members (BR02)', async () => {
    renderSettings('g1')

    await userEvent.click(screen.getByLabelText('Số thành viên tối đa'))
    const options = (await screen.findAllByRole('option')).map((option) => option.textContent)
    expect(options[0]).toBe('5')
  })

  it('saves the joining settings at once', async () => {
    renderSettings('g1')

    await userEvent.click(screen.getByRole('switch', { name: 'Cần duyệt khi tham gia' }))
    await userEvent.click(screen.getByRole('combobox', { name: 'Hạn dùng link mời' }))
    await userEvent.click(await screen.findByRole('option', { name: 'Không hết hạn' }))

    expect(groupOf('g1')).toMatchObject({ requireApproval: false, inviteExpiresAt: null })
  })

  it('keeps the review step on while tasks wait for review (BR07)', async () => {
    renderSettings('g1')
    expect(screen.getByRole('switch', { name: 'Bật bước duyệt công việc' })).toBeDisabled()
  })

  it('turns the review step off once nothing waits, which also disables the result rule', async () => {
    useMockStore.getState().approveTask('t5')
    renderSettings('g1')

    await userEvent.click(screen.getByRole('switch', { name: 'Bật bước duyệt công việc' }))

    expect(groupOf('g1')?.reviewEnabled).toBe(false)
    expect(screen.getByRole('switch', { name: 'Bắt buộc nộp kết quả khi gửi duyệt' })).toBeDisabled()
  })

  it('archives the group after confirmation and can restore it (F03.09)', async () => {
    renderSettings('g1')

    await userEvent.click(screen.getByRole('button', { name: 'Lưu trữ nhóm' }))
    await userEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Lưu trữ nhóm' }))
    expect(groupOf('g1')?.status).toBe('archived')

    await userEvent.click(await screen.findByRole('button', { name: 'Khôi phục nhóm' }))
    expect(groupOf('g1')?.status).toBe('active')
  })

  it('shows the settings read-only to a member, without archiving', () => {
    renderSettings('g3')

    expect(screen.getByText('Chỉ trưởng nhóm thay đổi được cài đặt')).toBeInTheDocument()
    expect(screen.getByLabelText('Tên nhóm')).toBeDisabled()
    expect(screen.getByRole('switch', { name: 'Cần duyệt khi tham gia' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Lưu thay đổi' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Lưu trữ nhóm' })).not.toBeInTheDocument()
  })
})
