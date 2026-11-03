/**
 * @file Date helpers for BR13: API uses ISO 8601 UTC, UI shows the user time zone.
 * @author MinhTien
 * @version 1.3.0
 * @since 2026-09-26
 * @modified 2026-11-03
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

const DATE_INPUT_FORMAT = 'yyyy-MM-dd'

/** Value of an `<input type="date">` for an ISO instant, as the day it falls on in the user time zone */
export function toDateInputValue(iso: string, timeZone = env.defaultTimezone): string {
  return formatInTimeZone(iso, timeZone, DATE_INPUT_FORMAT)
}

/**
 * ISO instant of a day picked in an `<input type="date">`: 00:00 for the start of a range, 23:59 for its end
 * (BR13), both in the user time zone.
 */
export function fromDateInputValue(
  value: string,
  edge: 'start' | 'end',
  timeZone = env.defaultTimezone,
): string {
  return fromZonedTime(`${value}T${edge === 'start' ? '00:00:00' : '23:59:00'}`, timeZone).toISOString()
}

/** Value of an `<input type="time">` (`HH:mm`) for an ISO instant, in the user time zone */
export function toTimeInputValue(iso: string, timeZone = env.defaultTimezone): string {
  return formatInTimeZone(iso, timeZone, 'HH:mm')
}

/** ISO instant of a day and time picked in the user time zone, e.g. a milestone's real due time */
export function fromDateTimeInputValues(date: string, time: string, timeZone = env.defaultTimezone): string {
  return fromZonedTime(`${date}T${time}:00`, timeZone).toISOString()
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
