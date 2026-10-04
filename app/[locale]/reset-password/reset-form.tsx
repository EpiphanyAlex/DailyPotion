'use client'

import Link from 'next/link'
import { useState, useTransition, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { isValidEmail, isPasswordLongEnough } from '@/lib/auth-helpers'
import type { Locale } from '@/lib/matching'
import { resetPassword, updatePassword } from '../(auth)/actions'

export function ResetForm({
  locale,
  mode,
}: {
  locale: Locale
  mode: 'request' | 'update'
}) {
  const t = useTranslations()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [pending, start] = useTransition()
  const valid =
    mode === 'request'
      ? isValidEmail(email)
      : isPasswordLongEnough(password) && password === confirm
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!valid || pending) return
    setError(null)
    start(async () => {
      try {
        const r =
          mode === 'request'
            ? await resetPassword({ email, locale })
            : await updatePassword({ password, locale })
        if (r.errorKey) setError(r.errorKey)
        else setSent(true)
      } catch {
        setError('auth.errors.generic')
      }
    })
  }
  if (sent)
    return (
      <p
        role="status"
        className="mt-xxl rounded-sm border border-success bg-success-soft p-md font-ui text-body text-success"
      >
        {t('auth.reset.sent')}
      </p>
    )
  return (
    <form onSubmit={submit} className="mt-xxl flex flex-col gap-xl" noValidate>
      {mode === 'request' ? (
        <Input
          type="email"
          autoComplete="email"
          label={t('auth.reset.emailLabel')}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError(null)
          }}
          onBlur={() => setTouched(true)}
          error={
            touched && email && !isValidEmail(email)
              ? t('auth.validation.emailInvalid')
              : null
          }
        />
      ) : (
        <>
          <Input
            type="password"
            autoComplete="new-password"
            label={t('auth.reset.newPasswordLabel')}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError(null)
            }}
            onBlur={() => setTouched(true)}
            error={
              touched && password && !isPasswordLongEnough(password)
                ? t('auth.validation.passwordTooShort')
                : null
            }
          />
          <Input
            type="password"
            autoComplete="new-password"
            label={t('auth.reset.confirmPasswordLabel')}
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value)
              setError(null)
            }}
            onBlur={() => setTouched(true)}
            error={
              touched && confirm !== password
                ? t('auth.validation.passwordMismatch')
                : null
            }
          />
        </>
      )}
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
        {mode === 'request'
          ? t('auth.reset.submit')
          : t('auth.reset.updateSubmit')}
      </Button>
      <Link
        href={`/${locale}/login`}
        className="text-center font-ui text-caption font-semibold text-accent hover:underline focus-visible:focus-ring"
      >
        {t('auth.reset.backToLogin')}
      </Link>
    </form>
  )
}
