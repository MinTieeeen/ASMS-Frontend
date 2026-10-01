/**
 * @file Date helpers for BR13: API uses ISO 8601 UTC, UI shows the user time zone.
 * @author MinhTien
 * @version 1.1.0
 * @since 2026-09-26
 * @modified 2026-09-29
 */

import { endOfDay } from 'date-fns'
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'

import { env } from '@/config/env'

export const DATE_FORMAT = 'dd/MM/yyyy'
// Auth screen conventions: dd/MM/yyyy HH:mm
export const DATE_TIME_FORMAT = 'dd/MM/yyyy HH:mm'

export function formatDate(iso: string | Date, timeZone = env.defaultTimezone): string {
  return formatInTimeZone(iso, timeZone, DATE_FORMAT)
}

export function formatDateTime(iso: string | Date, timeZone = env.defaultTimezone): string {
  return formatInTimeZone(iso, timeZone, DATE_TIME_FORMAT)
}

export function toDeadlineIso(date: Date, timeZone = env.defaultTimezone): string {
  const local = endOfDay(date)
  local.setSeconds(0, 0)
  return fromZonedTime(local, timeZone).toISOString()
}

/** Relative time of a past moment; the caller translates it (common `time.*` keys). */
export type RelativeTime =
  | { unit: 'justNow' }
  | { unit: 'minutes' | 'hours' | 'days'; count: number }
  | { unit: 'date'; text: string }

const MINUTE_MS = 60_000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS
const RELATIVE_MAX_DAYS = 7

/**
 * Screen conventions: "just now" under 1 minute, then minutes, hours and days ago; beyond 7 days the full date
 * and time.
 */
export function toRelativeTime(
  iso: string | Date,
  now = new Date(),
  timeZone = env.defaultTimezone,
): RelativeTime {
  const elapsed = Math.max(0, now.getTime() - new Date(iso).getTime())
  if (elapsed < MINUTE_MS) return { unit: 'justNow' }
  if (elapsed < HOUR_MS) return { unit: 'minutes', count: Math.floor(elapsed / MINUTE_MS) }
  if (elapsed < DAY_MS) return { unit: 'hours', count: Math.floor(elapsed / HOUR_MS) }
  if (elapsed <= RELATIVE_MAX_DAYS * DAY_MS) {
    return { unit: 'days', count: Math.floor(elapsed / DAY_MS) }
  }
  return { unit: 'date', text: formatDateTime(iso, timeZone) }
}

export function isOverdue(dueAt: string | null | undefined, isClosed: boolean, now = new Date()) {
  return !!dueAt && !isClosed && new Date(dueAt) < now
}
