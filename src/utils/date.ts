/**
 * @file Date helpers for BR13: API uses ISO 8601 UTC, UI shows the user time zone.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-26
 * @modified 2026-09-26
 */

import { endOfDay } from 'date-fns'
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'

import { env } from '@/config/env'

export const DATE_FORMAT = 'dd/MM/yyyy'
export const DATE_TIME_FORMAT = 'HH:mm dd/MM/yyyy'

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

export function isOverdue(dueAt: string | null | undefined, isClosed: boolean, now = new Date()) {
  return !!dueAt && !isClosed && new Date(dueAt) < now
}
