/**
 * @file Comments of a task (F05.06), oldest first, with a box to add one. @mentions come in GĐ2.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { SendHorizontal } from 'lucide-react'
import { type FormEvent, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { RelativeTime, UserAvatar } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useMockStore, useUserMap } from '@/mocks'

interface TaskCommentsProps {
  taskId: string
  /** False in an archived group (BR09) */
  canComment: boolean
}

export function TaskComments({ taskId, canComment }: TaskCommentsProps) {
  const { t } = useTranslation('tasks')
  const users = useUserMap()
  const allComments = useMockStore((state) => state.comments)
  const addComment = useMockStore((state) => state.addComment)
  const [body, setBody] = useState('')
  const comments = useMemo(
    () =>
      allComments
        .filter((item) => item.taskId === taskId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [allComments, taskId],
  )

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!body.trim()) return
    addComment(taskId, body.trim())
    setBody('')
  }

  return (
    <section aria-labelledby="task-comments" className="flex flex-col gap-3">
      <h3 id="task-comments" className="text-sm font-semibold">
        {t('comments.title')} <span className="font-normal text-muted-foreground">{comments.length}</span>
      </h3>
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('comments.empty')}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {comments.map((comment) => {
            const author = users[comment.authorId]
            return (
              <li key={comment.id} className="flex gap-2.5">
                <UserAvatar userId={comment.authorId} fullName={author?.fullName ?? '?'} size={28} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs">
                    <span className="font-medium">{author?.fullName}</span>{' '}
                    <RelativeTime value={comment.createdAt} className="text-muted-foreground" />
                  </p>
                  <p className="mt-0.5 text-sm whitespace-pre-line">{comment.body}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {canComment && (
        <form onSubmit={submit} className="flex items-end gap-2">
          <Textarea
            rows={2}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder={t('comments.placeholder')}
            aria-label={t('comments.label')}
          />
          <Button type="submit" size="icon" disabled={!body.trim()} aria-label={t('comments.send')}>
            <SendHorizontal aria-hidden />
          </Button>
        </form>
      )}
    </section>
  )
}
