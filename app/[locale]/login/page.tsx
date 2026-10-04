import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/lib/matching'
import { AuthShell } from '../(auth)/auth-shell'
import { LoginForm } from './login-form'

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{
    redirect?: string
    confirmed?: string
    error?: string
  }>
}) {
  const { locale } = await params
  const sp = await searchParams
  const t = await getTranslations('auth.login')
  const e = await getTranslations('auth.errors')
  return (
    <AuthShell locale={locale}>
      <p className="font-ui text-micro font-semibold uppercase text-text-gold">
        {t('kicker')}
      </p>
      <h1 className={`mt-xl text-page-title text-ink ${locale === 'zh' ? 'font-ui font-bold' : 'font-display font-semibold'}`}>
        {t('title')}
      </h1>
      <p className="mt-lg font-body text-body text-ink-soft">{t('subtitle')}</p>
      {sp.confirmed === '1' && (
        <p
          role="status"
          className="mt-xl rounded-sm border border-success bg-success-soft p-md font-ui text-caption text-success"
        >
          {t('confirmedBanner')}
        </p>
      )}
      {sp.error === 'callback' && (
        <p
          role="alert"
          className="mt-xl rounded-sm border border-danger bg-danger-soft p-md font-ui text-caption text-danger"
        >
          {e('callback')}
        </p>
      )}
      <LoginForm locale={locale} redirectTo={sp.redirect ?? null} />
    </AuthShell>
  )
}
