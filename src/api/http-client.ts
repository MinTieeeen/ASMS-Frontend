/**
 * @file Shared Axios instance with token handling and silent session refresh, plus the Orval mutator.
 * @author MinhTien
 * @version 2.0.0
 * @since 2026-09-26
 * @modified 2026-09-27
 */

import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'

import type { AuthTokenResponse } from '@/api/generated/models'
import { API_PREFIX, REFRESH_QUEUE_TIMEOUT_MS, REFRESH_RACE_RETRY_MS } from '@/config/constants'
import { env } from '@/config/env'
import { withLock } from '@/lib/web-locks'
import { useAuthStore } from '@/stores/auth.store'
import { ApiError, NETWORK_ERROR_STATUS, type ProblemDetail } from '@/types/api'

/**
 * Why the session ended while the user was working (SCR-AUTH-08 A2, A3):
 * `expired` → login page with MSG-08, `locked` → login page with MSG-06.
 */
export type SessionEndReason = 'expired' | 'locked'

const AUTH_PATH = `${API_PREFIX}/auth/`
const REFRESH_URL = `${API_PREFIX}/auth/refresh`
const REFRESH_LOCK = 'auth-refresh'

/**
 * The only Axios instance of the app.
 * - The access token lives in memory (auth store) and is sent in the Authorization header (NFR06).
 * - The refresh token is an httpOnly cookie, hence `withCredentials`.
 */
export const http = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

let sessionEndHandler: (reason: SessionEndReason) => void = () => {}

/**
 * Registered by the auth feature (AuthBootstrap), so this module never imports a feature. Called once the session
 * cannot be recovered: the handler clears local state and goes to the login page.
 */
export function setSessionEndHandler(handler: (reason: SessionEndReason) => void): void {
  sessionEndHandler = handler
}

let refreshPromise: Promise<AuthTokenResponse> | null = null

/**
 * Rotates the refresh cookie and stores the new access token and user (API-AUTH-02).
 *
 * Concurrent callers share one request (FR-AUTH-07); across tabs the Web Lock "auth-refresh" makes tabs take turns
 * (section 7.3). AUTH_REFRESH_RACE is retried once after 300 ms. Rejects with {@link ApiError}.
 */
export function refreshSession(): Promise<AuthTokenResponse> {
  refreshPromise ??= withLock(REFRESH_LOCK, requestRefreshWithRaceRetry)
    .then((session) => {
      useAuthStore.getState().setSession(session.accessToken, session.user)
      return session
    })
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}

async function requestRefreshWithRaceRetry(): Promise<AuthTokenResponse> {
  try {
    return await requestRefresh()
  } catch (error) {
    if (!(error instanceof ApiError) || error.code !== 'AUTH_REFRESH_RACE') throw error
    await delay(REFRESH_RACE_RETRY_MS)
    return requestRefresh()
  }
}

async function requestRefresh(): Promise<AuthTokenResponse> {
  try {
    // Plain axios, not `http`: the refresh call must never go through the 401 interceptor itself
    const { data } = await axios.post<AuthTokenResponse>(REFRESH_URL, null, {
      baseURL: env.apiBaseUrl,
      withCredentials: true,
    })
    return data
  } catch (error) {
    throw toApiError(error as AxiosError<ProblemDetail>)
  }
}

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ProblemDetail>) => {
    const apiError = toApiError(error)
    const original = error.config as RetriableConfig | undefined
    if (apiError.status !== 401 || !original || isAuthEndpoint(original.url)) {
      throw apiError
    }

    // A3: a token that is invalid (not merely expired) cannot be fixed by refreshing
    if (apiError.code !== 'AUTH_ACCESS_TOKEN_EXPIRED' || original._retried) {
      endSessionIfSignedIn('expired')
      throw apiError
    }

    // A2: hold the request, refresh once for everybody, then replay it with the new token
    original._retried = true
    try {
      const session = await withTimeout(refreshSession(), REFRESH_QUEUE_TIMEOUT_MS)
      original.headers.Authorization = `Bearer ${session.accessToken}`
      return http(original)
    } catch (refreshError) {
      handleRefreshFailure(refreshError)
      throw apiError
    }
  },
)

function handleRefreshFailure(error: unknown): void {
  if (!(error instanceof ApiError) || error.isNetworkError || error.status >= 500) {
    // Network trouble or timeout: keep the session; the failing request reports the error
    return
  }
  endSessionIfSignedIn(error.code === 'AUTH_ACCOUNT_LOCKED' ? 'locked' : 'expired')
}

function endSessionIfSignedIn(reason: SessionEndReason): void {
  if (useAuthStore.getState().status === 'authenticated') {
    sessionEndHandler(reason)
  }
}

/** Public auth endpoints (section 7.5): their 401 is a business answer, never a reason to refresh. */
const PUBLIC_AUTH_PATHS = [
  'login',
  'refresh',
  'logout',
  'password/forgot',
  'password/reset/validate',
  'password/reset',
  'activation/validate',
  'activate',
].map((path) => AUTH_PATH + path)

/** No silent refresh for these calls (SCR-AUTH-08, notes), to avoid loops and to keep login errors intact. */
function isAuthEndpoint(url: string | undefined): boolean {
  return !!url && PUBLIC_AUTH_PATHS.some((path) => url.endsWith(path))
}

export function toApiError(error: AxiosError<ProblemDetail> | unknown): ApiError {
  if (error instanceof ApiError) return error
  if (!axios.isAxiosError<ProblemDetail>(error)) {
    return new ApiError({ status: NETWORK_ERROR_STATUS, detail: String(error) })
  }
  const { response } = error
  if (response?.data && typeof response.data === 'object') {
    return new ApiError({ ...response.data, status: response.status })
  }
  return new ApiError({ status: response?.status ?? NETWORK_ERROR_STATUS, detail: error.message })
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new ApiError({ status: NETWORK_ERROR_STATUS, detail: 'Refresh timed out' })),
      ms,
    )
    promise.then(resolve, reject).finally(() => clearTimeout(timer))
  })
}

/** Orval mutator: every generated hook goes through this instance. */
export const httpClient = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => http({ ...config, ...options }).then(({ data }) => data as T)

export type ErrorType<E> = ApiError & { data?: E }
export type BodyType<B> = B
