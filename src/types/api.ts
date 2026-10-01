/**
 * @file Shared API contract types. Per-endpoint types come from src/api/generated.
 * @author MinhTien
 * @version 2.0.0
 * @since 2026-09-26
 * @modified 2026-09-27
 */

/** One invalid field of a VALIDATION_ERROR (code: REQUIRED, INVALID_FORMAT, INVALID_LENGTH, OUT_OF_RANGE, INVALID) */
export interface FieldError {
  field: string
  code: string
  message?: string | null
}

/** RFC 9457 Problem Details plus the fields of the Auth specification (section 7.7) */
export interface ProblemDetail {
  type?: string
  title?: string
  status: number
  detail?: string
  instance?: string
  code?: string
  traceId?: string
  errors?: FieldError[]
  /** AUTH_ACCOUNT_TEMP_LOCKED, AUTH_RATE_LIMITED */
  retryAfterSeconds?: number
  /** AUTH_TOKEN_INVALID: NOT_FOUND, EXPIRED, USED */
  reason?: string
  /** AUTH_PASSWORD_POLICY: LENGTH, LETTER, DIGIT, CONTAINS_EMAIL, WHITESPACE */
  violations?: string[]
}

export interface PageResponse<T> {
  items: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface PageParams {
  page?: number
  size?: number
  sort?: string
}

/** Status used for errors that never reached the server (offline, DNS, CORS, timeout). */
export const NETWORK_ERROR_STATUS = 0

/**
 * Normalized error produced by http-client. Every API error in the UI has this shape; the UI chooses its message
 * by `code`, never by `detail` (Auth specification section 7.7).
 */
export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly fieldErrors: FieldError[]
  readonly retryAfterSeconds?: number
  readonly reason?: string
  readonly violations: string[]
  readonly traceId?: string

  constructor(problem: ProblemDetail) {
    super(problem.detail ?? problem.title ?? 'Request failed')
    this.name = 'ApiError'
    this.status = problem.status
    this.code = problem.code
    this.fieldErrors = problem.errors ?? []
    this.retryAfterSeconds = problem.retryAfterSeconds
    this.reason = problem.reason
    this.violations = problem.violations ?? []
    this.traceId = problem.traceId
  }

  get isNetworkError(): boolean {
    return this.status === NETWORK_ERROR_STATUS
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
