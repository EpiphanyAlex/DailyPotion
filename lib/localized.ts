import type { Locale } from '@/lib/matching'

/**
 * 读 `${field}_${locale}`，空/缺 → 另一语言列 → ''。
 * 数据内容双列 *_zh / *_en 的唯一取值入口（契约 B）。
 */
export function pickLocalized(row: Record<string, unknown>, field: string, locale: Locale): string {
  const other: Locale = locale === 'zh' ? 'en' : 'zh'
  const primary = row[`${field}_${locale}`]
  if (typeof primary === 'string' && primary.trim() !== '') return primary
  const fallback = row[`${field}_${other}`]
  if (typeof fallback === 'string' && fallback.trim() !== '') return fallback
  return ''
}
