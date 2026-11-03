/**
 * @file History of one task (UC09 postcondition): creation, assignments, status changes, approvals and returns.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { RelativeTime } from '@/components/common'
import { type TaskEvent, useMockStore, useUserMap } from '@/mocks'

export function TaskHistory({ taskId }: { taskId: string }) {
  const { t } = useTranslation('tasks')
  const allEvents = useMockStore((state) => state.taskEvents)
  const events = useMemo(
    () =>
      allEvents
        .filter((item) => item.taskId === taskId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [allEvents, taskId],
  )
  const sentenceOf = useEventSentence()

  if (events.length === 0) return null
  return (
    <section aria-labelledby="task-history" className="flex flex-col gap-2">
      <h3 id="task-history" className="text-sm font-semibold">
        {t('history.title')}
      </h3>
      <ol className="flex flex-col gap-1.5 border-l pl-3">
        {events.map((event) => (
          <li key={event.id} className="text-[13px]">
            {sentenceOf(event)}{' '}
            <RelativeTime value={event.createdAt} className="text-xs text-muted-foreground" />
          </li>
        ))}
      </ol>
    </section>
  )
}

function useEventSentence() {
  const { t } = useTranslation('tasks')
  const { t: tCommon } = useTranslation()
  const users = useUserMap()
  const nameOf = (userId: string) => users[userId]?.fullName ?? '?'

  return (event: TaskEvent) => {
    const actor = nameOf(event.actorId)
    switch (event.kind) {
      case 'assigned':
        return event.note
          ? t('history.assigned', { actor, assignee: event.note })
          : t('history.unassigned', { actor })
      case 'statusChanged':
        return t('history.statusChanged', {
          actor,
          from: event.from ? tCommon(`domain.taskStatus.${event.from}`) : '',
          to: event.to ? tCommon(`domain.taskStatus.${event.to}`) : '',
        })
      case 'returned':
        return t('history.returned', { actor, note: event.note ?? '' })
      default:
        return t(`history.${event.kind}`, { actor })
    }
  }
}
