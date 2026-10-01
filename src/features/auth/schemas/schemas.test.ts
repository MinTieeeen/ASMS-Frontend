import { forgotPasswordSchema, loginSchema } from './login.schema'
import { newPasswordSchema } from './new-password.schema'

function messages(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return result.error?.issues.map((issue) => issue.message) ?? []
}

describe('loginSchema', () => {
  it('requires User ID and password (MSG-03)', () => {
    const result = loginSchema.safeParse({ userCode: '', password: '', rememberMe: false })

    expect(messages(result)).toEqual([
      'auth:message.userCodeRequired',
      'auth:message.passwordRequired',
    ])
  })

  it('trims the User ID and does not apply the password policy', () => {
    const result = loginSchema.safeParse({
      userCode: '  se170001 ',
      password: '1',
      rememberMe: true,
    })

    expect(result.success).toBe(true)
    expect(result.data?.userCode).toBe('se170001')
  })

  it('requires a User ID made of letters and digits', () => {
    const userCode = (value: string) =>
      messages(loginSchema.safeParse({ userCode: value, password: 'x', rememberMe: false }))
    expect(userCode('')).toEqual(['auth:message.userCodeRequired'])
    expect(userCode('SE-1')).toEqual(['auth:message.userCodeFormat'])
  })

  it('rejects a malformed email (MSG-02)', () => {
    expect(messages(forgotPasswordSchema.safeParse({ email: 'a@b' }))).toEqual([
      'auth:message.emailInvalid',
    ])
  })
})

describe('newPasswordSchema', () => {
  const schema = newPasswordSchema('nguyen.van.a@gmail.com')

  it('accepts matching passwords that meet the policy', () => {
    expect(schema.safeParse({ password: 'Secret123', confirmPassword: 'Secret123' }).success).toBe(
      true,
    )
  })

  it('reports policy (MSG-17) and mismatch (MSG-16)', () => {
    expect(messages(schema.safeParse({ password: 'short', confirmPassword: 'x' }))).toEqual(
      expect.arrayContaining(['auth:message.passwordPolicy']),
    )
    expect(
      messages(schema.safeParse({ password: 'Secret123', confirmPassword: 'Secret124' })),
    ).toEqual(['auth:message.passwordMismatch'])
  })

  it('requires both fields (MSG-33, MSG-35)', () => {
    expect(messages(schema.safeParse({ password: '', confirmPassword: '' }))).toEqual(
      expect.arrayContaining([
        'auth:message.newPasswordRequired',
        'auth:message.confirmPasswordRequired',
      ]),
    )
  })
})
