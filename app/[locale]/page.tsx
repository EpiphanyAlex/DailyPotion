import { useTranslations } from 'next-intl'

export default function HomePage() {
  const t = useTranslations()
  return (
    <main className="p-xl">
      <p className="font-ui text-micro uppercase text-text-gold">{t('nav.home')}</p>
      <h1 className="mt-sm font-display text-recipe-title text-ink">{t('common.appName')}</h1>
      <p className="mt-md font-body text-body text-ink-soft">{t('common.comingSoon')}</p>
    </main>
  )
}
