/**
 * @file Approve or return a task waiting for review (F05.04, UC09 step 3); a return needs a reason.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { Check, Hourglass, Undo2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { type Task, useMockStore } from '@/mocks'

import { TaskNoteDialog } from './TaskNoteDialog'

export function TaskReviewActions({ task, canApprove }: { task: Task; canApprove: boolean }) {
  const { t } = useTranslation('tasks')
  const approveTask = useMockStore((state) => state.approveTask)
  const returnTask = useMockStore((state) => state.returnTask)
  const [isReturnOpen, setIsReturnOpen] = useState(false)

  if (task.status !== 'in_review') return null
  if (!canApprove) {
    return (
      <Alert>
        <Hourglass aria-hidden />
        <AlertDescription>{t('review.waiting')}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={() => {
          approveTask(task.id)
          toast.success(t('review.approved', { code: task.code }))
        }}
      >
        <Check aria-hidden />
        {t('review.approve')}
      </Button>
      <Button size="sm" variant="outline" onClick={() => setIsReturnOpen(true)}>
        <Undo2 aria-hidden />
        {t('review.return')}
      </Button>
      <TaskNoteDialog
        open={isReturnOpen}
        onOpenChange={setIsReturnOpen}
        title={t('review.returnTitle', { code: task.code })}
        description={t('review.returnDescription')}
        label={t('review.reason')}
        confirmLabel={t('review.return')}
        onConfirm={(reason) => {
          returnTask(task.id, reason)
          toast.success(t('review.returned', { code: task.code }))
        }}
      />
    </div>
  )
}
