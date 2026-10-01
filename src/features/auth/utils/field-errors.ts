/**
 * @file Puts VALIDATION_ERROR field errors of the API under the matching form fields (state-and-api rules).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form'

import { toApiError } from '@/api/http-client'

/** Message key per field and error code; codes not listed fall back to the field's generic message. */
const FIELD_MESSAGES: Record<string, Partial<Record<string, string>> & { default: string }> = {
  email: { REQUIRED: 'auth:message.emailRequired', default: 'auth:message.emailInvalid' },
  password: { REQUIRED: 'auth:message.passwordRequired', default: 'auth:message.passwordPolicy' },
  newPassword: {
    REQUIRED: 'auth:message.newPasswordRequired',
    default: 'auth:message.passwordPolicy',
  },
  fullName: { default: 'auth:message.fullNameLength' },
  userCode: { REQUIRED: 'auth:message.userCodeRequired', default: 'auth:message.userCodeFormat' },
}

const GENERIC_MESSAGE = 'common:error.generic'

/**
 * @param fieldMap maps API field names to form field names when they differ (e.g. `newPassword` → `password`)
 * @returns true when the error was a VALIDATION_ERROR and has been applied to the form
 */
export function applyFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fieldMap: Partial<Record<string, FieldPath<T>>> = {},
): boolean {
  const apiError = toApiError(error)
  if (apiError.code !== 'VALIDATION_ERROR' || apiError.fieldErrors.length === 0) return false
  apiError.fieldErrors.forEach(({ field, code }, index) => {
    const messages = FIELD_MESSAGES[field]
    const message = messages ? (messages[code] ?? messages.default) : GENERIC_MESSAGE
    const target = fieldMap[field] ?? (field as FieldPath<T>)
    setError(target, { type: 'server', message }, { shouldFocus: index === 0 })
  })
  return true
}
