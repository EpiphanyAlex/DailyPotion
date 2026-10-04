export interface AuthActionResult {
  errorKey: string | null
}

export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
export const isPasswordLongEnough = (password: string) => password.length >= 8

/** Only local, path-absolute destinations are accepted; never redirect to auth endpoints. */
export function safeRedirectPath(
  input: string | null | undefined,
): string | null {
  if (
    !input ||
    !input.startsWith('/') ||
    input.startsWith('//') ||
    /[\\\r\n\0]/.test(input)
  )
    return null
  try {
    const url = new URL(input, 'https://dailypotion.invalid')
    if (
      url.origin !== 'https://dailypotion.invalid' ||
      url.username ||
      url.password
    )
      return null
    if (url.pathname.startsWith('/auth/') || url.pathname.startsWith('/api/'))
      return null
    if (input.includes('://')) return null
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return null
  }
}

export function authErrorKey(code: string | null | undefined): string {
  const keys: Record<string, string> = {
    invalid_credentials: 'invalidCredentials',
    email_exists: 'emailExists',
    user_already_exists: 'emailExists',
    email_not_confirmed: 'emailNotConfirmed',
    weak_password: 'weakPassword',
    same_password: 'samePassword',
    over_email_send_rate_limit: 'rateLimited',
    over_request_rate_limit: 'rateLimited',
  }
  return `auth.errors.${keys[code ?? ''] ?? 'generic'}`
}
