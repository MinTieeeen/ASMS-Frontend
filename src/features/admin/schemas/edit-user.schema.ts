/**
 * @file Validation of the Admin edit form, SCR-USER-05 components 6–9 (BR-USER-01, BR-AUTH-02, BR-USER-08). Messages
 *   are i18n keys translated by the form components.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-05
 * @modified 2026-10-05
 */

import { z } from 'zod'

import type { SchoolRefResponse } from '@/api/generated/models'
import { EMAIL_MAX_LENGTH, USER_CODE_MAX_LENGTH } from '@/config/constants'
import { collapseWhitespace } from '@/utils/search'

const FULL_NAME_MIN_LENGTH = 2
const FULL_NAME_MAX_LENGTH = 100
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USER_CODE_PATTERN = /^[A-Za-z0-9]*$/

export const editUserSchema = z.object({
  fullName: z.string().refine((value) => {
    // Counted in code points after collapsing spaces, like the backend
    const length = [...collapseWhitespace(value)].length
    return length >= FULL_NAME_MIN_LENGTH && length <= FULL_NAME_MAX_LENGTH
  }, 'auth:message.fullNameLength'),
  email: z
    .string()
    .trim()
    .min(1, 'auth:message.emailRequired')
    .max(EMAIL_MAX_LENGTH, 'auth:message.emailInvalid')
    .regex(EMAIL_PATTERN, 'auth:message.emailInvalid'),
  userCode: z
    .string()
    .trim()
    .min(1, 'auth:message.userCodeRequired')
    .max(USER_CODE_MAX_LENGTH, 'auth:message.userCodeFormat')
    .regex(USER_CODE_PATTERN, 'auth:message.userCodeFormat'),
  school: z.custom<SchoolRefResponse | null>(),
})

export type EditUserFormValues = z.infer<typeof editUserSchema>
