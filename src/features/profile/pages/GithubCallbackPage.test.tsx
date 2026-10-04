import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import GithubCallbackPage from '@/features/profile/pages/GithubCallbackPage'
import { apiUrl, problem, server } from '@/test/msw/server'
import { renderPage } from '@/test/render'

const account = {
  login: 'nguyenvanan',
  avatarUrl: 'https://avatars.githubusercontent.com/u/1',
  htmlUrl: 'https://github.com/nguyenvanan',
  publicRepos: 24,
  followers: 18,
  following: 12,
  githubCreatedAt: '2021-03-08T09:12:00Z',
  connectedAt: '2026-10-04T08:00:00Z',
  syncedAt: '2026-10-04T08:00:00Z',
}

function renderCallback(query: string) {
  return renderPage(<GithubCallbackPage />, {
    path: '/settings/profile/github/callback',
    route: `/settings/profile/github/callback${query}`,
  })
}

describe('GithubCallbackPage (SCR-USER-01 A11)', () => {
  it('sends code and state once, shows MSG-71 and returns to the profile', async () => {
    const bodies: unknown[] = []
    server.use(
      http.post(apiUrl('/users/me/github/callback'), async ({ request }) => {
        bodies.push(await request.json())
        return HttpResponse.json(account)
      }),
    )
    const { router } = renderCallback('?code=abc&state=xyz')

    expect(await screen.findByText('Đã kết nối GitHub @nguyenvanan.')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/settings/profile')
    expect(bodies).toEqual([{ code: 'abc', state: 'xyz' }])
  })

  it('MSG-73: the user cancelled on GitHub, nothing is sent', async () => {
    let called = false
    server.use(
      http.post(apiUrl('/users/me/github/callback'), () => {
        called = true
        return HttpResponse.json(account)
      }),
    )
    const { router } = renderCallback('?error=access_denied&state=xyz')

    expect(await screen.findByText('Bạn đã hủy kết nối trên GitHub.')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/settings/profile')
    expect(called).toBe(false)
  })

  it('MSG-72: carries "account in use" back to the profile', async () => {
    server.use(
      http.post(apiUrl('/users/me/github/callback'), () => problem(409, 'GITHUB_ACCOUNT_IN_USE')),
    )
    const { router } = renderCallback('?code=abc&state=xyz')

    await waitFor(() => expect(router.state.location.pathname).toBe('/settings/profile'))
    expect(router.state.location.state).toEqual({ githubError: 'inUse' })
  })
})
