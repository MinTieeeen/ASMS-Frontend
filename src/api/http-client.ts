/**
 * @file Shared Axios instance with token handling, plus the Orval mutator.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-26
 * @modified 2026-09-26
 */

import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'

import { API_PREFIX } from '@/config/constants'
import { env } from '@/config/env'
import { useAuthStore } from '@/stores/auth.store'
import { ApiError, type ProblemDetail } from '@/types/api'

/**
 * The only Axios instance of the app.
 * - The access token lives in memory (auth store) and is sent in the Authorization header (NFR06).
 * - The refresh token is an httpOnly cookie, hence `withCredentials`.
 * - On 401 it refreshes once (parallel requests share one refresh promise); if that fails the session is cleared.
 */
export const http = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

const REFRESH_URL = `${API_PREFIX}/auth/refresh`

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  refreshPromise ??= axios
    .post<{ accessToken: string }>(REFRESH_URL, null, {
      baseURL: env.apiBaseUrl,
      withCredentials: true,
    })
    .then(({ data }) => {
      useAuthStore.getState().setAccessToken(data.accessToken)
      return data.accessToken
    })
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ProblemDetail>) => {
    const original = error.config as RetriableConfig | undefined
    const shouldRefresh =
      error.response?.status === 401 &&
      original &&
      !original._retried &&
      original.url !== REFRESH_URL

    if (shouldRefresh) {
      original._retried = true
      try {
        const token = await refreshAccessToken()
        original.headers.Authorization = `Bearer ${token}`
        return http(original)
      } catch {
        useAuthStore.getState().clear()
      }
    }

    return Promise.reject(toApiError(error))
  },
)

function toApiError(error: AxiosError<ProblemDetail>): ApiError {
  if (error.response?.data && typeof error.response.data === 'object') {
    return new ApiError({ ...error.response.data, status: error.response.status })
  }
  return new ApiError({ status: error.response?.status ?? 0, detail: error.message })
}

/** Orval mutator: every generated hook goes through this instance. */
export const httpClient = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => http({ ...config, ...options }).then(({ data }) => data as T)

export type ErrorType<E> = ApiError & { data?: E }
export type BodyType<B> = B
