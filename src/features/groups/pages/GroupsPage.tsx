/**
 * @file "My groups" (F02.02, F02.03, F03.01, F03.03): every group of the student, filtered and grouped by semester
 *   or subject, groups without classification under "Unclassified"; create a group or join with a code.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { KeyRound, Plus, SearchX, UsersRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { EmptyState, PageHeader } from '@/components/common'
import { Button } from '@/components/ui/button'
import { toSearchKey } from '@/utils/search'

import { CreateGroupDialog } from '../components/CreateGroupDialog'
import { GroupCard } from '../components/GroupCard'
import { GroupFilters } from '../components/GroupFilters'
import { JoinCodeDialog } from '../components/JoinCodeDialog'
import { PendingInvitations } from '../components/PendingInvitations'
import { type GroupListState, useGroupListParams } from '../hooks/useGroupListParams'
import { type GroupSummary, useGroupSummaries } from '../hooks/useGroupSummaries'

const UNCLASSIFIED = ''

export default function GroupsPage() {
  const { t } = useTranslation('groups')
  const { t: tCommon } = useTranslation()
  const summaries = useGroupSummaries()
  const { state, update, hasFilters } = useGroupListParams()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isJoinOpen, setIsJoinOpen] = useState(false)

  const semesters = useMemo(
    () => [...new Set(summaries.flatMap((item) => (item.group.semester ? [item.group.semester] : [])))],
    [summaries],
  )
  const visible = useMemo(() => filterGroups(summaries, state), [summaries, state])
  const sections = useMemo(() => sectionsOf(visible, state), [visible, state])
  const hiddenEnded = summaries.filter((item) => item.group.isSemesterEnded).length

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t('list.title')}
        meta={t('list.count', { count: summaries.length })}
        description={t('list.description')}
        actions={
          <>
            <Button variant="outline" onClick={() => setIsJoinOpen(true)}>
              <KeyRound aria-hidden />
              {t('join.open')}
            </Button>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus aria-hidden />
              {t('create.open')}
            </Button>
          </>
        }
      />
      <PendingInvitations />
      <GroupFilters state={state} semesters={semesters} onChange={update} />

      {visible.length === 0 ? (
        hasFilters ? (
          <EmptyState
            icon={SearchX}
            title={t('list.noMatch')}
            action={
              <Button variant="outline" onClick={() => update({ q: '', semester: null })}>
                {tCommon('action.clearFilters')}
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={UsersRound}
            title={t('list.empty')}
            description={t('list.emptyHint')}
            action={<Button onClick={() => setIsCreateOpen(true)}>{t('create.open')}</Button>}
          />
        )
      ) : (
        sections.map((section) => (
          <section key={section.key} aria-label={section.title ?? t('list.title')} className="flex flex-col gap-3">
            {section.title !== null && (
              <h2 className="flex items-baseline gap-2 text-sm font-semibold">
                {section.title || tCommon('domain.unclassified')}
                <span className="font-normal text-muted-foreground">{section.items.length}</span>
              </h2>
            )}
            <ul className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {section.items.map((summary) => (
                <li key={summary.group.id}>
                  <GroupCard summary={summary} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      {!state.showEnded && hiddenEnded > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          {t('list.hiddenEnded', { count: hiddenEnded })}{' '}
          <Button variant="link" size="xs" className="px-0" onClick={() => update({ showEnded: true })}>
            {t('list.showEnded')}
          </Button>
        </p>
      )}

      <CreateGroupDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <JoinCodeDialog open={isJoinOpen} onOpenChange={setIsJoinOpen} />
    </div>
  )
}

function filterGroups(summaries: GroupSummary[], state: GroupListState): GroupSummary[] {
  const keyword = toSearchKey(state.q)
  return summaries.filter(({ group }) => {
    if (!state.showEnded && group.isSemesterEnded) return false
    if (state.semester && group.semester !== state.semester) return false
    if (!keyword) return true
    const haystack = toSearchKey(
      [group.name, group.topic, group.subjectCode, group.subjectName].filter(Boolean).join(' '),
    )
    return haystack.includes(keyword)
  })
}

interface Section {
  key: string
  /** null: no heading (no grouping); '' : the "Unclassified" section */
  title: string | null
  items: GroupSummary[]
}

/** UC02-2a: groups without subject / semester go to "Unclassified", always last */
function sectionsOf(items: GroupSummary[], state: GroupListState): Section[] {
  if (state.groupBy === 'none') return [{ key: 'all', title: null, items }]
  const map = new Map<string, GroupSummary[]>()
  for (const item of items) {
    const { group } = item
    const key =
      state.groupBy === 'semester'
        ? (group.semester ?? UNCLASSIFIED)
        : group.subjectCode
          ? `${group.subjectCode} · ${group.subjectName ?? ''}`
          : UNCLASSIFIED
    map.set(key, [...(map.get(key) ?? []), item])
  }
  return [...map.entries()]
    .sort(([a], [b]) => (a === UNCLASSIFIED ? 1 : b === UNCLASSIFIED ? -1 : a.localeCompare(b)))
    .map(([key, sectionItems]) => ({ key: key || 'unclassified', title: key, items: sectionItems }))
}
