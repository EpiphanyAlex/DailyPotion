'use client'

import Link from 'next/link'
import { useState, useTransition, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { isPasswordLongEnough, isValidEmail } from '@/lib/auth-helpers'
import type { Locale } from '@/lib/matching'
import { signUp } from '../(auth)/actions'

export function SignupForm({
  locale,
  redirectTo,
}: {
  locale: Locale
  redirectTo: string | null
}) {
  const t = useTranslations()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirm: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [pending, start] = useTransition()
  const valid =
    isValidEmail(email) &&
    isPasswordLongEnough(password) &&
    password === confirm
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!valid || pending) return
    setError(null)
    start(async () => {
      try {
        const r = await signUp({ email, password, locale, redirectTo })
        if (r.errorKey) setError(r.errorKey)
        else setSent(true)
      } catch {
        setError('auth.errors.generic')
      }
    })
  }
  if (sent)
    return (
      <div
        role="status"
        className="mt-xxl rounded-md border border-success bg-success-soft p-xl"
      >
        <h2 className="font-display text-card-title text-success">
          {t('auth.signup.checkEmailTitle')}
        </h2>
        <p className="mt-sm font-body text-body text-ink-soft">
          {t('auth.signup.checkEmailBody', { email })}
        </p>
        <Link
          href={`/${locale}/login${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
          className="mt-lg inline-block font-ui text-caption font-semibold text-accent hover:underline focus-visible:focus-ring"
        >
          {t('auth.signup.loginLink')}
        </Link>
      </div>
    )
  return (
    <form onSubmit={submit} className="mt-xxl flex flex-col gap-xl" noValidate>
      <Input
        type="email"
        autoComplete="email"
        label={t('auth.signup.emailLabel')}
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
      <Input
        type="password"
        autoComplete="new-password"
        label={t('auth.signup.passwordLabel')}
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
      <Input
        type="password"
        autoComplete="new-password"
        label={t('auth.signup.confirmPasswordLabel')}
        value={confirm}
        onChange={(e) => {
          setConfirm(e.target.value)
          setError(null)
        }}
        onBlur={() => setTouched((s) => ({ ...s, confirm: true }))}
        error={
          touched.confirm && confirm !== password
            ? t('auth.validation.passwordMismatch')
            : null
        }
      />
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
        {t('auth.signup.submit')}
      </Button>
      <p className="text-center font-ui text-body text-ink-soft">
        {t('auth.signup.haveAccount')}{' '}
        <Link
          href={`/${locale}/login${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
          className="font-semibold text-accent hover:underline focus-visible:focus-ring"
        >
          {t('auth.signup.loginLink')}
        </Link>
      </p>
    </form>
  )
}
