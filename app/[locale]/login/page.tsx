import { useTranslations } from 'next-intl'

export default function LoginPage() {
  const t = useTranslations()
  return (
    <main className="p-xl">
      <h1 className="font-display text-page-title text-ink">{t('common.appName')}</h1>
      <p className="mt-md font-body text-body text-ink-soft">{t('common.comingSoon')}</p>
    </main>
  )
}
