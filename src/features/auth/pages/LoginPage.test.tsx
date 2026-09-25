import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import LoginPage from '@/features/auth/pages/LoginPage'
import { renderWithProviders } from '@/test/render'

describe('LoginPage', () => {
  it('shows translated validation errors when submitting an empty form', async () => {
    renderWithProviders(<LoginPage />)

    await userEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }))

    expect(await screen.findByText('Email không hợp lệ')).toBeInTheDocument()
    expect(screen.getByText('Mật khẩu tối thiểu 8 ký tự, gồm cả chữ và số')).toBeInTheDocument()
  })
})
