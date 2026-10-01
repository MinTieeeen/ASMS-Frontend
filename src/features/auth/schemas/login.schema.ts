/**
 * @file Validation schemas of the login form (SCR-AUTH-01, User ID) and the forgot password form (SCR-AUTH-02, email).
 * @author MinhTien
 * @version 2.0.0
 * @since 2026-09-26
 * @modified 2026-09-29
 */

import { z } from 'zod'

import {
  EMAIL_MAX_LENGTH,
  LOGIN_PASSWORD_MAX_LENGTH,
  USER_CODE_MAX_LENGTH,
} from '@/config/constants'

/** Screen conventions: trimmed, at most 255 characters, matches ^[^\s@]+@[^\s@]+\.[^\s@]+$ (the backend re-checks). */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Messages are i18n keys ("namespace:key") translated by the form components (components/form),
 * so the schema does not depend on the active language.
 */
export const emailSchema = z
  .string()
  .trim()
  .min(1, 'auth:message.emailRequired')
  .max(EMAIL_MAX_LENGTH, 'auth:message.emailInvalid')
  .regex(EMAIL_PATTERN, 'auth:message.emailInvalid')

/** User ID: letters and digits only; case does not matter, the backend stores it uppercase. */
const USER_CODE_PATTERN = /^[A-Za-z0-9]*$/

export const userCodeSchema = z
  .string()
  .trim()
  .min(1, 'auth:message.userCodeRequired')
  .max(USER_CODE_MAX_LENGTH, 'auth:message.userCodeFormat')
  .regex(USER_CODE_PATTERN, 'auth:message.userCodeFormat')

/**
 * Users sign in with their User ID. The password policy is NOT applied at login and the password is never trimmed
 * (SCR-AUTH-01, component 5).
 */
export const loginSchema = z.object({
  userCode: userCodeSchema,
  password: z
    .string()
    .min(1, 'auth:message.passwordRequired')
    .max(LOGIN_PASSWORD_MAX_LENGTH, 'auth:message.passwordRequired'),
  rememberMe: z.boolean(),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const forgotPasswordSchema = z.object({ email: emailSchema })

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export function isValidEmail(value: string): boolean {
  return emailSchema.safeParse(value).success
}
