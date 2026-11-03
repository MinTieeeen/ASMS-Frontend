/**
 * @file Validation of the phase form (UC06 step 2): name and both dates required, the end not before the start.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { z } from 'zod'

export const PHASE_NAME_MAX_LENGTH = 100
export const PHASE_GOAL_MAX_LENGTH = 500
/** Select value meaning "no related milestone" */
export const NO_MILESTONE = 'none'

export const phaseSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'groups:validation.phaseNameRequired')
      .max(PHASE_NAME_MAX_LENGTH, 'groups:validation.tooLong'),
    goal: z.string().trim().max(PHASE_GOAL_MAX_LENGTH, 'groups:validation.tooLong'),
    /** `yyyy-MM-dd` from `<input type="date">` */
    startDate: z.string().min(1, 'groups:validation.dateRequired'),
    endDate: z.string().min(1, 'groups:validation.dateRequired'),
    milestoneId: z.string(),
  })
  // yyyy-MM-dd strings compare in calendar order
  .refine((values) => !values.startDate || !values.endDate || values.endDate >= values.startDate, {
    path: ['endDate'],
    message: 'groups:validation.endBeforeStart',
  })

export type PhaseFormValues = z.infer<typeof phaseSchema>
