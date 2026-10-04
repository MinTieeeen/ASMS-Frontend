import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http } from 'msw'

import { AccountMenu } from '@/features/auth'
import { useAuthStore } from '@/stores/auth.store'
import { apiUrl, problem, server, testUser } from '@/test/msw/server'
import { renderPage } from '@/test/render'

function renderMenu(user = testUser) {
  useAuthStore.getState().setSession('access-token', user)
  return renderPage(<AccountMenu />, { path: '/', route: '/' })
}

const openMenu = () => userEvent.click(screen.getByRole('button', { name: 'Menu tài khoản' }))

describe('AccountMenu (SCR-AUTH-07)', () => {
  it('shows the user and hides the admin entries from a User', async () => {
    renderMenu()

    await openMenu()

    expect(await screen.findByText('Nguyễn Văn A')).toBeInTheDocument()
    expect(screen.getByText('nguyen.van.a@gmail.com')).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'Trang quản trị' })).not.toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Bảo mật tài khoản' })).toBeInTheDocument()
  })

  it('shows the admin badge and link to an Admin', async () => {
    renderMenu({ ...testUser, systemRole: 'ADMIN' })

    await openMenu()

    expect(await screen.findByRole('menuitem', { name: 'Trang quản trị' })).toBeInTheDocument()
    expect(screen.getByText('Quản trị viên')).toBeInTheDocument()
  })

  it('A3: logs out this device even when the API fails', async () => {
    server.use(http.post(apiUrl('/auth/logout'), () => problem(500, 'INTERNAL_ERROR')))
    renderMenu()

    await openMenu()
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Đăng xuất' }))

    await waitFor(() => expect(useAuthStore.getState().status).toBe('anonymous'))
    expect(useAuthStore.getState().exitPath).toBe('/login')
  })

  it('no longer offers "log out of every device", which moved to the security page', async () => {
    renderMenu()

    await openMenu()

    expect(await screen.findByRole('menuitem', { name: 'Đăng xuất' })).toBeInTheDocument()
    expect(
      screen.queryByRole('menuitem', { name: 'Đăng xuất khỏi mọi thiết bị' }),
    ).not.toBeInTheDocument()
  })
})
