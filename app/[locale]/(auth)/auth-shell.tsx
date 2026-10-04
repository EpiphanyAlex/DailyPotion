import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import type { Locale } from '@/lib/matching'

export async function AuthShell({
  children,
  locale,
}: {
  children: ReactNode
  locale: Locale
}) {
  const t = await getTranslations('auth.brand')
  const common = await getTranslations('common')
  return (
    <div className="auth-page grid min-h-screen lg:grid-cols-[4fr_5fr]">
      <div className="relative hidden min-h-screen bg-paper-deep lg:block">
        <div className="absolute inset-0 flex flex-col justify-end bg-image-overlay p-auth-brand">
          <p className="font-display text-recipe-title italic text-on-accent">
            {common('appName')}
          </p>
          <p className="mt-sm font-body text-body text-on-accent">
            {t('slogan')}
          </p>
        </div>
      </div>
      <div className="flex min-h-screen items-start justify-center px-xl pb-xxl pt-24 lg:pt-auth-top">
        <div className="w-full max-w-100">
          <Link
            href={`/${locale}`}
            className="mb-xxl block font-display text-recipe-title italic text-ink focus-visible:focus-ring lg:hidden"
          >
            {common('appName')}
          </Link>
          {children}
        </div>
      </div>
    </div>
  )
}
