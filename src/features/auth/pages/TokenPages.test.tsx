import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import ActivatePage from '@/features/auth/pages/ActivatePage'
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage'
import { apiUrl, problem, server } from '@/test/msw/server'
import { renderPage } from '@/test/render'

const EXPIRES_AT = '2026-09-29T02:30:00Z'

async function fillNewPassword(label: string, password: string, confirm = password) {
  await userEvent.type(screen.getByLabelText(label), password)
  await userEvent.type(screen.getByLabelText('Nhập lại mật khẩu'), confirm)
}

describe('ResetPasswordPage (SCR-AUTH-03)', () => {
  const renderReset = (route: string) =>
    renderPage(<ResetPasswordPage />, { path: '/reset-password', route })

  const validLink = () =>
    http.post(apiUrl('/auth/password/reset/validate'), () =>
      HttpResponse.json({ maskedEmail: 'ng***@gmail.com', expiresAt: EXPIRES_AT }),
    )

  it('S04: a link without token is invalid', () => {
    renderReset('/reset-password')

    expect(screen.getByRole('heading', { name: 'Link không còn hiệu lực' })).toBeInTheDocument()
  })

  it('FR-AUTH-15: checks the token, removes it from the URL and shows the masked email', async () => {
    server.use(validLink())
    const { router } = renderReset('/reset-password?token=abc')

    expect(await screen.findByText('ng***@gmail.com')).toBeInTheDocument()
    expect(screen.getByText('Hiệu lực đến 09:30')).toBeInTheDocument()
    await waitFor(() => expect(router.state.location.search).toBe(''))
    expect(document.querySelector('meta[name="referrer"]')).toHaveAttribute(
      'content',
      'no-referrer',
    )
  })

  it('S04: an expired or used token shows the invalid link panel', async () => {
    server.use(
      http.post(apiUrl('/auth/password/reset/validate'), () =>
        problem(400, 'AUTH_TOKEN_INVALID', { reason: 'EXPIRED' }),
      ),
    )
    renderReset('/reset-password?token=abc')

    expect(
      await screen.findByRole('heading', { name: 'Link không còn hiệu lực' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Yêu cầu link mới' })).toHaveAttribute(
      'href',
      '/forgot-password',
    )
  })

  it('A3: resets the password and goes to login with MSG-11', async () => {
    let body: unknown
    server.use(
      validLink(),
      http.post(apiUrl('/auth/password/reset'), async ({ request }) => {
        body = await request.json()
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const { router } = renderReset('/reset-password?token=abc')
    await screen.findByText('ng***@gmail.com')

    await fillNewPassword('Mật khẩu mới', 'MatkhauMoi2026')
    await userEvent.click(screen.getByRole('button', { name: 'Đặt lại mật khẩu' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(router.state.location.search).toBe('?msg=reset')
    expect(body).toEqual({ token: 'abc', newPassword: 'MatkhauMoi2026' })
  })

  it('S03: marks the criteria the server rejected and shows MSG-17', async () => {
    server.use(
      validLink(),
      http.post(apiUrl('/auth/password/reset'), () =>
        problem(400, 'AUTH_PASSWORD_POLICY', { violations: ['CONTAINS_EMAIL'] }),
      ),
    )
    renderReset('/reset-password?token=abc')
    await screen.findByText('ng***@gmail.com')

    await fillNewPassword('Mật khẩu mới', 'Nguyen2026x')
    await userEvent.click(screen.getByRole('button', { name: 'Đặt lại mật khẩu' }))

    expect(await screen.findByText('Mật khẩu chưa đạt yêu cầu.')).toBeInTheDocument()
    expect(screen.getByText('Không chứa tên email (kiểm tra khi lưu)').closest('li')).toHaveClass(
      'text-destructive-text',
    )
  })

  it('S03: validates the policy and the confirmation on the client', async () => {
    server.use(validLink())
    renderReset('/reset-password?token=abc')
    await screen.findByText('ng***@gmail.com')

    await fillNewPassword('Mật khẩu mới', 'abc', 'abd')
    await userEvent.click(screen.getByRole('button', { name: 'Đặt lại mật khẩu' }))

    expect(await screen.findByText('Mật khẩu chưa đạt yêu cầu.')).toBeInTheDocument()
    expect(screen.getByText('Mật khẩu xác nhận không khớp.')).toBeInTheDocument()
  })
})

describe('ActivatePage (SCR-AUTH-04)', () => {
  const renderActivate = (route = '/activate?token=tok') =>
    renderPage(<ActivatePage />, { path: '/activate', route })

  const validLink = () =>
    http.post(apiUrl('/auth/activation/validate'), () =>
      HttpResponse.json({
        email: 'minhtran@gmail.com',
        userCode: '2313425',
        fullName: 'Trần Minh',
        expiresAt: EXPIRES_AT,
      }),
    )

  it('S02: greets the user and shows the email read-only', async () => {
    server.use(validLink())
    renderActivate()

    expect(await screen.findByText('Trần Minh')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveValue('minhtran@gmail.com')
    expect(screen.getByLabelText('Email')).toHaveAttribute('readonly')
  })

  it('checks the email criterion on the client when the full email is known', async () => {
    server.use(validLink())
    renderActivate()
    await screen.findByText('Trần Minh')

    await userEvent.type(screen.getByLabelText('Mật khẩu'), 'minhtran2026')

    expect(screen.getByText('Không chứa tên email').closest('li')).not.toHaveClass(
      'text-foreground',
    )
  })

  it('S05: an already active account offers to go to login', async () => {
    server.use(
      http.post(apiUrl('/auth/activation/validate'), () =>
        problem(409, 'AUTH_ACCOUNT_ALREADY_ACTIVE'),
      ),
    )
    renderActivate()

    expect(
      await screen.findByRole('heading', { name: 'Tài khoản này đã được kích hoạt.' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Đến trang đăng nhập' })).toHaveAttribute(
      'href',
      '/login',
    )
  })

  it('A3: activates and goes to login with the User ID and MSG-12', async () => {
    server.use(
      validLink(),
      http.post(apiUrl('/auth/activate'), () => new HttpResponse(null, { status: 204 })),
    )
    const { router } = renderActivate()
    await screen.findByText('Trần Minh')

    await fillNewPassword('Mật khẩu', 'Nhom2026x')
    await userEvent.click(screen.getByRole('button', { name: 'Kích hoạt' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(new URLSearchParams(router.state.location.search).get('userCode')).toBe('2313425')
    expect(new URLSearchParams(router.state.location.search).get('msg')).toBe('activated')
  })

  it('S04: a link used meanwhile switches to the invalid link panel on submit', async () => {
    server.use(
      validLink(),
      http.post(apiUrl('/auth/activate'), () =>
        problem(400, 'AUTH_TOKEN_INVALID', { reason: 'USED' }),
      ),
    )
    renderActivate()
    await screen.findByText('Trần Minh')

    await fillNewPassword('Mật khẩu', 'Nhom2026x')
    await userEvent.click(screen.getByRole('button', { name: 'Kích hoạt' }))

    expect(
      await screen.findByRole('heading', { name: 'Link không còn hiệu lực' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Nhận link mới' })).toBeInTheDocument()
  })
})
