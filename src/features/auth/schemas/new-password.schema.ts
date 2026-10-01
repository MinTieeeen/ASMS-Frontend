/**
 * @file Validation schema of the "set a password" forms: reset (SCR-AUTH-03) and activation (SCR-AUTH-04).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { z } from 'zod'

import { meetsPolicy } from '../utils/password-policy'

/**
 * @param email full email of the account, or `null` when only a masked email is known (reset page); the email
 *   criterion is then checked by the server only
 */
export function newPasswordSchema(email: string | null) {
  return z
    .object({
      password: z
        .string()
        .min(1, 'auth:message.newPasswordRequired')
        .refine((value) => meetsPolicy(value, email), 'auth:message.passwordPolicy'),
      confirmPassword: z.string().min(1, 'auth:message.confirmPasswordRequired'),
    })
    .refine((values) => values.confirmPassword === values.password, {
      path: ['confirmPassword'],
      message: 'auth:message.passwordMismatch',
    })
}

export type NewPasswordFormValues = z.infer<ReturnType<typeof newPasswordSchema>>
