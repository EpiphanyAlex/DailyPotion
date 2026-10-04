import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { Clock3, Mail, Languages, LogOut } from 'lucide-react'
import { LocaleSwitcher } from '@/components/nav/locale-switcher'
import { SignOutButton } from '@/components/nav/sign-out-button'
import { createServerSupabase } from '@/lib/supabase/server'
import type { Locale } from '@/lib/matching'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const sb = await createServerSupabase()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) redirect(`/${locale}/login?redirect=%2Fprofile`)
  const t = await getTranslations('profile')
  return (
    <main className="mx-auto max-w-280 px-xl py-xxl">
      <h1 className="font-display text-page-title text-ink">{t('title')}</h1>
      <div className="mt-xxl grid gap-xl md:grid-cols-2">
        <section className="rounded-md border border-border bg-paper-raised p-xl shadow-card">
          <div className="flex items-center gap-sm text-ink-soft">
            <Mail className="size-5" aria-hidden="true" />
            <h2 className="font-ui text-caption font-semibold">
              {t('emailLabel')}
            </h2>
          </div>
          <p className="mt-md break-all font-body text-body text-ink">
            {user.email}
          </p>
        </section>
        <section className="rounded-md border border-border bg-paper-raised p-xl shadow-card">
          <div className="flex items-center gap-sm text-ink-soft">
            <Languages className="size-5" aria-hidden="true" />
            <h2 className="font-ui text-caption font-semibold">
              {t('languageLabel')}
            </h2>
          </div>
          <div className="mt-md">
            <LocaleSwitcher locale={locale} />
          </div>
        </section>
      </div>
      <div className="mt-xl overflow-hidden rounded-md border border-border bg-paper-raised">
        <Link
          href={`/${locale}/history`}
          className="flex items-center gap-md border-b border-border px-xl py-lg font-ui text-body text-ink hover:bg-paper-hover focus-visible:focus-ring"
        >
          <Clock3 className="size-5" aria-hidden="true" />
          {t('historyLink')}
        </Link>
        <div className="flex items-center gap-md px-xl py-lg text-danger">
          <LogOut className="size-5" aria-hidden="true" />
          <SignOutButton locale={locale} />
        </div>
      </div>
    </main>
  )
}
