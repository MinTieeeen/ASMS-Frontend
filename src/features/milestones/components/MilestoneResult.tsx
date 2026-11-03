/**
 * @file Result of a milestone (UC10 step 5, F06.03): the score out of 10 and the lecturer's feedback; leader and
 *   deputies record or correct it, which marks the milestone "Graded".
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { Award } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { FormTextareaField, FormTextField } from '@/components/form'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { type Milestone, useMockStore } from '@/mocks'

import { MAX_SCORE, type ResultFormValues,resultSchema } from '../schemas/milestone.schema'

export function MilestoneResult({ milestone, canRecord }: { milestone: Milestone; canRecord: boolean }) {
  const { t } = useTranslation('milestones')
  const [isOpen, setIsOpen] = useState(false)
  const isGraded = milestone.status === 'graded' && milestone.score !== null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('result.title')}</CardTitle>
        {canRecord && (
          <CardAction>
            <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
              {isGraded ? t('result.edit') : t('result.record')}
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {isGraded ? (
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Award className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="font-heading text-3xl font-semibold">
                {milestone.score}
                <span className="text-base font-normal text-muted-foreground">{t('result.outOf')}</span>
              </p>
              {milestone.feedback && <p className="mt-1 text-sm whitespace-pre-line">{milestone.feedback}</p>}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t('result.none')}</p>
        )}
      </CardContent>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{t('result.dialogTitle', { name: milestone.name })}</DialogTitle>
          </DialogHeader>
          <ResultForm milestone={milestone} onDone={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function ResultForm({ milestone, onDone }: { milestone: Milestone; onDone: () => void }) {
  const { t } = useTranslation('milestones')
  const { t: tCommon } = useTranslation()
  const recordResult = useMockStore((state) => state.recordResult)
  const form = useForm<ResultFormValues>({
    resolver: zodResolver(resultSchema),
    defaultValues: { score: milestone.score === null ? '' : String(milestone.score), feedback: milestone.feedback ?? '' },
  })

  const submit = form.handleSubmit((values) => {
    recordResult(milestone.id, Number(values.score), values.feedback)
    toast.success(t('result.saved', { name: milestone.name }))
    onDone()
  })

  return (
    <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-4" noValidate>
      <FormTextField
        control={form.control}
        name="score"
        type="number"
        inputMode="decimal"
        min={0}
        max={MAX_SCORE}
        step={0.05}
        className="w-32"
        label={t('result.score')}
      />
      <FormTextareaField control={form.control} name="feedback" label={t('result.feedback')} rows={4} />
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          {tCommon('action.cancel')}
        </Button>
        <Button type="submit">{tCommon('action.save')}</Button>
      </DialogFooter>
    </form>
  )
}
