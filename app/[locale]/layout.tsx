import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { fontVariables } from '@/app/fonts'
import { routing } from '@/i18n/routing'
import { createServerSupabase } from '@/lib/supabase/server'
import { AppFrame } from '@/components/nav/app-frame'
import '@/app/globals.css'

export const metadata: Metadata = {
  title: 'DailyPotion',
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  const sb = await createServerSupabase()
  const {
    data: { user },
  } = await sb.auth.getUser()
  return (
    <html lang={locale} className={fontVariables}>
      <body className="bg-paper text-ink font-body text-body antialiased">
        <NextIntlClientProvider>
          <AppFrame locale={locale} userId={user?.id ?? null}>
            {children}
          </AppFrame>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
