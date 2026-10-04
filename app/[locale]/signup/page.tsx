import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/lib/matching'
import { AuthShell } from '../(auth)/auth-shell'
import { SignupForm } from './signup-form'

export default async function SignupPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ redirect?: string }>
}) {
  const { locale } = await params
  const { redirect: redirectTo } = await searchParams
  const t = await getTranslations('auth.signup')
  return (
    <AuthShell locale={locale}>
      <p className="font-ui text-micro font-semibold uppercase text-text-gold">
        {t('kicker')}
      </p>
      <h1 className="mt-md font-display text-page-title text-ink">
        {t('title')}
      </h1>
      <p className="mt-lg font-body text-body text-ink-soft">{t('subtitle')}</p>
      <SignupForm locale={locale} redirectTo={redirectTo ?? null} />
    </AuthShell>
  )
}
