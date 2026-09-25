/**
 * @file Client-side business constants. Source of truth is the requirement; the backend always re-validates.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-26
 * @modified 2026-09-26
 */

export const API_PREFIX = '/api/v1'

export const DEFAULT_PAGE_SIZE = 20

/** BR14: max 25 MB per file */
export const MAX_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024

/** BR04: group code has 6 alphanumeric characters */
export const GROUP_CODE_LENGTH = 6

/** NFR05: password needs at least 8 characters with letters and digits */
export const PASSWORD_MIN_LENGTH = 8

export const SUPPORTED_LANGUAGES = ['vi', 'en'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]
export const DEFAULT_LANGUAGE: SupportedLanguage = 'vi'
