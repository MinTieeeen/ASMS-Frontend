/**
 * @file Multi-line text field bound to React Hook Form with label, translated error and a11y attributes.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import type { ComponentProps } from 'react'
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { translateKey } from '@/lib/i18n'

type FormTextareaFieldProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
  label: string
  description?: string
} & Omit<ComponentProps<typeof Textarea>, 'name' | 'value' | 'onChange' | 'onBlur' | 'defaultValue'>

export function FormTextareaField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  id,
  ...textareaProps
}: FormTextareaFieldProps<T>) {
  useTranslation()
  const inputId = id ?? `field-${name}`

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const errorId = `${inputId}-error`
        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
            <Textarea
              {...textareaProps}
              {...field}
              id={inputId}
              aria-invalid={fieldState.invalid}
              aria-describedby={fieldState.invalid ? errorId : undefined}
            />
            {description && <FieldDescription>{description}</FieldDescription>}
            {fieldState.error?.message && (
              <FieldError id={errorId}>{translateKey(fieldState.error.message)}</FieldError>
            )}
          </Field>
        )
      }}
    />
  )
}
