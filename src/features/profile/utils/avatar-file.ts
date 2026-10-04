/**
 * @file Checks a chosen photo before upload (BR-USER-07); the backend checks again from the file content.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-04
 * @modified 2026-10-04
 */

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024
export const AVATAR_MIN_SIDE = 128
export const AVATAR_MAX_SIDE = 6000
export const AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp'
const ACCEPTED_TYPES = AVATAR_ACCEPT.split(',')

export type AvatarFileError = 'unsupported' | 'tooLarge' | 'invalid'

/** A photo ready to crop: object URL and upright size as the browser shows it (EXIF orientation applied) */
export interface LoadedAvatar {
  file: File
  url: string
  width: number
  height: number
}

export type AvatarFileResult =
  { ok: true; image: LoadedAvatar } | { ok: false; error: AvatarFileError }

export async function loadAvatarFile(file: File): Promise<AvatarFileResult> {
  if (!ACCEPTED_TYPES.includes(file.type)) return { ok: false, error: 'unsupported' }
  if (file.size > AVATAR_MAX_BYTES) return { ok: false, error: 'tooLarge' }
  const url = URL.createObjectURL(file)
  try {
    const { width, height } = await imageSize(url)
    if (Math.min(width, height) < AVATAR_MIN_SIDE || Math.max(width, height) > AVATAR_MAX_SIDE) {
      URL.revokeObjectURL(url)
      return { ok: false, error: 'invalid' }
    }
    return { ok: true, image: { file, url, width, height } }
  } catch {
    URL.revokeObjectURL(url)
    return { ok: false, error: 'invalid' }
  }
}

function imageSize(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight })
    image.onerror = () => reject(new Error('Unreadable image'))
    image.src = url
  })
}

/**
 * Largest zoom that keeps the crop square at least 128 px of the original, capped at 3× (SCR-USER-02 (4)); the
 * backend rejects smaller squares.
 */
export function maxZoomFor(width: number, height: number): number {
  return Math.max(1, Math.min(3, Math.min(width, height) / AVATAR_MIN_SIDE))
}
