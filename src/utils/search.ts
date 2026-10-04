/**
 * @file Accent-insensitive text matching for Vietnamese, same rules as SearchNormalizer on the backend.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-04
 * @modified 2026-10-04
 */

/** "  Nguyễn  Văn Đạt " → "nguyen van dat" */
export function toSearchKey(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

/** Trims and collapses inner whitespace (BR-USER-01) */
export function collapseWhitespace(text: string): string {
  return text.trim().replace(/\s+/g, ' ')
}
