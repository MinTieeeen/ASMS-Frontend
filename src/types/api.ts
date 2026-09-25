/**
 * @file Shared API contract types. Per-endpoint types come from src/api/generated.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-26
 * @modified 2026-09-26
 */

export interface FieldError {
  field: string
  message: string
}

/** RFC 9457 Problem Details plus the backend business error code */
export interface ProblemDetail {
  type?: string
  title?: string
  status: number
  detail?: string
  instance?: string
  code?: string
  errors?: FieldError[]
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

/** Normalized error produced by http-client. Every API error in the UI has this shape. */
export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly fieldErrors: FieldError[]

  constructor(problem: ProblemDetail) {
    super(problem.detail ?? problem.title ?? 'Request failed')
    this.name = 'ApiError'
    this.status = problem.status
    this.code = problem.code
    this.fieldErrors = problem.errors ?? []
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
