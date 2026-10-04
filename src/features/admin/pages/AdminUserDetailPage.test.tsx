import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import type { AdminUserDetailResponse, AuthEventItemResponse } from '@/api/generated/models'
import AdminUserDetailPage from '@/features/admin/pages/AdminUserDetailPage'
import { useAuthStore } from '@/stores/auth.store'
import { apiUrl, problem, server, testUser } from '@/test/msw/server'
import { renderPage } from '@/test/render'

const lockedUser: AdminUserDetailResponse = {
  id: 'user-locked',
  email: 'le.van.c@gmail.com',
  fullName: 'Lê Văn C',
  userCode: 'SE170002',
  systemRole: 'USER',
  status: 'LOCKED',
  bio: 'Sinh viên năm 3',
  createdAt: '2026-09-01T02:00:00Z',
  activatedAt: '2026-09-02T02:00:00Z',
  lockedAt: '2026-10-01T03:00:00Z',
  lockedReason: 'Chia sẻ tài khoản cho người khác',
  lockedBy: { id: 'admin-1', fullName: 'Quản Trị Viên', email: 'admin@asms.vn' },
  createdBy: { id: 'admin-1', fullName: 'Quản Trị Viên', email: 'admin@asms.vn' },
  activeSessionCount: 0,
  failedLoginCount: 2,
  version: 3,
  updatedAt: '2026-10-01T03:00:00Z',
}

function event(id: number, overrides: Partial<AuthEventItemResponse> = {}): AuthEventItemResponse {
  return {
    id,
    eventType: 'LOGIN_SUCCESS',
    ipAddress: '10.0.0.1',
    deviceLabel: 'Chrome · Windows',
    metadata: {},
    createdAt: '2026-09-30T02:00:00Z',
    ...overrides,
  }
}

function renderDetail(route = '/admin/users/user-locked') {
  useAuthStore.getState().setSession('admin-token', { ...testUser, systemRole: 'ADMIN' })
  return renderPage(<AdminUserDetailPage />, { path: '/admin/users/:userId', route })
}

describe('AdminUserDetailPage', () => {
  beforeEach(() => {
    server.use(http.get(apiUrl('/admin/users/:userId'), () => HttpResponse.json(lockedUser)))
  })

  it('shows the header, the locked banner and the info cards', async () => {
    renderDetail()

    expect(await screen.findByRole('heading', { level: 1, name: 'Lê Văn C' })).toBeInTheDocument()
    expect(screen.getByText(/Đã khóa lúc .* bởi Quản Trị Viên\./)).toBeInTheDocument()
    expect(screen.getByText('Lý do: Chia sẻ tài khoản cho người khác')).toBeInTheDocument()
    expect(screen.getByText('Sinh viên năm 3')).toBeInTheDocument()
    expect(screen.getByText('Chưa kết nối')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Gửi lại email kích hoạt' }),
    ).not.toBeInTheDocument()
  })

  it('MSG-47: shows "not found" for an unknown user', async () => {
    server.use(http.get(apiUrl('/admin/users/:userId'), () => problem(404, 'USER_NOT_FOUND')))
    renderDetail('/admin/users/missing')

    expect(await screen.findByText('Không tìm thấy người dùng.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Về danh sách người dùng' })).toHaveAttribute(
      'href',
      '/admin/users',
    )
  })

  it('opens the tab named in the URL and loads more sign-in events by cursor', async () => {
    const cursors: (string | null)[] = []
    server.use(
      http.get(apiUrl('/admin/users/:userId/auth-events'), ({ request }) => {
        const cursor = new URL(request.url).searchParams.get('cursor')
        cursors.push(cursor)
        return HttpResponse.json(
          cursor
            ? { items: [event(1, { eventType: 'LOGOUT' })] }
            : {
                items: [
                  event(3, { eventType: 'LOGIN_FAILED', metadata: { reason: 'INVALID_PASSWORD' } }),
                  event(2),
                ],
                nextCursor: 'next-1',
              },
        )
      }),
    )
    renderDetail('/admin/users/user-locked?tab=auth-events')

    const failedRow = (await screen.findByText('Đăng nhập thất bại')).closest('tr')!
    expect(within(failedRow).getByText('Chrome · Windows · sai mật khẩu')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Tải thêm' }))

    expect(await screen.findByText('Đăng xuất')).toBeInTheDocument()
    expect(cursors).toEqual([null, 'next-1'])
    expect(screen.queryByRole('button', { name: 'Tải thêm' })).not.toBeInTheDocument()
  })

  it('MSG-65: says when there is no sign-in activity', async () => {
    server.use(
      http.get(apiUrl('/admin/users/:userId/auth-events'), () => HttpResponse.json({ items: [] })),
    )
    const { router } = renderDetail()
    await screen.findByRole('heading', { level: 1 })

    await userEvent.click(screen.getByRole('tab', { name: 'Hoạt động đăng nhập' }))

    expect(await screen.findByText('Chưa có hoạt động đăng nhập.')).toBeInTheDocument()
    expect(router.state.location.search).toBe('?tab=auth-events')
  })
})
