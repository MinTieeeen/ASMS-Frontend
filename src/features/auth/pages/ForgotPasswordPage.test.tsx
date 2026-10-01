import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage'
import { apiUrl, problem, server } from '@/test/msw/server'
import { renderPage } from '@/test/render'

const accepted = () =>
  http.post(apiUrl('/auth/password/forgot'), () =>
    HttpResponse.json({ status: 'ACCEPTED' }, { status: 202 }),
  )

function renderForgot(route = '/forgot-password') {
  return renderPage(<ForgotPasswordPage />, { path: '/forgot-password', route })
}

describe('ForgotPasswordPage (SCR-AUTH-02)', () => {
  it('S04: shows the same sent panel and starts the 60 s resend cooldown (FR-AUTH-12)', async () => {
    server.use(accepted())
    renderForgot()

    await userEvent.type(screen.getByLabelText('Email'), 'a@gmail.com')
    await userEvent.click(screen.getByRole('button', { name: 'Gửi link' }))

    expect(await screen.findByText('Kiểm tra email của bạn')).toBeInTheDocument()
    expect(screen.getByText('a@gmail.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gửi lại sau 60s' })).toBeDisabled()
  })

  it('A4: "use another email" returns to the form with the email kept', async () => {
    server.use(accepted())
    renderForgot()
    await userEvent.type(screen.getByLabelText('Email'), 'a@gmail.com')
    await userEvent.click(screen.getByRole('button', { name: 'Gửi link' }))

    await userEvent.click(await screen.findByRole('button', { name: 'Dùng email khác' }))

    expect(screen.getByLabelText('Email')).toHaveValue('a@gmail.com')
  })

  it('S05: shows the rate limit banner', async () => {
    server.use(
      http.post(apiUrl('/auth/password/forgot'), () =>
        problem(429, 'AUTH_RATE_LIMITED', { retryAfterSeconds: 38 }),
      ),
    )
    renderForgot()

    await userEvent.type(screen.getByLabelText('Email'), 'a@gmail.com')
    await userEvent.click(screen.getByRole('button', { name: 'Gửi link' }))

    expect(await screen.findByText('Vui lòng thử lại sau 38 giây.')).toBeInTheDocument()
  })

  it('S02: rejects a malformed email without calling the API', async () => {
    renderForgot()

    await userEvent.type(screen.getByLabelText('Email'), 'a@b')
    await userEvent.click(screen.getByRole('button', { name: 'Gửi link' }))

    expect(await screen.findByText('Email không đúng định dạng.')).toBeInTheDocument()
  })
})
