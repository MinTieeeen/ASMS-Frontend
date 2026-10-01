import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { CreateUserDialog } from '@/features/auth'
import { apiUrl, problem, server } from '@/test/msw/server'
import { renderPage } from '@/test/render'

function renderDialog() {
  const onOpenChange = vi.fn()
  renderPage(<CreateUserDialog open onOpenChange={onOpenChange} />, { path: '/', route: '/' })
  return { onOpenChange }
}

async function fillForm({
  email = 'tran.thi.b@gmail.com',
  fullName = 'Trần Thị B',
  userCode = '2313425',
} = {}) {
  await userEvent.type(screen.getByLabelText('Email'), email)
  await userEvent.type(screen.getByLabelText('Họ tên'), fullName)
  await userEvent.type(screen.getByLabelText('ID người dùng'), userCode)
}

const submit = () => userEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản' }))

describe('CreateUserDialog (SCR-AUTH-06)', () => {
  it('validates the fields on the client', async () => {
    renderDialog()

    await fillForm({ email: 'not-an-email', fullName: 'A', userCode: 'SE-01' })
    await submit()

    expect(await screen.findByText('Email không đúng định dạng.')).toBeInTheDocument()
    expect(screen.getByText('Họ tên phải từ 2 đến 100 ký tự.')).toBeInTheDocument()
    expect(
      screen.getByText('ID người dùng chỉ gồm chữ và số, tối đa 20 ký tự.'),
    ).toBeInTheDocument()
  })

  it('warns when the Admin role is chosen', async () => {
    renderDialog()

    await userEvent.click(screen.getByRole('radio', { name: 'Quản trị viên' }))

    expect(screen.getByText('Quản trị viên có toàn quyền quản lý hệ thống.')).toBeInTheDocument()
  })

  it('A1: creates the account, shows MSG-20 and closes', async () => {
    let body: unknown
    server.use(
      http.post(apiUrl('/admin/users'), async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(
          {
            id: 'new-user',
            email: 'tran.thi.b@gmail.com',
            userCode: 'ADMIN2',
            fullName: 'Trần Thị B',
            systemRole: 'USER',
            status: 'PENDING_ACTIVATION',
            language: 'VI',
            createdAt: '2026-09-29T02:00:00Z',
          },
          { status: 201 },
        )
      }),
    )
    const { onOpenChange } = renderDialog()

    await fillForm({
      email: ' tran.thi.b@gmail.com ',
      fullName: ' Trần Thị B ',
      userCode: ' admin2 ',
    })
    await submit()

    expect(
      await screen.findByText('Đã tạo tài khoản và gửi email kích hoạt tới tran.thi.b@gmail.com.'),
    ).toBeInTheDocument()
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(body).toEqual({
      email: 'tran.thi.b@gmail.com',
      fullName: 'Trần Thị B',
      userCode: 'admin2',
      systemRole: 'USER',
    })
  })

  it('shows the error on the User ID when it is already used', async () => {
    server.use(http.post(apiUrl('/admin/users'), () => problem(409, 'USER_CODE_EXISTS')))
    renderDialog()

    await fillForm()
    await submit()

    expect(await screen.findByText('ID người dùng này đã được sử dụng.')).toBeInTheDocument()
    expect(screen.getByLabelText('ID người dùng')).toHaveFocus()
  })

  it('shows MSG-18 on the email when it is already used', async () => {
    server.use(http.post(apiUrl('/admin/users'), () => problem(409, 'USER_EMAIL_EXISTS')))
    const { onOpenChange } = renderDialog()

    await fillForm()
    await submit()

    expect(await screen.findByText('Email này đã được sử dụng.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveFocus()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('A3: asks before discarding typed data', async () => {
    const { onOpenChange } = renderDialog()

    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: 'Hủy' }))

    expect(
      await screen.findByRole('alertdialog', { name: 'Bỏ thông tin đã nhập?' }),
    ).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Tiếp tục nhập' }))
    expect(onOpenChange).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Hủy' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Bỏ' }))

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })

  it('closes right away when nothing was typed', async () => {
    const { onOpenChange } = renderDialog()

    await userEvent.click(screen.getByRole('button', { name: 'Hủy' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })
})
