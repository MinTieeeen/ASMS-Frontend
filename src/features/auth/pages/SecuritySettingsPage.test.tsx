import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import type { SessionResponse } from '@/api/generated/models'
import SecuritySettingsPage from '@/features/auth/pages/SecuritySettingsPage'
import { useAuthStore } from '@/stores/auth.store'
import { apiUrl, problem, server, testUser } from '@/test/msw/server'
import { renderPage } from '@/test/render'

const currentSession: SessionResponse = {
  id: 'session-current',
  deviceLabel: 'Chrome 128 · Windows 11',
  ipAddress: '203.0.113.10',
  createdAt: '2026-09-20T02:00:00Z',
  lastUsedAt: new Date().toISOString(),
  current: true,
}

const phoneSession: SessionResponse = {
  id: 'session-phone',
  deviceLabel: 'Safari 17 · iOS 17',
  ipAddress: '198.51.100.7',
  createdAt: '2026-09-18T02:00:00Z',
  lastUsedAt: new Date(Date.now() - 2 * 60 * 60_000).toISOString(),
  current: false,
}

function useSessions(sessions: SessionResponse[]) {
  server.use(http.get(apiUrl('/auth/sessions'), () => HttpResponse.json(sessions)))
}

function renderSecurity() {
  useAuthStore.getState().setSession('access-token', testUser)
  return renderPage(<SecuritySettingsPage />, {
    path: '/settings/security',
    route: '/settings/security',
  })
}

async function fillPasswords(current: string, next: string, confirm = next) {
  await userEvent.type(screen.getByLabelText('Mật khẩu hiện tại'), current)
  await userEvent.type(screen.getByLabelText('Mật khẩu mới'), next)
  await userEvent.type(screen.getByLabelText('Nhập lại mật khẩu mới'), confirm)
  await userEvent.click(screen.getByRole('button', { name: 'Lưu mật khẩu' }))
}

describe('SecuritySettingsPage (SCR-AUTH-05)', () => {
  beforeEach(() => useSessions([currentSession, phoneSession]))

  describe('change password', () => {
    it('keeps "Save" disabled while the form is empty', () => {
      renderSecurity()

      expect(screen.getByRole('button', { name: 'Lưu mật khẩu' })).toBeDisabled()
      expect(screen.queryByRole('button', { name: 'Hủy' })).not.toBeInTheDocument()
    })

    it('rejects a new password equal to the current one without calling the API', async () => {
      let called = false
      server.use(
        http.put(apiUrl('/auth/password'), () => {
          called = true
          return new HttpResponse(null, { status: 204 })
        }),
      )
      renderSecurity()

      await fillPasswords('Secret123', 'Secret123')

      expect(
        await screen.findByText('Mật khẩu mới phải khác mật khẩu hiện tại.'),
      ).toBeInTheDocument()
      expect(called).toBe(false)
    })

    it('A2: shows MSG-13, clears the form and reloads the user and the devices', async () => {
      let body: unknown
      let meCalls = 0
      server.use(
        http.put(apiUrl('/auth/password'), async ({ request }) => {
          body = await request.json()
          return new HttpResponse(null, { status: 204 })
        }),
        http.get(apiUrl('/auth/me'), () => {
          meCalls += 1
          return HttpResponse.json({ ...testUser, passwordChangedAt: '2026-09-29T03:00:00Z' })
        }),
      )
      renderSecurity()

      await fillPasswords('Secret123', 'NewSecret456')

      expect(
        await screen.findByText('Đã đổi mật khẩu. Các thiết bị khác đã được đăng xuất.'),
      ).toBeInTheDocument()
      expect(body).toEqual({ currentPassword: 'Secret123', newPassword: 'NewSecret456' })
      expect(screen.getByLabelText('Mật khẩu hiện tại')).toHaveValue('')
      await waitFor(() => expect(meCalls).toBe(1))
      expect(await screen.findByText(/Đổi lần cuối:/)).toBeInTheDocument()
    })

    it('shows MSG-14 on the current password and clears it', async () => {
      server.use(
        http.put(apiUrl('/auth/password'), () => problem(400, 'AUTH_CURRENT_PASSWORD_WRONG')),
      )
      renderSecurity()

      await fillPasswords('Wrong1234', 'NewSecret456')

      expect(await screen.findByText('Mật khẩu hiện tại không đúng.')).toBeInTheDocument()
      expect(screen.getByLabelText('Mật khẩu hiện tại')).toHaveValue('')
      expect(screen.getByLabelText('Mật khẩu mới')).toHaveValue('NewSecret456')
    })

    it('ends the session when too many wrong current passwords lock the account', async () => {
      server.use(http.put(apiUrl('/auth/password'), () => problem(423, 'AUTH_ACCOUNT_TEMP_LOCKED')))
      renderSecurity()

      await fillPasswords('Wrong1234', 'NewSecret456')

      await waitFor(() => expect(useAuthStore.getState().status).toBe('anonymous'))
      expect(useAuthStore.getState().exitPath).toBe('/login')
    })
  })

  describe('devices', () => {
    it('lists this device first with its badge and the others with a logout button', async () => {
      renderSecurity()

      const list = await screen.findByRole('list', { name: 'Thiết bị đang đăng nhập' })
      const rows = within(list).getAllByRole('listitem')
      expect(rows).toHaveLength(2)
      expect(within(rows[0]!).getByText('Thiết bị này')).toBeInTheDocument()
      expect(within(rows[0]!).getByText('Đang hoạt động')).toBeInTheDocument()
      expect(within(rows[0]!).queryByRole('button')).not.toBeInTheDocument()
      expect(within(rows[1]!).getByText('2 giờ trước')).toBeInTheDocument()
      expect(
        within(rows[1]!).getByRole('button', { name: 'Đăng xuất Safari 17 · iOS 17' }),
      ).toBeInTheDocument()
    })

    it('says so when no other device is signed in', async () => {
      useSessions([currentSession])
      renderSecurity()

      expect(
        await screen.findByText('Không có thiết bị nào khác đang đăng nhập.'),
      ).toBeInTheDocument()
    })

    it('A4: logs out another device after confirmation', async () => {
      let revoked: string | undefined
      server.use(
        http.delete(apiUrl('/auth/sessions/:sessionId'), ({ params }) => {
          revoked = params.sessionId as string
          return new HttpResponse(null, { status: 204 })
        }),
      )
      renderSecurity()

      await userEvent.click(
        await screen.findByRole('button', { name: 'Đăng xuất Safari 17 · iOS 17' }),
      )
      const dialog = await screen.findByRole('alertdialog', { name: 'Đăng xuất thiết bị?' })
      await userEvent.click(within(dialog).getByRole('button', { name: 'Đăng xuất' }))

      expect(await screen.findByText('Đã đăng xuất thiết bị.')).toBeInTheDocument()
      expect(revoked).toBe('session-phone')
      expect(screen.queryByText('Safari 17 · iOS 17')).not.toBeInTheDocument()
    })

    it('A5: shows MSG-31 and reloads the list when the device is already gone', async () => {
      server.use(
        http.delete(apiUrl('/auth/sessions/:sessionId'), () =>
          problem(404, 'AUTH_SESSION_NOT_FOUND'),
        ),
      )
      renderSecurity()

      await userEvent.click(
        await screen.findByRole('button', { name: 'Đăng xuất Safari 17 · iOS 17' }),
      )
      useSessions([currentSession])
      const dialog = await screen.findByRole('alertdialog')
      await userEvent.click(within(dialog).getByRole('button', { name: 'Đăng xuất' }))

      expect(
        await screen.findByText('Thiết bị này đã được đăng xuất trước đó.'),
      ).toBeInTheDocument()
      await waitFor(() => expect(screen.queryByText('Safari 17 · iOS 17')).not.toBeInTheDocument())
    })

    it('offers a retry when the list cannot be loaded', async () => {
      server.use(http.get(apiUrl('/auth/sessions'), () => problem(500, 'INTERNAL_ERROR')))
      renderSecurity()

      expect(await screen.findByText('Không tải được danh sách thiết bị.')).toBeInTheDocument()

      useSessions([currentSession, phoneSession])
      await userEvent.click(screen.getByRole('button', { name: 'Thử lại' }))

      expect(await screen.findByText('Safari 17 · iOS 17')).toBeInTheDocument()
    })
  })
})
