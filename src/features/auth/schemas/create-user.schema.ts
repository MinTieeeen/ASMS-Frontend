/**
 * @file Validation schema of the create account dialog, SCR-AUTH-06 components 2 to 5 (UC-AUTH-07).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { z } from 'zod'

import { emailSchema, userCodeSchema } from './login.schema'

const FULL_NAME_MIN_LENGTH = 2
const FULL_NAME_MAX_LENGTH = 100

export const createUserSchema = z.object({
  email: emailSchema,
  fullName: z
    .string()
    .trim()
    .min(FULL_NAME_MIN_LENGTH, 'auth:message.fullNameLength')
    .max(FULL_NAME_MAX_LENGTH, 'auth:message.fullNameLength'),
  userCode: userCodeSchema,
  systemRole: z.enum(['USER', 'ADMIN']),
})

export type CreateUserFormValues = z.infer<typeof createUserSchema>
