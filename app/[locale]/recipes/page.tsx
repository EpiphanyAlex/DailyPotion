import { useTranslations } from 'next-intl'

export default function RecipesPage() {
  const t = useTranslations()
  return (
    <main className="p-xl">
      <p className="font-ui text-micro uppercase text-text-gold">{t('common.appName')}</p>
      <h1 className="mt-sm font-display text-page-title text-ink">{t('nav.recipes')}</h1>
      <p className="mt-md font-body text-body text-ink-soft">{t('common.comingSoon')}</p>
    </main>
  )
}
