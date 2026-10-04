import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { ProfileCard } from '@/features/profile'
import { apiUrl, problem, server } from '@/test/msw/server'
import { renderWithProviders } from '@/test/render'

describe('ProfileCard (SCR-USER-03)', () => {
  it('shows name, school, GitHub and the about text as plain text', async () => {
    server.use(
      http.get(apiUrl('/users/u1/profile'), () =>
        HttpResponse.json({
          id: 'u1',
          fullName: 'Trần Minh',
          school: {
            id: 's1',
            code: 'HCMUS',
            name: 'Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM',
            active: true,
          },
          github: {
            login: 'tranminh',
            avatarUrl: 'https://avatars.githubusercontent.com/u/1',
            htmlUrl: 'https://github.com/tranminh',
            publicRepos: 24,
            followers: 18,
            following: 2,
            githubCreatedAt: '2021-03-08T09:12:00Z',
            connectedAt: '2026-10-01T01:00:00Z',
            syncedAt: '2026-10-01T01:00:00Z',
          },
          bio: '<img src=x onerror=alert(1)>',
        }),
      ),
    )
    renderWithProviders(<ProfileCard userId="u1" />)

    expect(await screen.findByRole('heading', { name: 'Trần Minh' })).toBeInTheDocument()
    expect(screen.getByText('Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mở hồ sơ GitHub của tranminh' })).toHaveAttribute(
      'href',
      'https://github.com/tranminh',
    )
    // NFR-USER-06: rendered as text, never as HTML
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument()
  })

  it('MSG-47: says the user was not found', async () => {
    server.use(http.get(apiUrl('/users/u2/profile'), () => problem(404, 'USER_NOT_FOUND')))
    renderWithProviders(<ProfileCard userId="u2" />)

    expect(await screen.findByText('Không tìm thấy người dùng.')).toBeInTheDocument()
  })
})
