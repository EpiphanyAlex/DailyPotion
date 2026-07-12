import type { Metadata } from 'next'
import { fontVariables } from '@/app/fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'DailyPotion',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh" className={fontVariables}>
      <body className="bg-paper text-ink font-body text-body antialiased">{children}</body>
    </html>
  )
}
