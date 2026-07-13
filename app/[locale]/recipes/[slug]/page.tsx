import { getTranslations } from 'next-intl/server'

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const t = await getTranslations()
  return (
    <main className="p-xl">
      <p className="font-ui text-micro uppercase text-text-gold">{t('nav.recipes')}</p>
      <h1 className="mt-sm font-display text-recipe-title text-ink">{slug}</h1>
      <p className="mt-md font-body text-body text-ink-soft">{t('common.comingSoon')}</p>
    </main>
  )
}
