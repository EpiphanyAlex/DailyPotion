'use client'

import Link from 'next/link'
import { useState, useTransition, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { isPasswordLongEnough, isValidEmail } from '@/lib/auth-helpers'
import type { Locale } from '@/lib/matching'
import { signIn } from '../(auth)/actions'

export function LoginForm({
  locale,
  redirectTo,
}: {
  locale: Locale
  redirectTo: string | null
}) {
  const t = useTranslations()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const valid = isValidEmail(email) && isPasswordLongEnough(password)
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!valid || pending) return
    setError(null)
    start(async () => {
      try {
        const result = await signIn({ email, password, locale, redirectTo })
        setError(result.errorKey)
      } catch {
        setError('auth.errors.generic')
      }
    })
  }
  return (
    <form onSubmit={submit} className="mt-xl flex flex-col gap-xl" noValidate>
      <Input
        type="email"
        autoComplete="email"
        label={t('auth.login.emailLabel')}
        placeholder={t('auth.login.emailPlaceholder')}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          setError(null)
        }}
        onBlur={() => setTouched((s) => ({ ...s, email: true }))}
        error={
          touched.email && email && !isValidEmail(email)
            ? t('auth.validation.emailInvalid')
            : null
        }
      />
      <div>
        <Input
          type={passwordVisible ? 'text' : 'password'}
          autoComplete="current-password"
          label={t('auth.login.passwordLabel')}
          trailing={
            <button
              type="button"
              onClick={() => setPasswordVisible((visible) => !visible)}
              aria-label={t(passwordVisible ? 'auth.login.hidePassword' : 'auth.login.showPassword')}
              aria-pressed={passwordVisible}
              className="flex size-8 items-center justify-center rounded-sm text-ink-faint hover:text-ink focus-visible:focus-ring"
            >
              {passwordVisible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
            </button>
          }
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setError(null)
          }}
          onBlur={() => setTouched((s) => ({ ...s, password: true }))}
          error={
            touched.password && password && !isPasswordLongEnough(password)
              ? t('auth.validation.passwordTooShort')
              : null
          }
        />
        <Link
          href={`/${locale}/reset-password`}
          className="mt-sm block text-right font-ui text-caption font-semibold text-accent hover:underline focus-visible:focus-ring"
        >
          {t('auth.login.forgotPassword')}
        </Link>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-sm border border-danger bg-danger-soft p-md font-ui text-caption text-danger"
        >
          {t(error as Parameters<typeof t>[0])}
        </p>
      )}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!valid}
        loading={pending}
      >
        {t('auth.login.submit')}
      </Button>
      <p className="text-center font-ui text-body text-ink-soft">
        {t('auth.login.noAccount')}{' '}
        <Link
          href={`/${locale}/signup${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
          className="font-semibold text-accent hover:underline focus-visible:focus-ring"
        >
          {t('auth.login.signupLink')}
        </Link>
      </p>
    </form>
  )
}
