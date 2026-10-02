import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const read = (name: string) => readFileSync(path.join(root, name), 'utf8')

describe('文档轻量检查', () => {
  it('design.md 的颜色、阴影、间距、圆角和字号取值与 CSS token 一致', () => {
    const design = read('design.md')
    const css = read('app/globals.css')
    const cssValues = new Map(
      [...css.matchAll(/^\s*(--(?:color|shadow|spacing|radius|text)-[\w-]+):\s*([^;]+);/gm)]
        .map(([, key, value]) => [key, value.trim()])
    )
    const designValues = new Map<string, string>()
    for (const line of design.split('\n')) {
      const cells = line.split('|').map(cell => cell.trim())
      const key = cells[1]?.match(/^`(--(?:color|shadow|spacing|radius|text)-[\w-]+)`$/)?.[1]
      if (!key) continue
      const valueCell = key.startsWith('--text-') ? cells[3] : cells[2]
      const value = valueCell?.match(/^`([^`]+)`/)?.[1]
      if (value) designValues.set(key, value)
    }
    expect(designValues.size).toBeGreaterThan(35)
    for (const [key, value] of designValues) {
      expect(cssValues.get(key), key).toBe(value)
    }
    expect([...cssValues.keys()].filter(key => !key.includes('--line-height') && !key.includes('--letter-spacing') && !designValues.has(key))).toEqual([])
    for (const name of ['Playfair Display', 'Noto Serif SC', 'Lora', 'Inter', 'Noto Sans SC']) {
      expect(design).toContain(name)
      expect(css).toContain(name)
    }
  })

  it('工程文档与相关 PRD 的相对 Markdown 链接存在', () => {
    const files = [
      'README.md', 'docs/architecture.md', 'docs/adr/README.md',
      'docs/adr/0001-matching-unit.md', 'docs/adr/0002-web-query-lifecycle.md',
      'docs/engineering/interaction-acceptance.md', 'docs/engineering/visual-acceptance.md',
      ...['03-auth', '05-recipes-library', '06-recipe-detail', '07-my-cabinet', '09-i18n-and-global-states']
        .map(name => `docs/prd/${name}.md`),
    ]
    for (const file of files) {
      const markdown = read(file).replace(/```[\s\S]*?```/g, '')
      for (const [, destination] of markdown.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
        if (/^(https?:|mailto:|#)/.test(destination)) continue
        const target = decodeURIComponent(destination.split('#')[0])
        expect(existsSync(path.resolve(root, path.dirname(file), target)), `${file} → ${destination}`).toBe(true)
      }
    }
  })

  it('跨页面规格仍指向同一匹配与权限边界', () => {
    const matching = read('docs/prd/02-matching-engine.md')
    const architecture = read('docs/architecture.md')
    const migration = read('supabase/migrations/20260718000100_user_schema.sql')
    expect(matching).toContain('spirit_types')
    expect(matching).toContain('is_spirit = true')
    expect(architecture).toContain('lib/matching.ts')
    expect(architecture).toContain('lib/supabase/queries.ts')
    for (const table of ['user_bottles', 'user_recipe_marks', 'user_pour_logs']) {
      expect(migration).toContain(`alter table ${table}`)
      expect(migration).toMatch(new RegExp(`create policy "${table}_select_own"`))
    }
    expect(read('docs/prd/05-recipes-library.md')).toContain('`?q=&spirit=&filter=&sort=`')
  })
})
