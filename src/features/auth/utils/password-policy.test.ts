import { evaluatePassword, meetsPolicy } from './password-policy'

const EMAIL = 'nguyen.van.a@gmail.com'

describe('evaluatePassword (BR-AUTH-01)', () => {
  it('accepts a valid password', () => {
    expect(meetsPolicy('Secret123', EMAIL)).toBe(true)
  })

  it.each([
    ['Abc1234', 'LENGTH'],
    ['a1'.padEnd(65, 'x'), 'LENGTH'],
    ['12345678', 'LETTER'],
    ['abcdefgh', 'DIGIT'],
    [' Secret123', 'WHITESPACE'],
    ['Secret123 ', 'WHITESPACE'],
    ['xNguyen.Van.A9', 'CONTAINS_EMAIL'],
  ] as const)('reports %s as failing %s', (password, criterion) => {
    expect(evaluatePassword(password, EMAIL)[criterion]).toBe(false)
  })

  it('accepts Vietnamese letters', () => {
    expect(meetsPolicy('Mậtkhẩu9', EMAIL)).toBe(true)
  })

  it('ignores an email name shorter than 4 characters', () => {
    expect(evaluatePassword('abc12345', 'abc@gmail.com').CONTAINS_EMAIL).toBe(true)
  })

  it('leaves the email criterion to the server when only a masked email is known', () => {
    expect(evaluatePassword('Secret123', null).CONTAINS_EMAIL).toBeNull()
    expect(meetsPolicy('Secret123', null)).toBe(true)
  })
})
