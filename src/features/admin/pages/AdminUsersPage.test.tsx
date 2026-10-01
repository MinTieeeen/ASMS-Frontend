import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import type { AdminUserResponse, PageResponseAdminUserResponse } from '@/api/generated/models'
import AdminUsersPage from '@/features/admin/pages/AdminUsersPage'
import { useAuthStore } from '@/stores/auth.store'
import { apiUrl, problem, server, testUser } from '@/test/msw/server'
import { renderPage } from '@/test/render'

const pendingUser: AdminUserResponse = {
  id: 'user-pending',
  email: 'tran.thi.b@gmail.com',
  fullName: 'Trần Thị B',
  userCode: 'SE170001',
  systemRole: 'USER',
  status: 'PENDING_ACTIVATION',
  language: 'VI',
  createdAt: '2026-09-28T02:00:00Z',
}

const activeUser: AdminUserResponse = {
  ...pendingUser,
  id: 'user-active',
  email: 'le.van.c@gmail.com',
  fullName: 'Lê Văn C',
  userCode: 'SE170002',
  status: 'ACTIVE',
}

function page(items: AdminUserResponse[]): PageResponseAdminUserResponse {
  return { items, page: 0, size: 20, totalElements: items.length, totalPages: 1 }
}

function useUsers(items: AdminUserResponse[]) {
  server.use(http.get(apiUrl('/admin/users'), () => HttpResponse.json(page(items))))
}

function renderUsers() {
  useAuthStore.getState().setSession('admin-token', { ...testUser, systemRole: 'ADMIN' })
  return renderPage(<AdminUsersPage />, { path: '/admin/users', route: '/admin/users' })
}

async function openRowActions(name: string) {
  await userEvent.click(await screen.findByRole('button', { name: `Thao tác với ${name}` }))
  await userEvent.click(await screen.findByRole('menuitem', { name: 'Gửi lại email kích hoạt' }))
}

describe('AdminUsersPage', () => {
  beforeEach(() => useUsers([pendingUser, activeUser]))

  it('lists users with their status and actions only for pending accounts', async () => {
    renderUsers()

    const pendingRow = (await screen.findByText('Trần Thị B')).closest('tr')!
    expect(within(pendingRow).getByText('SE170001')).toBeInTheDocument()
    expect(within(pendingRow).getByText('Chờ kích hoạt')).toBeInTheDocument()
    const activeRow = screen.getByText('Lê Văn C').closest('tr')!
    expect(within(activeRow).getByText('Hoạt động')).toBeInTheDocument()
    expect(within(activeRow).queryByRole('button')).not.toBeInTheDocument()
  })

  it('UC-AUTH-08: sends the activation email again and shows MSG-26', async () => {
    let target: string | undefined
    server.use(
      http.post(apiUrl('/admin/users/:userId/activation-email'), ({ params }) => {
        target = params.userId as string
        return HttpResponse.json({ activationExpiresAt: '2026-10-02T02:00:00Z' })
      }),
    )
    renderUsers()

    await openRowActions('Trần Thị B')

    expect(
      await screen.findByText('Đã gửi lại email kích hoạt tới tran.thi.b@gmail.com.'),
    ).toBeInTheDocument()
    expect(target).toBe('user-pending')
  })

  it('shows MSG-30 and reloads the list when the account is no longer pending', async () => {
    server.use(
      http.post(apiUrl('/admin/users/:userId/activation-email'), () =>
        problem(409, 'USER_NOT_PENDING'),
      ),
    )
    renderUsers()
    await screen.findByText('Trần Thị B')
    useUsers([{ ...pendingUser, status: 'ACTIVE' }, activeUser])

    await openRowActions('Trần Thị B')

    expect(
      await screen.findByText('Tài khoản không còn ở trạng thái chờ kích hoạt.'),
    ).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('Chờ kích hoạt')).not.toBeInTheDocument())
  })

  it('opens the create account dialog', async () => {
    renderUsers()

    await userEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản' }))

    expect(await screen.findByRole('dialog', { name: 'Tạo tài khoản' })).toBeInTheDocument()
  })
})
