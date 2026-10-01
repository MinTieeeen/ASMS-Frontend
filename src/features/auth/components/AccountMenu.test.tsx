import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

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

  it('A4: logs out every device after confirmation and shows MSG-29 on login', async () => {
    let called = false
    server.use(
      http.post(apiUrl('/auth/logout-all'), () => {
        called = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderMenu()

    await openMenu()
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Đăng xuất khỏi mọi thiết bị' }),
    )
    await userEvent.click(await screen.findByRole('button', { name: 'Đăng xuất tất cả' }))

    await waitFor(() => expect(useAuthStore.getState().status).toBe('anonymous'))
    expect(called).toBe(true)
    expect(useAuthStore.getState().exitPath).toBe('/login?msg=logged_out_all')
  })

  it('keeps the confirmation open with MSG-21 when logging out every device fails', async () => {
    server.use(http.post(apiUrl('/auth/logout-all'), () => problem(500, 'INTERNAL_ERROR')))
    renderMenu()

    await openMenu()
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Đăng xuất khỏi mọi thiết bị' }),
    )
    await userEvent.click(await screen.findByRole('button', { name: 'Đăng xuất tất cả' }))

    expect(await screen.findByText('Có lỗi xảy ra. Vui lòng thử lại.')).toBeInTheDocument()
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(useAuthStore.getState().status).toBe('authenticated')
  })
})
