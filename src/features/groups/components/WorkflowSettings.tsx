/**
 * @file Task workflow settings (BR07, UC09): the review step and whether a result is required when submitting for
 *   review. The review step cannot be turned off while tasks are waiting for review, which would leave them
 *   without a column on the board.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type Group, useMockStore } from '@/mocks'

import { SettingSwitch } from './SettingSwitch'

export function WorkflowSettings({ group, canEdit }: { group: Group; canEdit: boolean }) {
  const { t } = useTranslation('groups')
  const updateGroup = useMockStore((state) => state.updateGroup)
  const inReview = useMockStore(
    (state) => state.tasks.filter((item) => item.groupId === group.id && item.status === 'in_review').length,
  )
  const isReviewLocked = group.reviewEnabled && inReview > 0

  const save = (patch: Partial<Group>) => {
    updateGroup(group.id, patch)
    toast.success(t('settings.workflow.saved'))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.workflow.title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <SettingSwitch
          id="setting-review-enabled"
          label={t('settings.workflow.reviewEnabled')}
          hint={
            <>
              {t('settings.workflow.reviewEnabledHint')}
              {isReviewLocked && canEdit && (
                <span className="mt-1 block font-medium text-foreground">
                  {t('settings.workflow.reviewLocked', { count: inReview })}
                </span>
              )}
            </>
          }
          checked={group.reviewEnabled}
          disabled={!canEdit || isReviewLocked}
          onCheckedChange={(checked) => save({ reviewEnabled: checked })}
        />
        <div className="border-t pt-4">
          <SettingSwitch
            id="setting-require-result"
            label={t('settings.workflow.requireResult')}
            hint={t('settings.workflow.requireResultHint')}
            // Without the review step there is nothing to submit
            checked={group.reviewEnabled && group.requireResultOnReview}
            disabled={!canEdit || !group.reviewEnabled}
            onCheckedChange={(checked) => save({ requireResultOnReview: checked })}
          />
        </div>
      </CardContent>
    </Card>
  )
}
