'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import type { Locale } from '@/lib/matching'
import { signOut } from '@/app/[locale]/(auth)/actions'

export function SignOutButton({ locale }: { locale: Locale }) {
  const t = useTranslations('nav')
  const [pending, start] = useTransition()
  const [failed, setFailed] = useState(false)
  const errors = useTranslations('auth.errors')
  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setFailed(false)
          start(async () => {
            try {
              await signOut(locale)
            } catch {
              setFailed(true)
            }
          })
        }}
        className="w-full rounded-sm px-md py-sm text-left font-ui text-caption text-ink hover:bg-paper-hover focus-visible:focus-ring disabled:text-ink-disabled"
      >
        {t('signOut')}
      </button>
      {failed && (
        <span role="alert" className="font-ui text-caption text-danger">
          {errors('generic')}
        </span>
      )}
    </>
  )
}
