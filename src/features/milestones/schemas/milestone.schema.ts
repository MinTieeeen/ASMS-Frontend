/**
 * @file Validation of the milestone form (UC10 step 1) and of the result form (UC10 step 5).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { z } from 'zod'

export const MILESTONE_NAME_MAX_LENGTH = 150
export const MILESTONE_DESCRIPTION_MAX_LENGTH = 2000
export const MAX_SCORE = 10

/** Empty, or a number between `min` and `max`, typed in a number input */
const optionalNumberIn = (min: number, max: number) => (value: string) =>
  value.trim() === '' || (Number.isFinite(Number(value)) && Number(value) >= min && Number(value) <= max)

export const milestoneSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'milestones:validation.nameRequired')
    .max(MILESTONE_NAME_MAX_LENGTH, 'milestones:validation.tooLong'),
  description: z.string().trim().max(MILESTONE_DESCRIPTION_MAX_LENGTH, 'milestones:validation.tooLong'),
  /** `yyyy-MM-dd` and `HH:mm`: the real due time set by the lecturer */
  dueDate: z.string().min(1, 'milestones:validation.dateRequired'),
  dueTime: z.string().min(1, 'milestones:validation.timeRequired'),
  /** Percent, optional */
  weight: z.string().refine(optionalNumberIn(0, 100), 'milestones:validation.weightRange'),
})

export type MilestoneFormValues = z.infer<typeof milestoneSchema>

export const resultSchema = z.object({
  score: z
    .string()
    .refine((value) => value.trim() !== '' && optionalNumberIn(0, MAX_SCORE)(value), 'milestones:validation.scoreRange'),
  feedback: z.string().trim().max(MILESTONE_DESCRIPTION_MAX_LENGTH, 'milestones:validation.tooLong'),
})

export type ResultFormValues = z.infer<typeof resultSchema>
