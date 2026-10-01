/**
 * @file Display formatting helpers.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-26
 * @modified 2026-09-26
 */

const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB'] as const

export function formatFileSize(bytes: number): string {
  let value = bytes
  let unitIndex = 0
  while (value >= 1024 && unitIndex < FILE_SIZE_UNITS.length - 1) {
    value /= 1024
    unitIndex++
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${FILE_SIZE_UNITS[unitIndex]}`
}

export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

export function formatPercent(ratio: number, fractionDigits = 0): string {
  return `${(ratio * 100).toFixed(fractionDigits)}%`
}

/** "Nguyễn Văn An" → "NA", "An" → "A": first letters of the first and last words. */
export function initialsOf(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean)
  const first = words[0]?.charAt(0) ?? '?'
  const last = words.length > 1 ? (words[words.length - 1]?.charAt(0) ?? '') : ''
  return (first + last).toUpperCase()
}
