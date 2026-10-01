/**
 * @file Password input bound to React Hook Form, with show/hide toggle and optional Caps Lock hint.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { ArrowBigUpDash, Eye, EyeOff } from 'lucide-react'
import { type ComponentProps, type KeyboardEvent, type ReactNode, useState } from 'react'
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { translateKey } from '@/lib/i18n'

type FormPasswordFieldProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
  label: string
  /** FR-AUTH-26: warn when Caps Lock is on while the field has focus (login page only) */
  showCapsLockHint?: boolean
  /** Content below the error, e.g. the password criteria list */
  children?: ReactNode
} & Omit<
  ComponentProps<typeof Input>,
  'name' | 'value' | 'onChange' | 'onBlur' | 'defaultValue' | 'type'
>

/** FR-AUTH-25: every password field has an eye button (aria-pressed tells whether the text is shown). */
export function FormPasswordField<T extends FieldValues>({
  control,
  name,
  label,
  showCapsLockHint = false,
  children,
  id,
  ...inputProps
}: FormPasswordFieldProps<T>) {
  const { t } = useTranslation('auth')
  const [isVisible, setIsVisible] = useState(false)
  const [isCapsLockOn, setIsCapsLockOn] = useState(false)
  const inputId = id ?? `field-${name}`
  const errorId = `${inputId}-error`
  const capsId = `${inputId}-caps`

  const trackCapsLock = (event: KeyboardEvent<HTMLInputElement>) => {
    if (showCapsLockHint) setIsCapsLockOn(event.getModifierState('CapsLock'))
  }

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const describedBy = [
          fieldState.invalid ? errorId : null,
          isCapsLockOn ? capsId : null,
          inputProps['aria-describedby'] ?? null,
        ].filter(Boolean)
        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
            <div className="relative">
              <Input
                {...inputProps}
                {...field}
                id={inputId}
                type={isVisible ? 'text' : 'password'}
                className="pr-11"
                aria-invalid={fieldState.invalid}
                aria-describedby={describedBy.length ? describedBy.join(' ') : undefined}
                onKeyDown={trackCapsLock}
                onKeyUp={trackCapsLock}
                onBlur={() => {
                  setIsCapsLockOn(false)
                  field.onBlur()
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0 text-muted-foreground"
                aria-label={isVisible ? t('field.hidePassword') : t('field.showPassword')}
                aria-pressed={isVisible}
                aria-controls={inputId}
                disabled={inputProps.disabled}
                onClick={() => setIsVisible((visible) => !visible)}
              >
                {isVisible ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
              </Button>
            </div>
            {isCapsLockOn && (
              <FieldDescription
                id={capsId}
                className="flex items-center gap-1.5 text-highlight-text"
              >
                <ArrowBigUpDash className="size-3.5" aria-hidden />
                {t('message.capsLock')}
              </FieldDescription>
            )}
            {fieldState.error?.message && (
              <FieldError id={errorId}>{translateKey(fieldState.error.message)}</FieldError>
            )}
            {children}
          </Field>
        )
      }}
    />
  )
}
