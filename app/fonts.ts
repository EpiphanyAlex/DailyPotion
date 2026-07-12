import { Inter, Lora, Noto_Sans_SC, Noto_Serif_SC, Playfair_Display } from 'next/font/google'

export const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['normal', 'italic'], // 品牌名斜体（design.md §6 Auth）Phase 4 会用到
  variable: '--font-playfair',
  display: 'swap',
})

export const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
})

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const notoSerifSC = Noto_Serif_SC({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-noto-serif-sc',
  display: 'swap',
  preload: false,
})

export const notoSansSC = Noto_Sans_SC({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-noto-sans-sc',
  display: 'swap',
  preload: false,
})

export const fontVariables = [
  playfair.variable,
  lora.variable,
  inter.variable,
  notoSerifSC.variable,
  notoSansSC.variable,
].join(' ')
