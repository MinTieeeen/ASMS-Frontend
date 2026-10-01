/**
 * @file Validation schema of the change password form, SCR-AUTH-05 components 4, 5, 7 (UC-AUTH-06).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { z } from 'zod'

import { meetsPolicy } from '../utils/password-policy'

/** @param email the signed-in user's email, so the email criterion is checked on the client too */
export function changePasswordSchema(email: string) {
  return z
    .object({
      currentPassword: z.string().min(1, 'auth:message.currentPasswordRequired'),
      newPassword: z
        .string()
        .min(1, 'auth:message.newPasswordRequired')
        .refine((value) => meetsPolicy(value, email), 'auth:message.passwordPolicy'),
      confirmPassword: z.string().min(1, 'auth:message.confirmPasswordRequired'),
    })
    .refine((values) => values.newPassword !== values.currentPassword, {
      path: ['newPassword'],
      message: 'auth:message.passwordSameAsOld',
    })
    .refine((values) => values.confirmPassword === values.newPassword, {
      path: ['confirmPassword'],
      message: 'auth:message.passwordMismatch',
    })
}

export type ChangePasswordFormValues = z.infer<ReturnType<typeof changePasswordSchema>>
