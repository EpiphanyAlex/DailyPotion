'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { BookOpen, Heart, House, Martini, UserRound } from 'lucide-react'
import type { Locale } from '@/lib/matching'

export function BottomTab({ locale }: { locale: Locale }) {
  const t = useTranslations('nav')
  const path = usePathname()
  const links = [
    ['', t('home'), House],
    ['recipes', t('recipes'), BookOpen],
    ['cabinet', t('cabinet'), Martini],
    ['favorites', t('favorites'), Heart],
    ['profile', t('profile'), UserRound],
  ] as const
  return (
    <nav
      aria-label={t('home')}
      className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-md pb-md lg:hidden"
    >
      <div className="flex w-full max-w-120 items-center justify-between rounded-pill border border-border bg-paper-raised p-xs shadow-floating">
        {links.map(([slug, label, Icon]) => {
          const href = `/${locale}${slug ? `/${slug}` : ''}`
          const active = slug
            ? path === href || path.startsWith(href + '/')
            : path === href
          return (
            <Link
              key={slug}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex min-w-0 flex-1 flex-col items-center gap-xs rounded-pill px-xs py-sm font-ui text-micro focus-visible:focus-ring ${active ? 'bg-accent text-on-accent' : 'text-ink-faint hover:bg-paper-hover'}`}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span className="truncate">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
