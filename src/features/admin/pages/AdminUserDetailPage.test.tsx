import { screen, waitFor, within } from '@testing-library/react'
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

  describe('editing and actions', () => {
    const pendingUser: AdminUserDetailResponse = {
      ...lockedUser,
      id: 'user-pending',
      email: 'tran.thi.b@gmail.com',
      fullName: 'Trần Thị B',
      userCode: 'SE170001',
      status: 'PENDING_ACTIVATION',
      activatedAt: undefined,
      lockedAt: undefined,
      lockedReason: undefined,
      lockedBy: undefined,
      version: 5,
    }

    function serve(user: AdminUserDetailResponse) {
      server.use(http.get(apiUrl('/admin/users/:userId'), () => HttpResponse.json(user)))
    }

    async function startEditing() {
      await userEvent.click(await screen.findByRole('button', { name: 'Sửa thông tin' }))
      return screen.findByRole('textbox', { name: 'Họ tên' })
    }

    it('MSG-52: sends only the changed fields with the version, then leaves edit mode', async () => {
      serve(pendingUser)
      let body: unknown
      server.use(
        http.patch(apiUrl('/admin/users/:userId'), async ({ request }) => {
          body = await request.json()
          return HttpResponse.json({
            ...pendingUser,
            fullName: 'Trần Thị Bích',
            email: 'bich@gmail.com',
            version: 6,
          })
        }),
      )
      renderDetail('/admin/users/user-pending')

      const fullName = await startEditing()
      expect(fullName).toHaveFocus()
      expect(
        screen.getByText('Hệ thống sẽ gửi link kích hoạt mới tới email này.'),
      ).toBeInTheDocument()
      await userEvent.clear(fullName)
      await userEvent.type(fullName, '  Trần  Thị Bích ')
      const email = screen.getByRole('textbox', { name: 'Email' })
      await userEvent.clear(email)
      await userEvent.type(email, 'Bich@Gmail.com')
      await userEvent.click(screen.getByRole('button', { name: 'Lưu' }))

      expect(
        await screen.findByText('Đã lưu và gửi link kích hoạt tới email mới bich@gmail.com.'),
      ).toBeInTheDocument()
      expect(body).toEqual({ version: 5, fullName: 'Trần Thị Bích', email: 'bich@gmail.com' })
      expect(screen.queryByRole('textbox', { name: 'Họ tên' })).not.toBeInTheDocument()
    })

    it('BR-USER-08: the email of an active account is read-only', async () => {
      serve({ ...pendingUser, status: 'ACTIVE', activatedAt: '2026-09-02T02:00:00Z' })
      renderDetail('/admin/users/user-pending')

      await startEditing()

      expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('readonly')
      expect(
        screen.getByText('Chỉ đổi được email khi tài khoản đang chờ kích hoạt.'),
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Lưu' })).toBeDisabled()
    })

    it('MSG-38 and duplicate user ID: conflict banner, error under the field', async () => {
      serve(pendingUser)
      server.use(
        http.patch(apiUrl('/admin/users/:userId'), async ({ request }) => {
          const body = (await request.json()) as { userCode?: string }
          return body.userCode === 'SE999'
            ? problem(409, 'USER_CODE_EXISTS')
            : problem(409, 'USER_VERSION_CONFLICT')
        }),
      )
      renderDetail('/admin/users/user-pending')
      const fullName = await startEditing()

      await userEvent.type(fullName, ' X')
      await userEvent.click(screen.getByRole('button', { name: 'Lưu' }))
      expect(await screen.findByText('Dữ liệu đã thay đổi')).toBeInTheDocument()

      const userCode = screen.getByRole('textbox', { name: 'ID người dùng' })
      await userEvent.clear(userCode)
      await userEvent.type(userCode, 'se999')
      await userEvent.click(screen.getByRole('button', { name: 'Lưu' }))
      expect(await screen.findByText('ID người dùng này đã được sử dụng.')).toBeInTheDocument()
    })

    it('MSG-68: cancelling with changes asks first', async () => {
      serve(pendingUser)
      renderDetail('/admin/users/user-pending')
      const fullName = await startEditing()

      await userEvent.type(fullName, ' X')
      await userEvent.click(screen.getByRole('button', { name: 'Hủy' }))
      const confirm = await screen.findByRole('alertdialog', { name: 'Bỏ các thay đổi?' })
      await userEvent.click(within(confirm).getByRole('button', { name: 'Bỏ thay đổi' }))

      await waitFor(() =>
        expect(screen.queryByRole('textbox', { name: 'Họ tên' })).not.toBeInTheDocument(),
      )
      expect(screen.getByRole('heading', { level: 1, name: 'Trần Thị B' })).toBeInTheDocument()
    })

    it('MSG-64: signs the user out of every device', async () => {
      serve({ ...pendingUser, status: 'ACTIVE', activeSessionCount: 3 })
      server.use(
        http.post(apiUrl('/admin/users/:userId/logout-all'), () =>
          HttpResponse.json({ revokedCount: 3, user: { ...pendingUser, status: 'ACTIVE' } }),
        ),
      )
      renderDetail('/admin/users/user-pending')

      await userEvent.click(await screen.findByRole('button', { name: 'Đăng xuất mọi thiết bị' }))
      const dialog = await screen.findByRole('dialog', { name: 'Đăng xuất mọi thiết bị' })
      expect(
        within(dialog).getByText(
          '3 phiên đang hoạt động sẽ bị thu hồi. Người này phải đăng nhập lại.',
        ),
      ).toBeInTheDocument()
      await userEvent.click(within(dialog).getByRole('button', { name: 'Đăng xuất' }))

      expect(
        await screen.findByText('Đã đăng xuất Trần Thị B khỏi 3 thiết bị.'),
      ).toBeInTheDocument()
    })

    it('MSG-55: lock and sign out are disabled on your own account', async () => {
      serve({ ...pendingUser, id: testUser.id, status: 'ACTIVE' })
      renderDetail(`/admin/users/${testUser.id}`)

      const lock = await screen.findByRole('button', { name: 'Khóa tài khoản' })
      expect(lock).toHaveAttribute('aria-disabled', 'true')
      expect(screen.getByRole('button', { name: 'Đăng xuất mọi thiết bị' })).toHaveAttribute(
        'aria-disabled',
        'true',
      )
      await userEvent.click(lock)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
