import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useMockStore } from '@/mocks'
import { renderPage } from '@/test/render'

import GroupMembersPage from './GroupMembersPage'

function renderMembers(groupId: string) {
  return renderPage(<GroupMembersPage />, {
    path: '/groups/:groupId/members',
    route: `/groups/${groupId}/members`,
  })
}

describe('GroupMembersPage (M03)', () => {
  beforeEach(() => useMockStore.getState().resetDemo())

  it('gives the leader member actions, join requests and the invite panel', () => {
    renderMembers('g1')

    expect(screen.getAllByRole('button', { name: /^Thao tác với/ })).toHaveLength(4)
    expect(screen.getByText('Yêu cầu tham gia')).toBeInTheDocument()
    expect(screen.getByText('Mời thành viên')).toBeInTheDocument()
    expect(screen.queryByLabelText('Mời qua e-mail')).not.toBeInTheDocument()
  })

  it('stops the leader from leaving before transferring leadership (UC05)', () => {
    renderMembers('g1')

    expect(screen.getByRole('button', { name: 'Rời nhóm' })).toBeDisabled()
    expect(screen.getByText('Hãy chuyển quyền trưởng nhóm trước khi rời nhóm.')).toBeInTheDocument()
  })

  it('lists former members with the reason they left (BR10)', () => {
    renderMembers('g1')

    const former = screen.getByText('Thành viên cũ').closest('[data-slot="card"]') as HTMLElement
    expect(within(former).getByText(/Đã rời nhóm/)).toBeInTheDocument()
  })

  it('shows a plain member the list only, without management actions', () => {
    renderMembers('g3')

    expect(screen.queryByRole('button', { name: /^Thao tác với/ })).not.toBeInTheDocument()
    expect(screen.queryByText('Yêu cầu tham gia')).not.toBeInTheDocument()
    expect(screen.queryByText('Mời thành viên')).not.toBeInTheDocument()
  })

  it('lets a member leave the group and returns to the group list', async () => {
    const { router } = renderMembers('g3')

    await userEvent.click(screen.getByRole('button', { name: 'Rời nhóm' }))
    const dialog = await screen.findByRole('alertdialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Rời nhóm' }))

    expect(router.state.location.pathname).toBe('/groups')
  })
})
