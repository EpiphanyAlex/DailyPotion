'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import type { Locale } from '@/lib/matching'
import { TopNav } from './top-nav'
import { BottomTab } from './bottom-tab'

export function AppFrame({
  children,
  locale,
  userId,
}: {
  children: ReactNode
  locale: Locale
  userId: string | null
}) {
  const path = usePathname()
  const authRoute = /^\/(zh|en)\/(login|signup|reset-password)(\/|$)/.test(path)
  if (authRoute) return <>{children}</>
  return (
    <>
      <TopNav locale={locale} userId={userId} />
      <div key={userId ?? 'guest'} className="pb-24 lg:pb-0">
        {children}
      </div>
      <BottomTab locale={locale} />
    </>
  )
}
