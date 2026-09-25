/**
 * @file Text input bound to React Hook Form with label, translated error and a11y attributes.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-26
 * @modified 2026-09-26
 */

import type { ComponentProps } from 'react'
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { translateKey } from '@/lib/i18n'

type FormTextFieldProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
  label: string
  description?: string
} & Omit<ComponentProps<typeof Input>, 'name' | 'value' | 'onChange' | 'onBlur' | 'defaultValue'>

/**
 * Every form uses this component instead of wiring Input, Label and error messages by hand.
 */
export function FormTextField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  id,
  ...inputProps
}: FormTextFieldProps<T>) {
  // Subscribe to language changes so that error messages are re-translated
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
            <Input
              {...inputProps}
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
