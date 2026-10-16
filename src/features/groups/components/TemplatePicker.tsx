/**
 * @file Phase template choice of a new group (UC03 step 3): blank, software, research.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { FileText, LayoutTemplate, type LucideIcon, SquareCode } from 'lucide-react'
import { type Control, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import type { PhaseTemplate } from '@/mocks'

import type { CreateGroupFormValues } from '../schemas/create-group.schema'

const TEMPLATES: { value: PhaseTemplate; icon: LucideIcon }[] = [
  { value: 'blank', icon: LayoutTemplate },
  { value: 'software', icon: SquareCode },
  { value: 'research', icon: FileText },
]

export function TemplatePicker({ control }: { control: Control<CreateGroupFormValues> }) {
  const { t } = useTranslation('groups')

  return (
    <Controller
      control={control}
      name="template"
      render={({ field }) => (
        <RadioGroup
          value={field.value}
          onValueChange={field.onChange}
          aria-label={t('template.label')}
          className="gap-2.5"
        >
          {TEMPLATES.map(({ value, icon: Icon }) => (
            <label
              key={value}
              htmlFor={`template-${value}`}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors hover:bg-muted/60',
                field.value === value && 'border-primary bg-accent/50',
              )}
            >
              <RadioGroupItem id={`template-${value}`} value={value} className="mt-1" />
              <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-sm font-semibold">{t(`template.${value}.name`)}</span>
                <span className="text-[13px] text-muted-foreground">
                  {t(`template.${value}.description`)}
                </span>
              </span>
            </label>
          ))}
        </RadioGroup>
      )}
    />
  )
}
