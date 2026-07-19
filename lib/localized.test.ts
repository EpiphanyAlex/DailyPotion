import { describe, expect, it } from 'vitest'
import { pickLocalized } from './localized'

describe('pickLocalized', () => {
  it('当前 locale 列有值时直接返回', () => {
    expect(pickLocalized({ name_zh: '内格罗尼', name_en: 'Negroni' }, 'name', 'zh')).toBe('内格罗尼')
    expect(pickLocalized({ name_zh: '内格罗尼', name_en: 'Negroni' }, 'name', 'en')).toBe('Negroni')
  })

  it('当前 locale 列为空串或纯空白时回落另一语言', () => {
    expect(pickLocalized({ name_zh: '', name_en: 'Negroni' }, 'name', 'zh')).toBe('Negroni')
    expect(pickLocalized({ name_zh: '内格罗尼', name_en: '   ' }, 'name', 'en')).toBe('内格罗尼')
    expect(pickLocalized({ name_en: 'Negroni' }, 'name', 'zh')).toBe('Negroni') // 列缺失同样回落
  })

  it('两列均空/缺失时返回空串', () => {
    expect(pickLocalized({ name_zh: '', name_en: '' }, 'name', 'zh')).toBe('')
    expect(pickLocalized({}, 'name', 'en')).toBe('')
    expect(pickLocalized({ name_zh: null, name_en: null }, 'name', 'zh')).toBe('')
  })
})
