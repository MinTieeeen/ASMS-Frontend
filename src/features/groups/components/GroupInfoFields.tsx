/**
 * @file Group information fields (UC03 step 2) and the optional subject / semester block (UC02): suggestions come
 *   from the catalogs, any value can still be typed.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { type Control, Controller, type UseFormSetValue } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { FormTextareaField, FormTextField } from '@/components/form'
import { Field, FieldDescription, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SYSTEM_MAX_MEMBERS } from '@/config/constants'
import { SEMESTER_OPTIONS, SUBJECT_SUGGESTIONS } from '@/mocks'

import type { CreateGroupFormValues } from '../schemas/create-group.schema'

const NO_SEMESTER = 'none'
const MEMBER_LIMITS = Array.from({ length: SYSTEM_MAX_MEMBERS }, (_, index) => String(index + 1))

interface GroupInfoFieldsProps {
  control: Control<CreateGroupFormValues>
  setValue: UseFormSetValue<CreateGroupFormValues>
}

export function GroupInfoFields({ control, setValue }: GroupInfoFieldsProps) {
  const { t } = useTranslation('groups')

  return (
    <div className="flex flex-col gap-4">
      <FormTextField control={control} name="name" label={t('field.name')} placeholder={t('field.namePlaceholder')} autoFocus />
      <FormTextField control={control} name="topic" label={t('field.topic')} placeholder={t('field.topicPlaceholder')} />
      <FormTextareaField control={control} name="description" label={t('field.description')} rows={3} />
      <Controller
        control={control}
        name="maxMembers"
        render={({ field }) => (
          <Field>
            <FieldLabel htmlFor="field-maxMembers">{t('field.maxMembers')}</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="field-maxMembers" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEMBER_LIMITS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>{t('field.maxMembersHint', { max: SYSTEM_MAX_MEMBERS })}</FieldDescription>
          </Field>
        )}
      />

      <FieldSet className="rounded-lg border p-4">
        <FieldLegend variant="label">{t('field.classification')}</FieldLegend>
        <FieldDescription className="-mt-2">{t('field.classificationHint')}</FieldDescription>
        <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
          <FormTextField
            control={control}
            name="subjectCode"
            label={t('field.subjectCode')}
            list="subject-suggestions"
            onInput={(event) => {
              const match = SUBJECT_SUGGESTIONS.find((item) => item.code === event.currentTarget.value)
              if (match) setValue('subjectName', match.name)
            }}
          />
          <FormTextField control={control} name="subjectName" label={t('field.subjectName')} />
        </div>
        <datalist id="subject-suggestions">
          {SUBJECT_SUGGESTIONS.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name}
            </option>
          ))}
        </datalist>
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="semester"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="field-semester">{t('field.semester')}</FieldLabel>
                <Select
                  value={field.value || NO_SEMESTER}
                  onValueChange={(value) => field.onChange(value === NO_SEMESTER ? '' : value)}
                >
                  <SelectTrigger id="field-semester">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_SEMESTER}>{t('field.noSemester')}</SelectItem>
                    {SEMESTER_OPTIONS.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
          <FormTextField control={control} name="lecturerName" label={t('field.lecturer')} />
        </div>
      </FieldSet>
    </div>
  )
}
