import { loginPath, roleHome, safeRedirect } from './redirect'

describe('safeRedirect (BR-AUTH-13)', () => {
  it.each(['/dashboard', '/groups/42?tab=tasks', '/'])('accepts the internal path %s', (path) => {
    expect(safeRedirect(path)).toBe(path)
  })

  it.each(['//evil.com', 'https://evil.com', 'dashboard', '/\\evil.com', '', null, undefined])(
    'rejects %s',
    (value) => {
      expect(safeRedirect(value)).toBeNull()
    },
  )
})

describe('roleHome (FR-AUTH-04)', () => {
  it('sends Admins to /admin and users to /dashboard', () => {
    expect(roleHome({ systemRole: 'ADMIN' })).toBe('/admin')
    expect(roleHome({ systemRole: 'USER' })).toBe('/dashboard')
    expect(roleHome(null)).toBe('/dashboard')
  })
})

describe('loginPath', () => {
  it('encodes redirect, message and email', () => {
    expect(loginPath({ redirect: '/groups/1?x=2', msg: 'session_expired' })).toBe(
      '/login?redirect=%2Fgroups%2F1%3Fx%3D2&msg=session_expired',
    )
  })

  it('drops an unsafe redirect', () => {
    expect(loginPath({ redirect: '//evil.com' })).toBe('/login')
  })
})
