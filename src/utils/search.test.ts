import { collapseWhitespace, toSearchKey } from './search'

describe('toSearchKey', () => {
  it.each([
    ['Nguyễn Văn A', 'nguyen van a'],
    ['  ĐẶNG   thị  Ánh ', 'dang thi anh'],
    ['Trường Đại học Bách khoa, ĐHQG-HCM', 'truong dai hoc bach khoa, dhqg-hcm'],
  ])('%s → %s', (input, expected) => {
    expect(toSearchKey(input)).toBe(expected)
  })
})

describe('collapseWhitespace', () => {
  it('trims and keeps single spaces', () => {
    expect(collapseWhitespace('  Trần \t Thị\nB ')).toBe('Trần Thị B')
  })
})
