import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/lib/matching'
import { createServerSupabase } from '@/lib/supabase/server'
import { AuthShell } from '../(auth)/auth-shell'
import { ResetForm } from './reset-form'

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ step?: string }>
}) {
  const { locale } = await params
  const { step } = await searchParams
  const t = await getTranslations('auth.reset')
  let canUpdate = false
  if (step === 'update') {
    const sb = await createServerSupabase()
    const {
      data: { user },
    } = await sb.auth.getUser()
    canUpdate = !!user
  }
  return (
    <AuthShell locale={locale}>
      <p className="font-ui text-micro font-semibold uppercase text-text-gold">
        {t('kicker')}
      </p>
      <h1 className="mt-md font-display text-page-title text-ink">
        {canUpdate ? t('updateTitle') : t('title')}
      </h1>
      {!canUpdate && (
        <p className="mt-lg font-body text-body text-ink-soft">
          {t('subtitle')}
        </p>
      )}
      {step === 'update' && !canUpdate && (
        <p
          role="alert"
          className="mt-xl rounded-sm border border-danger bg-danger-soft p-md font-ui text-caption text-danger"
        >
          {t('expired')}
        </p>
      )}
      <ResetForm
        key={canUpdate ? 'update' : 'request'}
        locale={locale}
        mode={canUpdate ? 'update' : 'request'}
      />
    </AuthShell>
  )
}
