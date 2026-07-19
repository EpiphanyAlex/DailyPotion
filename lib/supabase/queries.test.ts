import { describe, expect, it } from 'vitest'
import { sanitizeSearchQuery } from './queries'

describe('sanitizeSearchQuery', () => {
  it('普通搜索词原样保留（仅去首尾空白）', () => {
    expect(sanitizeSearchQuery('roku')).toBe('roku')
    expect(sanitizeSearchQuery('  Roku Gin  ')).toBe('Roku Gin')
  })

  it('逗号替换为空格（防止拆断 PostgREST or= 条件）', () => {
    expect(sanitizeSearchQuery('roku,gin')).toBe('roku gin')
    expect(sanitizeSearchQuery(',roku,')).toBe('roku')
  })

  it('PostgREST 语法字符与 SQL 通配符替换为空格', () => {
    expect(sanitizeSearchQuery('%roku%')).toBe('roku')
    expect(sanitizeSearchQuery('roku_*_(gin)')).toBe('roku gin')
    expect(sanitizeSearchQuery('a"b\\c')).toBe('a b c')
  })

  it('压缩空白并限制为 80 个字符', () => {
    expect(sanitizeSearchQuery('roku   gin')).toBe('roku gin')
    expect(sanitizeSearchQuery('a'.repeat(100))).toHaveLength(80)
  })

  it('全是被剔除字符/空白时返回空串（调用方回落为不加搜索条件）', () => {
    expect(sanitizeSearchQuery(',,%%')).toBe('')
    expect(sanitizeSearchQuery('   ')).toBe('')
  })
})
