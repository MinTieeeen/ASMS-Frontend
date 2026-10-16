/**
 * @file Validation of the create group dialog (UC03, UC02): only the name is required.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { z } from 'zod'

export const GROUP_NAME_MAX_LENGTH = 100

export const createGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'groups:validation.nameRequired')
    .max(GROUP_NAME_MAX_LENGTH, 'groups:validation.nameTooLong'),
  topic: z.string().trim().max(200, 'groups:validation.tooLong'),
  description: z.string().trim().max(2000, 'groups:validation.tooLong'),
  subjectCode: z.string().trim().max(20, 'groups:validation.tooLong'),
  subjectName: z.string().trim().max(150, 'groups:validation.tooLong'),
  semester: z.string(),
  lecturerName: z.string().trim().max(100, 'groups:validation.tooLong'),
  /** BR02: kept as text by the select, between 1 and the system limit */
  maxMembers: z.string(),
  template: z.enum(['blank', 'software', 'research']),
})

export type CreateGroupFormValues = z.infer<typeof createGroupSchema>

/** Fields of the first step, validated before moving to the template step */
export const CREATE_GROUP_INFO_FIELDS = [
  'name',
  'topic',
  'description',
  'subjectCode',
  'subjectName',
  'lecturerName',
] as const
