/**
 * @file Validation schema of the login form.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-26
 * @modified 2026-09-26
 */

import { z } from 'zod'

import { PASSWORD_MIN_LENGTH } from '@/config/constants'

/**
 * Messages are i18n keys ("namespace:key") translated by the form components (components/form),
 * so the schema does not depend on the active language.
 */
export const loginSchema = z.object({
  email: z.email('auth:validation.emailInvalid'),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, 'auth:validation.passwordRule')
    .regex(/[a-zA-Z]/, 'auth:validation.passwordRule')
    .regex(/\d/, 'auth:validation.passwordRule'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
