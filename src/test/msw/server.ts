/**
 * @file MSW server shared by every test; tests add their own handlers with server.use(...).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import type { AuthTokenResponse, CurrentUserResponse } from '@/api/generated/models'
import type { ProblemDetail } from '@/types/api'

export const server = setupServer()

/** Matches the API path whatever the base URL of the test environment. */
export const apiUrl = (path: string) => `*/api/v1${path}`

export const testUser: CurrentUserResponse = {
  id: '3f1c9a2e-7b41-4c1e-9d0a-5b2f8e6c1a77',
  email: 'nguyen.van.a@gmail.com',
  userCode: '2313425',
  fullName: 'Nguyễn Văn A',
  systemRole: 'USER',
  language: 'VI',
}

export function tokenResponse(
  accessToken = 'access-token',
  user: CurrentUserResponse = testUser,
): AuthTokenResponse {
  return { accessToken, expiresIn: 900, user }
}

export function problem(status: number, code: string, extra: Partial<ProblemDetail> = {}) {
  return HttpResponse.json({ status, code, title: 'Error', ...extra }, { status })
}

/** Refresh endpoint answering with a fresh session. */
export const refreshOk = (accessToken = 'access-token', user = testUser) =>
  http.post(apiUrl('/auth/refresh'), () => HttpResponse.json(tokenResponse(accessToken, user)))

/** Refresh endpoint answering "no session" (no cookie, expired...). */
export const refreshUnauthorized = () =>
  http.post(apiUrl('/auth/refresh'), () => problem(401, 'AUTH_REFRESH_INVALID'))
