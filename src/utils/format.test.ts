import { formatFileSize, getInitials } from '@/utils/format'

describe('formatFileSize', () => {
  it('formats bytes into the largest suitable unit', () => {
    expect(formatFileSize(512)).toBe('512 B')
    expect(formatFileSize(25 * 1024 * 1024)).toBe('25.0 MB')
  })
})

describe('getInitials', () => {
  it('takes first letters of the first and last word', () => {
    expect(getInitials('Nguyễn Văn An')).toBe('NA')
    expect(getInitials('an')).toBe('A')
  })
})
