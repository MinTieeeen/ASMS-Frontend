/**
 * @file Validation schema of the profile form, SCR-USER-01 components 6, 9, 11 (BR-USER-01, 03, 06).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-04
 * @modified 2026-10-04
 */

import { z } from 'zod'

import type { SchoolRefResponse } from '@/api/generated/models'
import { collapseWhitespace } from '@/utils/search'

export const FULL_NAME_MIN_LENGTH = 2
export const FULL_NAME_MAX_LENGTH = 100
export const BIO_MAX_LENGTH = 300
export const BIO_MAX_LINES = 5

/** Counted in code points, like the backend */
export const textLength = (text: string) => [...text].length

export const fullNameSchema = z.string().refine((value) => {
  const length = textLength(collapseWhitespace(value))
  return length >= FULL_NAME_MIN_LENGTH && length <= FULL_NAME_MAX_LENGTH
}, 'auth:message.fullNameLength')

export const profileSchema = z.object({
  fullName: fullNameSchema,
  school: z.custom<SchoolRefResponse | null>(),
  bio: z
    .string()
    .refine(
      (value) =>
        textLength(value.trim()) <= BIO_MAX_LENGTH &&
        value.trim().split(/\r?\n/).length <= BIO_MAX_LINES,
      'profile:message.bioTooLong',
    ),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
