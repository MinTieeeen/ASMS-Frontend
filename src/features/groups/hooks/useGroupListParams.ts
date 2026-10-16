/**
 * @file Filters of "My groups" kept in the URL (F02.02, F02.03): keyword, semester, grouping, ended semesters.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { useSearchParams } from 'react-router'

export type GroupBy = 'none' | 'semester' | 'subject'

export interface GroupListState {
  q: string
  semester: string | null
  groupBy: GroupBy
  /** F02.03: groups of ended semesters are hidden by default */
  showEnded: boolean
}

const GROUP_BY_VALUES: readonly GroupBy[] = ['none', 'semester', 'subject']

export function useGroupListParams() {
  const [params, setParams] = useSearchParams()
  const groupByParam = params.get('groupBy')
  const state: GroupListState = {
    q: params.get('q') ?? '',
    semester: params.get('semester'),
    groupBy: GROUP_BY_VALUES.find((value) => value === groupByParam) ?? 'semester',
    showEnded: params.get('ended') === '1',
  }

  const update = (changes: Partial<GroupListState>) => {
    const next = { ...state, ...changes }
    const search = new URLSearchParams()
    if (next.q) search.set('q', next.q)
    if (next.semester) search.set('semester', next.semester)
    if (next.groupBy !== 'semester') search.set('groupBy', next.groupBy)
    if (next.showEnded) search.set('ended', '1')
    setParams(search, { replace: true })
  }

  const hasFilters = state.q !== '' || state.semester !== null
  return { state, update, hasFilters }
}
