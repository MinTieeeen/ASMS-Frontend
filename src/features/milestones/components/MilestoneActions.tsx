/**
 * @file Menu of a milestone for leader and deputies (F06.01): edit, and delete, which is refused once the milestone
 *   has a deliverable; deleting unlinks the phases that pointed to it.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { Ellipsis, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/common'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Milestone, useMockStore } from '@/mocks'

import { MilestoneFormDialog } from './MilestoneFormDialog'

interface MilestoneActionsProps {
  milestone: Milestone
  /** Called after the milestone was deleted, e.g. to leave its detail page */
  onDeleted?: () => void
}

export function MilestoneActions({ milestone, onDeleted }: MilestoneActionsProps) {
  const { t } = useTranslation('milestones')
  const { t: tCommon } = useTranslation()
  const deleteMilestone = useMockStore((state) => state.deleteMilestone)
  const hasDeliverables = useMockStore((state) => state.deliverables.some((item) => item.milestoneId === milestone.id))
  const linkedPhases = useMockStore((state) => state.phases.filter((item) => item.milestoneId === milestone.id).length)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={t('card.actionsFor', { name: milestone.name })}>
            <Ellipsis aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuItem onSelect={() => setIsEditOpen(true)}>
            <Pencil aria-hidden />
            {t('action.edit')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={hasDeliverables}
            onSelect={() => setIsDeleteOpen(true)}
            className="flex-wrap"
          >
            <Trash2 aria-hidden />
            {t('action.delete')}
            {hasDeliverables && (
              <span className="basis-full pl-6 text-xs text-muted-foreground">{t('action.deleteBlocked')}</span>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <MilestoneFormDialog groupId={milestone.groupId} milestone={milestone} open={isEditOpen} onOpenChange={setIsEditOpen} />
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={t('action.deleteTitle', { name: milestone.name })}
        description={linkedPhases > 0 ? t('action.deleteUnlinks', { count: linkedPhases }) : t('action.deleteDescription')}
        confirmLabel={t('action.delete')}
        cancelLabel={tCommon('action.cancel')}
        onConfirm={() => {
          deleteMilestone(milestone.id)
          toast.success(t('toast.deleted', { name: milestone.name }))
          setIsDeleteOpen(false)
          onDeleted?.()
        }}
      />
    </>
  )
}
