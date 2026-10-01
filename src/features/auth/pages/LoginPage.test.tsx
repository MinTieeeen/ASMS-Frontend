import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import LoginPage from '@/features/auth/pages/LoginPage'
import { useAuthStore } from '@/stores/auth.store'
import { apiUrl, problem, server, testUser, tokenResponse } from '@/test/msw/server'
import { renderPage } from '@/test/render'

function renderLogin(route = '/login') {
  return renderPage(<LoginPage />, { path: '/login', route })
}

async function fillAndSubmit(userCode = '2313425', password = 'Secret123') {
  await userEvent.type(screen.getByLabelText('ID người dùng'), userCode)
  await userEvent.type(screen.getByLabelText('Mật khẩu'), password)
  await userEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }))
}

describe('LoginPage (SCR-AUTH-01)', () => {
  it('S02: shows field errors without calling the API', async () => {
    renderLogin()

    await userEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }))

    expect(await screen.findByText('Vui lòng nhập ID người dùng.')).toBeInTheDocument()
    expect(screen.getByText('Vui lòng nhập mật khẩu.')).toBeInTheDocument()
  })

  it('stores the session and sends remember me on success', async () => {
    let body: unknown
    server.use(
      http.post(apiUrl('/auth/login'), async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(tokenResponse('fresh-token'))
      }),
    )
    renderLogin()

    await userEvent.click(screen.getByRole('checkbox', { name: 'Ghi nhớ đăng nhập' }))
    await fillAndSubmit(' se2313425 ')

    await waitFor(() => expect(useAuthStore.getState().status).toBe('authenticated'))
    expect(useAuthStore.getState().accessToken).toBe('fresh-token')
    expect(useAuthStore.getState().user).toEqual(testUser)
    expect(body).toEqual({
      userCode: 'se2313425',
      password: 'Secret123',
      rememberMe: true,
    })
  })

  it('S04: shows MSG-04, clears the password and hides the banner when the user edits', async () => {
    server.use(http.post(apiUrl('/auth/login'), () => problem(401, 'AUTH_INVALID_CREDENTIALS')))
    renderLogin()

    await fillAndSubmit()

    expect(await screen.findByText('ID người dùng hoặc mật khẩu không đúng.')).toBeInTheDocument()
    expect(screen.getByLabelText('Mật khẩu')).toHaveValue('')
    expect(screen.getByLabelText('Mật khẩu')).toHaveFocus()

    await userEvent.type(screen.getByLabelText('Mật khẩu'), 'x')

    expect(screen.queryByText('ID người dùng hoặc mật khẩu không đúng.')).not.toBeInTheDocument()
  })

  it('S05: counts down a temporary lock in mm:ss and blocks the button', async () => {
    server.use(
      http.post(apiUrl('/auth/login'), () =>
        problem(423, 'AUTH_ACCOUNT_TEMP_LOCKED', { retryAfterSeconds: 742 }),
      ),
    )
    renderLogin()

    await fillAndSubmit()

    expect(await screen.findByText('Vui lòng thử lại sau 12:22.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Đăng nhập' })).toBeDisabled()
  })

  it('S06: tells a locked account to contact an administrator', async () => {
    server.use(http.post(apiUrl('/auth/login'), () => problem(403, 'AUTH_ACCOUNT_LOCKED')))
    renderLogin()

    await fillAndSubmit()

    expect(await screen.findByText('Tài khoản của bạn đã bị khóa.')).toBeInTheDocument()
  })

  it('S07: shows the rate limit in seconds', async () => {
    server.use(
      http.post(apiUrl('/auth/login'), () =>
        problem(429, 'AUTH_RATE_LIMITED', { retryAfterSeconds: 45 }),
      ),
    )
    renderLogin()

    await fillAndSubmit()

    expect(await screen.findByText('Vui lòng thử lại sau 45 giây.')).toBeInTheDocument()
  })

  it('S08: shows the notice from ?msg=, fills the User ID and removes msg from the URL', async () => {
    const { router } = renderLogin('/login?userCode=2313425&msg=activated')

    expect(await screen.findByText('Tài khoản đã được kích hoạt.')).toBeInTheDocument()
    expect(screen.getByLabelText('ID người dùng')).toHaveValue('2313425')
    expect(screen.getByLabelText('Mật khẩu')).toHaveFocus()
    await waitFor(() => expect(router.state.location.search).toBe('?userCode=2313425'))
  })

  it('FR-AUTH-25: toggles password visibility', async () => {
    renderLogin()
    const password = screen.getByLabelText('Mật khẩu')

    await userEvent.click(screen.getByRole('button', { name: 'Hiện mật khẩu' }))

    expect(password).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Ẩn mật khẩu' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('links to the forgot password page, which asks for the email', () => {
    renderLogin()

    expect(screen.getByRole('link', { name: 'Quên mật khẩu?' })).toHaveAttribute(
      'href',
      '/forgot-password',
    )
  })
})
