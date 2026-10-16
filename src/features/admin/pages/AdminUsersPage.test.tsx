import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import type {
  AdminUserSummaryResponse,
  PageResponseAdminUserSummaryResponse,
} from '@/api/generated/models'
import AdminUsersPage from '@/features/admin/pages/AdminUsersPage'
import { useAuthStore } from '@/stores/auth.store'
import { apiUrl, problem, server, testUser } from '@/test/msw/server'
import { renderPage } from '@/test/render'

const pendingUser: AdminUserSummaryResponse = {
  id: 'user-pending',
  email: 'tran.thi.b@gmail.com',
  fullName: 'Trần Thị B',
  userCode: 'SE170001',
  systemRole: 'USER',
  status: 'PENDING_ACTIVATION',
  createdAt: '2026-09-28T02:00:00Z',
}

const activeUser: AdminUserSummaryResponse = {
  ...pendingUser,
  id: 'user-active',
  email: 'le.van.c@gmail.com',
  fullName: 'Lê Văn C',
  userCode: 'SE170002',
  status: 'ACTIVE',
  lastLoginAt: '2026-10-03T02:00:00Z',
}

function page(items: AdminUserSummaryResponse[]): PageResponseAdminUserSummaryResponse {
  return { items, page: 1, size: 20, totalItems: items.length, totalPages: 1 }
}

/** Serves `items` and records the query string of every list request */
function useUsers(items: AdminUserSummaryResponse[]) {
  const requests: URLSearchParams[] = []
  server.use(
    http.get(apiUrl('/admin/users'), ({ request }) => {
      requests.push(new URL(request.url).searchParams)
      return HttpResponse.json(page(items))
    }),
  )
  return requests
}

function renderUsers(route = '/admin/users') {
  useAuthStore.getState().setSession('admin-token', { ...testUser, systemRole: 'ADMIN' })
  return renderPage(<AdminUsersPage />, { path: '/admin/users', route })
}

async function openRowActions(name: string) {
  await userEvent.click(await screen.findByRole('button', { name: `Thao tác với ${name}` }))
  return screen.findByRole('menu')
}

describe('AdminUsersPage', () => {
  // Desktop width: the table (the setup's matchMedia matches nothing, i.e. a phone)
  const phoneMatchMedia = window.matchMedia
  beforeEach(() => {
    window.matchMedia = (query: string) =>
      ({ ...phoneMatchMedia(query), matches: query.includes('min-width') }) as MediaQueryList
  })
  afterEach(() => {
    window.matchMedia = phoneMatchMedia
  })

  it("lists users with their status, and marks the Admin's own row", async () => {
    useUsers([pendingUser, activeUser, { ...activeUser, id: testUser.id, fullName: 'Tôi' }])
    renderUsers()

    const pendingRow = (await screen.findByText('Trần Thị B')).closest('tr')!
    expect(within(pendingRow).getByText('SE170001')).toBeInTheDocument()
    expect(within(pendingRow).getByText('Chờ kích hoạt')).toBeInTheDocument()
    const activeRow = screen.getByText('Lê Văn C').closest('tr')!
    expect(within(activeRow).getByText('Hoạt động')).toBeInTheDocument()
    expect(within(screen.getByText('Tôi').closest('tr')!).getByText('Bạn')).toBeInTheDocument()
  })

  it('offers "resend activation" only for pending accounts', async () => {
    useUsers([pendingUser, activeUser])
    renderUsers()

    const activeMenu = await openRowActions('Lê Văn C')
    expect(within(activeMenu).getByRole('menuitem', { name: 'Xem chi tiết' })).toBeInTheDocument()
    expect(
      within(activeMenu).queryByRole('menuitem', { name: 'Gửi lại email kích hoạt' }),
    ).not.toBeInTheDocument()
    await userEvent.keyboard('{Escape}')

    const pendingMenu = await openRowActions('Trần Thị B')
    expect(
      within(pendingMenu).getByRole('menuitem', { name: 'Gửi lại email kích hoạt' }),
    ).toBeInTheDocument()
  })

  it('reads the filters from the URL and sends them to the API', async () => {
    const requests = useUsers([activeUser])
    renderUsers(
      '/admin/users?q=nguyen&status=ACTIVE&status=LOCKED&role=USER&sort=fullName,asc&page=2',
    )

    await screen.findByText('Lê Văn C')
    const params = requests.at(-1)!
    expect(params.get('q')).toBe('nguyen')
    expect(params.getAll('status')).toEqual(['ACTIVE', 'LOCKED'])
    expect(params.get('role')).toBe('USER')
    expect(params.get('sort')).toBe('fullName,asc')
    expect(params.get('page')).toBe('2')
    expect(screen.getByRole('searchbox', { name: 'Tìm người dùng' })).toHaveValue('nguyen')
    expect(screen.getByRole('button', { name: 'Trạng thái (2)' })).toBeInTheDocument()
  })

  it('MSG-49: a one-character keyword is not searched', async () => {
    const requests = useUsers([pendingUser])
    const { router } = renderUsers()
    await screen.findByText('Trần Thị B')

    await userEvent.type(screen.getByRole('searchbox', { name: 'Tìm người dùng' }), 'a')

    expect(await screen.findByText('Nhập ít nhất 2 ký tự để tìm kiếm.')).toBeInTheDocument()
    await waitFor(() => expect(router.state.location.search).toBe('?q=a'))
    expect(requests.every((params) => !params.has('q'))).toBe(true)
  })

  it('sorts by a column header and goes back to page 1', async () => {
    useUsers([pendingUser])
    const { router } = renderUsers('/admin/users?page=3')
    await screen.findByText('Trần Thị B')

    await userEvent.click(screen.getByRole('button', { name: 'Sắp xếp theo Người dùng' }))

    await waitFor(() => expect(router.state.location.search).toBe('?sort=fullName%2Cdesc'))
  })

  it('opens the detail page from the row', async () => {
    useUsers([pendingUser])
    const { router } = renderUsers()

    await userEvent.click(await screen.findByRole('link', { name: 'Trần Thị B' }))

    expect(router.state.location.pathname).toBe('/admin/users/user-pending')
  })

  it('shows an empty state with "clear filters" when nothing matches', async () => {
    useUsers([])
    const { router } = renderUsers('/admin/users?q=zz')

    expect(await screen.findByText('Không có người dùng phù hợp với bộ lọc.')).toBeInTheDocument()
    await userEvent.click(screen.getAllByRole('button', { name: 'Xóa bộ lọc' }).at(-1)!)

    await waitFor(() => expect(router.state.location.search).toBe(''))
  })

  it('UC-AUTH-08: sends the activation email again and shows MSG-26', async () => {
    useUsers([pendingUser, activeUser])
    let target: string | undefined
    server.use(
      http.post(apiUrl('/admin/users/:userId/activation-email'), ({ params }) => {
        target = params.userId as string
        return HttpResponse.json({ activationExpiresAt: '2026-10-02T02:00:00Z' })
      }),
    )
    renderUsers()

    await userEvent.click(
      within(await openRowActions('Trần Thị B')).getByRole('menuitem', {
        name: 'Gửi lại email kích hoạt',
      }),
    )

    expect(
      await screen.findByText('Đã gửi lại email kích hoạt tới tran.thi.b@gmail.com.'),
    ).toBeInTheDocument()
    expect(target).toBe('user-pending')
  })

  it('shows MSG-30 and reloads the list when the account is no longer pending', async () => {
    useUsers([pendingUser, activeUser])
    server.use(
      http.post(apiUrl('/admin/users/:userId/activation-email'), () =>
        problem(409, 'USER_NOT_PENDING'),
      ),
    )
    renderUsers()
    await screen.findByText('Trần Thị B')
    useUsers([{ ...pendingUser, status: 'ACTIVE' }, activeUser])

    await userEvent.click(
      within(await openRowActions('Trần Thị B')).getByRole('menuitem', {
        name: 'Gửi lại email kích hoạt',
      }),
    )

    expect(
      await screen.findByText('Tài khoản không còn ở trạng thái chờ kích hoạt.'),
    ).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('Chờ kích hoạt')).not.toBeInTheDocument())
  })

  it('shows cards on a phone', async () => {
    window.matchMedia = phoneMatchMedia
    useUsers([pendingUser])
    renderUsers()

    const card = (await screen.findByRole('link', { name: /Trần Thị B/ })).closest('li')!
    expect(within(card).getByText('Chờ kích hoạt')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('opens the create account dialog', async () => {
    useUsers([])
    renderUsers()

    await userEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản' }))

    expect(await screen.findByRole('dialog', { name: 'Tạo tài khoản' })).toBeInTheDocument()
  })

  describe('SCR-USER-06 from the list', () => {
    const REASON = 'Chia sẻ tài khoản cho người ngoài nhóm.'

    async function openLock(name: string) {
      await userEvent.click(
        within(await openRowActions(name)).getByRole('menuitem', { name: 'Khóa tài khoản' }),
      )
      return screen.findByRole('dialog', { name: 'Khóa tài khoản' })
    }

    it("MSG-55: the Admin's own row cannot be locked", async () => {
      useUsers([{ ...activeUser, id: testUser.id, fullName: 'Tôi' }])
      renderUsers()

      const menu = await openRowActions('Tôi')

      expect(within(menu).getByRole('menuitem', { name: /Khóa tài khoản/ })).toHaveAttribute(
        'aria-disabled',
        'true',
      )
      expect(
        within(menu).getByText('Không thể thực hiện thao tác này với tài khoản của chính bạn.'),
      ).toBeInTheDocument()
    })

    it('MSG-63, then MSG-58: locks with a trimmed reason of 10-500 characters', async () => {
      useUsers([activeUser])
      let body: unknown
      server.use(
        http.post(apiUrl('/admin/users/:userId/lock'), async ({ request }) => {
          body = await request.json()
          return HttpResponse.json({ ...activeUser, status: 'LOCKED' })
        }),
      )
      renderUsers()
      const dialog = await openLock('Lê Văn C')
      const reason = within(dialog).getByRole('textbox', { name: 'Lý do' })
      const confirm = within(dialog).getByRole('button', { name: 'Khóa tài khoản' })
      expect(confirm).toBeDisabled()

      await userEvent.type(reason, 'quá ngắn')
      await userEvent.click(confirm)
      expect(within(dialog).getByText('Lý do phải từ 10 đến 500 ký tự.')).toBeInTheDocument()

      await userEvent.clear(reason)
      await userEvent.type(reason, `  ${REASON}  `)
      await userEvent.click(confirm)

      expect(
        await screen.findByText('Đã khóa tài khoản Lê Văn C và gửi email thông báo.'),
      ).toBeInTheDocument()
      expect(body).toEqual({ reason: REASON })
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    })

    it('MSG-56: the last active Admin stays, the dialog shows why', async () => {
      useUsers([activeUser])
      server.use(
        http.post(apiUrl('/admin/users/:userId/lock'), () => problem(409, 'USER_LAST_ADMIN')),
      )
      renderUsers()
      const dialog = await openLock('Lê Văn C')

      await userEvent.type(within(dialog).getByRole('textbox', { name: 'Lý do' }), REASON)
      await userEvent.click(within(dialog).getByRole('button', { name: 'Khóa tài khoản' }))

      expect(
        await within(dialog).findByText('Hệ thống cần ít nhất một quản trị viên đang hoạt động.'),
      ).toBeInTheDocument()
    })

    it('MSG-61: an account locked meanwhile closes the dialog and reloads', async () => {
      useUsers([activeUser])
      server.use(
        http.post(apiUrl('/admin/users/:userId/lock'), () => problem(409, 'USER_ALREADY_LOCKED')),
      )
      renderUsers()
      const dialog = await openLock('Lê Văn C')
      useUsers([{ ...activeUser, status: 'LOCKED' }])

      await userEvent.type(within(dialog).getByRole('textbox', { name: 'Lý do' }), REASON)
      await userEvent.click(within(dialog).getByRole('button', { name: 'Khóa tài khoản' }))

      expect(await screen.findByText('Tài khoản đã bị khóa trước đó.')).toBeInTheDocument()
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
      expect(await screen.findByText('Đã khóa')).toBeInTheDocument()
    })

    it('MSG-60: unlocking a never-activated account reminds to resend the email', async () => {
      useUsers([{ ...pendingUser, status: 'LOCKED' }])
      server.use(
        http.get(apiUrl('/admin/users/:userId'), () =>
          HttpResponse.json({ ...pendingUser, status: 'LOCKED', activeSessionCount: 0 }),
        ),
        http.post(apiUrl('/admin/users/:userId/unlock'), () =>
          HttpResponse.json({ ...pendingUser, status: 'PENDING_ACTIVATION' }),
        ),
      )
      renderUsers()

      await userEvent.click(
        within(await openRowActions('Trần Thị B')).getByRole('menuitem', { name: 'Mở khóa' }),
      )
      const dialog = await screen.findByRole('dialog', { name: 'Mở khóa tài khoản' })
      expect(
        await within(dialog).findByText(
          'Tài khoản chưa kích hoạt. Sau khi mở khóa, hãy gửi lại email kích hoạt.',
        ),
      ).toBeInTheDocument()
      await userEvent.click(within(dialog).getByRole('button', { name: 'Mở khóa' }))

      expect(
        await screen.findByText(
          'Đã mở khóa. Tài khoản chưa kích hoạt, hãy gửi lại email kích hoạt cho Trần Thị B.',
        ),
      ).toBeInTheDocument()
    })
  })
})
