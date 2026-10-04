import { loadAvatarFile, maxZoomFor } from './avatar-file'

describe('loadAvatarFile', () => {
  it('rejects types other than JPEG, PNG and WebP before reading the file', async () => {
    const gif = new File(['GIF89a'], 'a.gif', { type: 'image/gif' })
    const svg = new File(['<svg/>'], 'a.svg', { type: 'image/svg+xml' })

    expect(await loadAvatarFile(gif)).toEqual({ ok: false, error: 'unsupported' })
    expect(await loadAvatarFile(svg)).toEqual({ ok: false, error: 'unsupported' })
  })

  it('rejects files over 5 MB', async () => {
    const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'a.jpg', { type: 'image/jpeg' })

    expect(await loadAvatarFile(big)).toEqual({ ok: false, error: 'tooLarge' })
  })
})

describe('maxZoomFor', () => {
  it('keeps the crop at least 128 px and caps at 3×', () => {
    expect(maxZoomFor(2000, 1500)).toBe(3)
    expect(maxZoomFor(256, 300)).toBe(2)
    expect(maxZoomFor(128, 128)).toBe(1)
  })
})
