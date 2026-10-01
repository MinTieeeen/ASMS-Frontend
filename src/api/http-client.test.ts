import { http as mswHttp, HttpResponse } from 'msw'

import { http, refreshSession, setSessionEndHandler } from '@/api/http-client'
import { useAuthStore } from '@/stores/auth.store'
import { apiUrl, problem, refreshOk, server, testUser, tokenResponse } from '@/test/msw/server'
import { ApiError } from '@/types/api'

/** GET /groups answers 401 AUTH_ACCESS_TOKEN_EXPIRED until the request carries the refreshed token. */
function groupsRequiringToken(validToken: string) {
  return mswHttp.get(apiUrl('/groups'), ({ request }) =>
    request.headers.get('Authorization') === `Bearer ${validToken}`
      ? HttpResponse.json({ ok: true })
      : problem(401, 'AUTH_ACCESS_TOKEN_EXPIRED'),
  )
}

describe('http-client', () => {
  beforeEach(() => {
    useAuthStore.getState().setSession('old-token', testUser)
  })

  it('FR-AUTH-07: refreshes only once for several expired requests and replays all of them', async () => {
    let refreshCalls = 0
    server.use(
      groupsRequiringToken('new-token'),
      mswHttp.post(apiUrl('/auth/refresh'), () => {
        refreshCalls += 1
        return HttpResponse.json(tokenResponse('new-token'))
      }),
    )

    const results = await Promise.all([
      http.get('/api/v1/groups'),
      http.get('/api/v1/groups'),
      http.get('/api/v1/groups'),
    ])

    expect(refreshCalls).toBe(1)
    expect(results.map((r) => r.data)).toEqual([{ ok: true }, { ok: true }, { ok: true }])
    expect(useAuthStore.getState().accessToken).toBe('new-token')
  })

  it('does not refresh when the token is invalid rather than expired, and ends the session', async () => {
    const onSessionEnd = vi.fn()
    setSessionEndHandler(onSessionEnd)
    let refreshCalls = 0
    server.use(
      mswHttp.get(apiUrl('/groups'), () => problem(401, 'AUTH_ACCESS_TOKEN_INVALID')),
      mswHttp.post(apiUrl('/auth/refresh'), () => {
        refreshCalls += 1
        return HttpResponse.json(tokenResponse())
      }),
    )

    await expect(http.get('/api/v1/groups')).rejects.toMatchObject({
      code: 'AUTH_ACCESS_TOKEN_INVALID',
    })
    expect(refreshCalls).toBe(0)
    expect(onSessionEnd).toHaveBeenCalledWith('expired')
  })

  it('ends the session with "locked" when the refresh reports a locked account', async () => {
    const onSessionEnd = vi.fn()
    setSessionEndHandler(onSessionEnd)
    server.use(
      groupsRequiringToken('never'),
      mswHttp.post(apiUrl('/auth/refresh'), () => problem(403, 'AUTH_ACCOUNT_LOCKED')),
    )

    await expect(http.get('/api/v1/groups')).rejects.toBeInstanceOf(ApiError)
    expect(onSessionEnd).toHaveBeenCalledWith('locked')
  })

  it('never refreshes for public auth endpoints such as login', async () => {
    let refreshCalls = 0
    server.use(
      mswHttp.post(apiUrl('/auth/login'), () => problem(401, 'AUTH_INVALID_CREDENTIALS')),
      mswHttp.post(apiUrl('/auth/refresh'), () => {
        refreshCalls += 1
        return HttpResponse.json(tokenResponse())
      }),
    )

    await expect(http.post('/api/v1/auth/login', {})).rejects.toMatchObject({
      code: 'AUTH_INVALID_CREDENTIALS',
      status: 401,
    })
    expect(refreshCalls).toBe(0)
  })

  it('section 7.3: retries once after AUTH_REFRESH_RACE', async () => {
    let refreshCalls = 0
    server.use(
      mswHttp.post(apiUrl('/auth/refresh'), () => {
        refreshCalls += 1
        return refreshCalls === 1
          ? problem(409, 'AUTH_REFRESH_RACE')
          : HttpResponse.json(tokenResponse('after-race'))
      }),
    )

    const session = await refreshSession()

    expect(refreshCalls).toBe(2)
    expect(session.accessToken).toBe('after-race')
  })

  it('maps Problem Details fields onto ApiError', async () => {
    server.use(
      refreshOk(),
      mswHttp.get(apiUrl('/groups'), () =>
        problem(429, 'AUTH_RATE_LIMITED', { retryAfterSeconds: 42 }),
      ),
    )

    const error = await http.get('/api/v1/groups').catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 429, code: 'AUTH_RATE_LIMITED', retryAfterSeconds: 42 })
  })
})
