/**
 * @file Validated environment variables. Never read import.meta.env anywhere else.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-26
 * @modified 2026-09-26
 */

import { z } from 'zod'

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().default(''),
  VITE_APP_NAME: z.string().default('ASMS'),
  VITE_DEFAULT_TIMEZONE: z.string().default('Asia/Ho_Chi_Minh'),
})

const parsed = envSchema.parse(import.meta.env)

export const env = {
  apiBaseUrl: parsed.VITE_API_BASE_URL,
  appName: parsed.VITE_APP_NAME,
  defaultTimezone: parsed.VITE_DEFAULT_TIMEZONE,
  isDev: import.meta.env.DEV,
} as const
