'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { Locale } from '@/lib/matching'

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const search = useSearchParams()
  const router = useRouter()
  function switchTo(next: Locale) {
    if (next === locale) return
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`
    const rest = pathname.replace(/^\/(zh|en)(?=\/|$)/, '')
    router.replace(
      `/${next}${rest}${search.size ? `?${search.toString()}` : ''}`,
    )
    router.refresh()
  }
  return (
    <div
      role="group"
      aria-label={t('localeZh') + ' / ' + t('localeEn')}
      className="inline-flex rounded-pill border border-border bg-paper-raised p-xs font-ui text-caption"
    >
      {(['zh', 'en'] as const).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => switchTo(item)}
          aria-pressed={item === locale}
          className={`rounded-pill px-md py-xs focus-visible:focus-ring ${item === locale ? 'bg-accent text-on-accent' : 'text-ink-soft hover:bg-paper-hover'}`}
        >
          {t(item === 'zh' ? 'localeZh' : 'localeEn')}
        </button>
      ))}
    </div>
  )
}
