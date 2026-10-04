import { describe, expect, it } from 'vitest'
import {
  authErrorKey,
  isPasswordLongEnough,
  isValidEmail,
  safeRedirectPath,
} from './auth-helpers'

describe('auth input boundaries', () => {
  it('requires a usable email and eight character password', () => {
    expect(isValidEmail(' person@example.com ')).toBe(true)
    expect(isValidEmail('person@invalid')).toBe(false)
    expect(isPasswordLongEnough('1234567')).toBe(false)
    expect(isPasswordLongEnough('12345678')).toBe(true)
  })
  it('only redirects to local paths, retaining a useful query', () => {
    expect(safeRedirectPath('/cabinet?tab=owned')).toBe('/cabinet?tab=owned')
    for (const input of [
      'https://evil.test',
      '//evil.test',
      '/\\evil.test',
      '/auth/callback',
      '/api/secret',
      '/profile?next=https://evil.test',
      '/\r\nLocation:evil',
    ])
      expect(safeRedirectPath(input)).toBeNull()
  })
  it('maps known auth errors and hides unknown details', () => {
    expect(authErrorKey('invalid_credentials')).toBe(
      'auth.errors.invalidCredentials',
    )
    expect(authErrorKey('user_already_exists')).toBe('auth.errors.emailExists')
    expect(authErrorKey('unexpected')).toBe('auth.errors.generic')
  })
})
