import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import type { SchoolRefResponse, UserProfileResponse } from '@/api/generated/models'
import ProfileSettingsPage from '@/features/profile/pages/ProfileSettingsPage'
import { useAuthStore } from '@/stores/auth.store'
import { apiUrl, problem, server, testUser } from '@/test/msw/server'
import { renderPage } from '@/test/render'

const hcmus: SchoolRefResponse = {
  id: 'school-hcmus',
  code: 'HCMUS',
  name: 'Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM',
  shortName: 'ĐH KHTN',
  active: true,
}
const uit: SchoolRefResponse = {
  id: 'school-uit',
  code: 'UIT',
  name: 'Trường Đại học Công nghệ Thông tin, ĐHQG-HCM',
  shortName: 'ĐH CNTT',
  active: true,
}

const profile: UserProfileResponse = {
  id: testUser.id,
  email: testUser.email,
  fullName: 'Nguyễn Văn A',
  userCode: '2313425',
  systemRole: 'USER',
  version: 3,
  updatedAt: '2026-10-01T03:00:00Z',
  school: hcmus,
  bio: 'Thích làm frontend.',
}

function useProfile(data: UserProfileResponse = profile) {
  server.use(
    http.get(apiUrl('/users/me/profile'), () => HttpResponse.json(data)),
    http.get(apiUrl('/schools'), () => HttpResponse.json({ items: [uit, hcmus] })),
  )
}

function renderProfile() {
  useAuthStore.getState().setSession('access-token', testUser)
  return renderPage(<ProfileSettingsPage />, {
    path: '/settings/profile',
    route: '/settings/profile',
  })
}

const saveButton = () => screen.getByRole('button', { name: 'Lưu' })

describe('ProfileSettingsPage (SCR-USER-01)', () => {
  beforeEach(() => useProfile())

  it('A1: shows the profile with email and User ID read-only, Save disabled', async () => {
    renderProfile()

    expect(await screen.findByLabelText('Họ tên')).toHaveValue('Nguyễn Văn A')
    expect(screen.getByLabelText('Email')).toHaveAttribute('readonly')
    expect(screen.getByLabelText('ID người dùng')).toHaveValue('2313425')
    expect(screen.getByRole('combobox', { name: /Trường/ })).toHaveTextContent(hcmus.name)
    expect(saveButton()).toBeDisabled()
  })

  it('A3: sends only the changed fields with the version read, then updates the header name', async () => {
    let body: unknown
    server.use(
      http.patch(apiUrl('/users/me/profile'), async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ ...profile, fullName: 'Nguyễn Văn An', school: uit, version: 4 })
      }),
    )
    renderProfile()
    const name = await screen.findByLabelText('Họ tên')

    await userEvent.clear(name)
    await userEvent.type(name, '  Nguyễn   Văn An ')
    await userEvent.click(screen.getByRole('combobox', { name: /Trường/ }))
    await userEvent.click(await screen.findByRole('option', { name: /Công nghệ Thông tin/ }))
    await userEvent.click(saveButton())

    expect(await screen.findByText('Đã lưu hồ sơ.')).toBeInTheDocument()
    expect(body).toEqual({ version: 3, fullName: 'Nguyễn Văn An', schoolId: 'school-uit' })
    expect(useAuthStore.getState().user?.fullName).toBe('Nguyễn Văn An')
    await waitFor(() => expect(saveButton()).toBeDisabled())
  })

  it('clears the about text by sending null', async () => {
    let body: unknown
    server.use(
      http.patch(apiUrl('/users/me/profile'), async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ ...profile, bio: undefined, version: 4 })
      }),
    )
    renderProfile()

    await userEvent.clear(await screen.findByLabelText(/Giới thiệu/))
    await userEvent.click(saveButton())

    await waitFor(() => expect(body).toEqual({ version: 3, bio: null }))
  })

  it('MSG-41: rejects an about text longer than 5 lines without calling the API', async () => {
    let called = false
    server.use(
      http.patch(apiUrl('/users/me/profile'), () => {
        called = true
        return HttpResponse.json(profile)
      }),
    )
    renderProfile()
    const bio = await screen.findByLabelText(/Giới thiệu/)

    await userEvent.clear(bio)
    await userEvent.type(bio, '1{enter}2{enter}3{enter}4{enter}5{enter}6')
    await userEvent.click(saveButton())

    expect(await screen.findByText('Giới thiệu tối đa 300 ký tự và 5 dòng.')).toBeInTheDocument()
    expect(called).toBe(false)
  })

  it('A5/A6: on a version conflict, "keep my edits" saves again with the latest version', async () => {
    const bodies: unknown[] = []
    let versionOnServer = 5
    server.use(
      http.get(apiUrl('/users/me/profile'), () =>
        HttpResponse.json({ ...profile, version: versionOnServer }),
      ),
      http.patch(apiUrl('/users/me/profile'), async ({ request }) => {
        const body = (await request.json()) as { version: number }
        bodies.push(body)
        if (body.version !== versionOnServer) return problem(409, 'USER_VERSION_CONFLICT')
        versionOnServer += 1
        return HttpResponse.json({ ...profile, bio: 'Bản mới.', version: versionOnServer })
      }),
    )
    // The page first reads version 3, then someone else saves (version 5)
    useProfile()
    renderProfile()
    const bio = await screen.findByLabelText(/Giới thiệu/)
    server.use(
      http.get(apiUrl('/users/me/profile'), () =>
        HttpResponse.json({ ...profile, version: versionOnServer }),
      ),
    )

    await userEvent.clear(bio)
    await userEvent.type(bio, 'Bản mới.')
    await userEvent.click(saveButton())
    const banner = await screen.findByText('Thông tin vừa được cập nhật ở nơi khác.')
    await userEvent.click(
      within(banner.closest('[role="alert"]') as HTMLElement).getByRole('button', {
        name: 'Giữ bản đang sửa',
      }),
    )
    await waitFor(() =>
      expect(screen.queryByText('Thông tin vừa được cập nhật ở nơi khác.')).not.toBeInTheDocument(),
    )
    expect(bio).toHaveValue('Bản mới.')
    await userEvent.click(saveButton())

    await waitFor(() => expect(bodies).toHaveLength(2))
    expect(bodies).toEqual([
      { version: 3, bio: 'Bản mới.' },
      { version: 5, bio: 'Bản mới.' },
    ])
  })

  it('MSG-78: a school removed meanwhile shows an error on the school field', async () => {
    server.use(
      http.patch(apiUrl('/users/me/profile'), () =>
        problem(400, 'VALIDATION_ERROR', {
          errors: [{ field: 'schoolId', code: 'NOT_AVAILABLE' }],
        }),
      ),
    )
    renderProfile()

    await userEvent.click(await screen.findByRole('combobox', { name: /Trường/ }))
    await userEvent.click(await screen.findByRole('option', { name: /Công nghệ Thông tin/ }))
    await userEvent.click(saveButton())

    expect(
      await screen.findByText('Trường bạn chọn không còn trong danh sách. Hãy chọn trường khác.'),
    ).toBeInTheDocument()
  })

  it('MSG-50: offers a retry when the profile cannot be loaded', async () => {
    server.use(http.get(apiUrl('/users/me/profile'), () => problem(500, 'INTERNAL_ERROR')))
    renderProfile()

    expect(await screen.findByText('Không tải được dữ liệu.')).toBeInTheDocument()
    useProfile()
    await userEvent.click(screen.getByRole('button', { name: 'Thử lại' }))

    expect(await screen.findByLabelText('Họ tên')).toHaveValue('Nguyễn Văn A')
  })

  it('API-USER-04: removes the photo after confirmation and falls back to initials', async () => {
    let removed = false
    useProfile({ ...profile, avatarUrl: 'https://cdn.test/avatars/u/k-256.webp' })
    server.use(
      http.delete(apiUrl('/users/me/avatar'), () => {
        removed = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    useAuthStore.getState().setSession('access-token', {
      ...testUser,
      avatarUrl: 'https://cdn.test/avatars/u/k-256.webp',
    })
    renderPage(<ProfileSettingsPage />, { path: '/settings/profile', route: '/settings/profile' })

    await userEvent.click(await screen.findByRole('button', { name: 'Xóa ảnh' }))
    const dialog = await screen.findByRole('alertdialog', { name: 'Xóa ảnh đại diện?' })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Xóa ảnh' }))

    expect(await screen.findByText('Đã xóa ảnh đại diện.')).toBeInTheDocument()
    expect(removed).toBe(true)
    expect(useAuthStore.getState().user?.avatarUrl).toBeUndefined()
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Xóa ảnh' })).not.toBeInTheDocument(),
    )
  })

  it('SCR-USER-02: rejects a file that is not a photo with MSG-42', async () => {
    renderProfile()

    await userEvent.click(await screen.findByRole('button', { name: 'Đổi ảnh' }))
    const dialog = await screen.findByRole('dialog', { name: 'Cập nhật ảnh đại diện' })
    const input = dialog.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, new File(['x'], 'notes.txt', { type: 'text/plain' }), {
      applyAccept: false,
    })

    expect(await within(dialog).findByText('Chỉ nhận ảnh JPEG, PNG hoặc WebP.')).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Lưu ảnh' })).toBeDisabled()
  })
})
