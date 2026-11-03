/**
 * @file Validation of the task form (UC08 step 2): only the title is required; the due date cannot be before the
 *   start date.
 * @author MinhTien
 * @version 1.1.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { z } from 'zod'

export const TASK_TITLE_MAX_LENGTH = 200
export const TASK_DESCRIPTION_MAX_LENGTH = 5000
/** Select value meaning "nobody" / "no phase" */
export const NONE = 'none'

export const taskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'tasks:validation.titleRequired')
      .max(TASK_TITLE_MAX_LENGTH, 'tasks:validation.tooLong'),
    description: z.string().trim().max(TASK_DESCRIPTION_MAX_LENGTH, 'tasks:validation.tooLong'),
    assigneeId: z.string(),
    /** `yyyy-MM-dd` from `<input type="date">`, empty when not planned */
    startDate: z.string(),
    /** `yyyy-MM-dd` from `<input type="date">`, empty when there is no deadline */
    dueDate: z.string(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    phaseId: z.string(),
  })
  // yyyy-MM-dd strings compare in calendar order; both dates stay optional
  .refine((values) => !values.startDate || !values.dueDate || values.dueDate >= values.startDate, {
    path: ['dueDate'],
    message: 'tasks:validation.dueBeforeStart',
  })

export type TaskFormValues = z.infer<typeof taskSchema>
