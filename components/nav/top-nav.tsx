'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  BookOpen,
  Clock3,
  Heart,
  House,
  Martini,
  UserRound,
} from 'lucide-react'
import type { Locale } from '@/lib/matching'
import { LocaleSwitcher } from './locale-switcher'
import { SignOutButton } from './sign-out-button'

export function TopNav({
  locale,
  userId,
}: {
  locale: Locale
  userId: string | null
}) {
  const t = useTranslations('nav')
  const common = useTranslations('common')
  const path = usePathname()
  const links = [
    ['', t('today'), House],
    ['recipes', t('recipes'), BookOpen],
    ['cabinet', t('cabinet'), Martini],
    ['history', t('history'), Clock3],
    ['favorites', t('favorites'), Heart],
  ] as const
  return (
    <header className="hidden border-b border-border bg-paper-raised lg:block">
      <div className="mx-auto flex h-20 max-w-280 items-center gap-xl px-xl">
        <Link
          href={`/${locale}`}
          className="shrink-0 font-display text-card-title italic text-ink focus-visible:focus-ring"
        >
          {common('appName')}
        </Link>
        <nav
          aria-label={t('home')}
          className="flex flex-1 items-center justify-center gap-xs"
        >
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
                className={`inline-flex items-center gap-xs rounded-pill px-md py-sm font-ui text-caption font-semibold focus-visible:focus-ring ${active ? 'bg-paper-selected text-accent' : 'text-ink-soft hover:bg-paper-hover'}`}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            )
          })}
        </nav>
        <LocaleSwitcher locale={locale} />
        {userId ? (
          <details className="relative group">
            <summary
              aria-label={t('accountMenu')}
              className="flex size-10 cursor-pointer list-none items-center justify-center rounded-pill border border-border text-ink hover:bg-paper-hover focus-visible:focus-ring"
            >
              <UserRound className="size-5" aria-hidden="true" />
            </summary>
            <div className="absolute right-0 z-30 mt-sm w-44 rounded-md border border-border bg-paper-raised p-sm shadow-floating">
              <Link
                href={`/${locale}/profile`}
                className="block rounded-sm px-md py-sm font-ui text-caption text-ink hover:bg-paper-hover focus-visible:focus-ring"
              >
                {t('profile')}
              </Link>
              <SignOutButton locale={locale} />
            </div>
          </details>
        ) : (
          <Link
            href={`/${locale}/login`}
            className="rounded-pill bg-accent px-lg py-sm font-ui text-caption font-semibold text-on-accent hover:bg-accent-hover focus-visible:focus-ring"
          >
            {t('signIn')}
          </Link>
        )}
      </div>
    </header>
  )
}
