/**
 * @file Search, filters, sort and page of the Admin user list kept in the URL (SCR-USER-04), so a link can be shared
 *   and Back restores the list. Invalid values fall back to the defaults (A1).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-04
 * @modified 2026-10-04
 */

import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'

import type { ListUsersParams, ListUsersRole, ListUsersStatusItem } from '@/api/generated/models'

export const PAGE_SIZES = [20, 50, 100] as const
export const SORT_FIELDS = ['createdAt', 'fullName', 'lastLoginAt'] as const
export type SortField = (typeof SORT_FIELDS)[number]
export type SortDirection = 'asc' | 'desc'

const STATUSES: ListUsersStatusItem[] = ['PENDING_ACTIVATION', 'ACTIVE', 'LOCKED']
const ROLES: ListUsersRole[] = ['USER', 'ADMIN']
const DEFAULT_SORT: { field: SortField; direction: SortDirection } = {
  field: 'createdAt',
  direction: 'desc',
}

export interface UserListState {
  q: string
  status: ListUsersStatusItem[]
  role: ListUsersRole | null
  sortField: SortField
  sortDirection: SortDirection
  page: number
  size: number
}

function parse(params: URLSearchParams): UserListState {
  const [field, direction] = (params.get('sort') ?? '').split(',')
  const sortField = SORT_FIELDS.find((value) => value === field) ?? DEFAULT_SORT.field
  const page = Number(params.get('page'))
  const size = Number(params.get('size'))
  const role = params.get('role')
  return {
    q: params.get('q') ?? '',
    status: params
      .getAll('status')
      .filter((value): value is ListUsersStatusItem =>
        STATUSES.includes(value as ListUsersStatusItem),
      ),
    role: ROLES.find((value) => value === role) ?? null,
    sortField,
    sortDirection:
      sortField === field && (direction === 'asc' || direction === 'desc')
        ? direction
        : DEFAULT_SORT.direction,
    page: Number.isInteger(page) && page >= 1 ? page : 1,
    size: PAGE_SIZES.find((value) => value === size) ?? PAGE_SIZES[0],
  }
}

function serialize(state: UserListState): URLSearchParams {
  const params = new URLSearchParams()
  if (state.q) params.set('q', state.q)
  state.status.forEach((status) => params.append('status', status))
  if (state.role) params.set('role', state.role)
  if (state.sortField !== DEFAULT_SORT.field || state.sortDirection !== DEFAULT_SORT.direction) {
    params.set('sort', `${state.sortField},${state.sortDirection}`)
  }
  if (state.page > 1) params.set('page', String(state.page))
  if (state.size !== PAGE_SIZES[0]) params.set('size', String(state.size))
  return params
}

export function useUserListParams() {
  const [searchParams, setSearchParams] = useSearchParams()
  const state = useMemo(() => parse(searchParams), [searchParams])

  /** Changing the search, a filter or the sort goes back to page 1 (screen conventions) */
  const update = useCallback(
    (changes: Partial<UserListState>) => {
      const next = { ...state, ...changes }
      if (!('page' in changes)) next.page = 1
      setSearchParams(serialize(next), { replace: true })
    },
    [state, setSearchParams],
  )

  /** Request of API-USER-07; a one-character keyword is not sent (BR-USER-17, MSG-49) */
  const request: ListUsersParams = {
    q: state.q.trim().length >= 2 ? state.q.trim() : undefined,
    status: state.status.length > 0 ? state.status : undefined,
    role: state.role ?? undefined,
    sort: `${state.sortField},${state.sortDirection}`,
    page: state.page,
    size: state.size,
  }

  const hasFilters = state.q.trim() !== '' || state.status.length > 0 || state.role !== null

  return { state, request, hasFilters, update, search: searchParams.toString() }
}
