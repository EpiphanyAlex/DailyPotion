import { describe, expect, it } from 'vitest'
import type { RecipeWithIngredients, UserBottleRow } from './queries'
import { toOwnedBottles, toRecipeForMatching } from './transform'

const negroni: RecipeWithIngredients = {
  id: 'r-negroni',
  slug: 'negroni',
  name_zh: '内格罗尼',
  name_en: 'Negroni',
  description_zh: null,
  description_en: null,
  instructions_zh: ['搅拌', '滤入'],
  instructions_en: ['Stir', 'Strain'],
  tip_zh: null,
  tip_en: null,
  image_url: null,
  difficulty: 'easy',
  prep_minutes: 3,
  abv_percent: 24,
  flavor_tags: ['bitter', 'herbal', 'classic'],
  base_rating: 4.8,
  base_popularity: 95,
  author_id: null,
  is_public: true,
  created_at: '2026-07-10T00:00:00+00:00',
  recipe_ingredients: [
    // 故意乱序 + 混入辅料：验证「只取 is_spirit=true 且按 sort_order 排序」
    { id: 'i-vermouth', recipe_id: 'r-negroni', is_spirit: true, spirit_type_id: 'st-sweet-vermouth', name_zh: null, name_en: null, amount: '30 ml', sort_order: 2 },
    { id: 'i-peel', recipe_id: 'r-negroni', is_spirit: false, spirit_type_id: null, name_zh: '橙皮', name_en: 'Orange peel', amount: '1 piece', sort_order: 3 },
    { id: 'i-gin', recipe_id: 'r-negroni', is_spirit: true, spirit_type_id: 'st-gin', name_zh: null, name_en: null, amount: '30 ml', sort_order: 0 },
    { id: 'i-campari', recipe_id: 'r-negroni', is_spirit: true, spirit_type_id: 'st-campari', name_zh: null, name_en: null, amount: '30 ml', sort_order: 1 },
  ],
}

const ownedCatalog: UserBottleRow = {
  id: 'ub-catalog',
  user_id: 'u-1',
  bottle_id: 'b-roku',
  custom_name: null,
  spirit_type_id: null,
  status: 'owned',
  created_at: '2026-07-01T10:00:00+00:00',
  bottles_catalog: { slug: 'roku-gin', name_zh: 'Roku 六金酒', name_en: 'Roku Gin', spirit_type_id: 'st-gin', image_url: null },
}

const ownedCustom: UserBottleRow = {
  id: 'ub-custom',
  user_id: 'u-1',
  bottle_id: null,
  custom_name: '自家泡的咖啡利口酒',
  spirit_type_id: 'st-coffee-liqueur',
  status: 'owned',
  created_at: '2026-07-02T10:00:00+00:00',
  bottles_catalog: null,
}

const wishlistCatalog: UserBottleRow = {
  id: 'ub-wishlist',
  user_id: 'u-1',
  bottle_id: 'b-campari',
  custom_name: null,
  spirit_type_id: null,
  status: 'wishlist',
  created_at: '2026-07-03T10:00:00+00:00',
  bottles_catalog: { slug: 'campari-bitter', name_zh: '金巴利苦味利口酒', name_en: 'Campari Bitter', spirit_type_id: 'st-campari', image_url: null },
}

describe('toRecipeForMatching', () => {
  it('映射 id/slug/baseRating/basePopularity，spiritTypeIds 只取 is_spirit=true 且按 sort_order', () => {
    expect(toRecipeForMatching(negroni)).toEqual({
      id: 'r-negroni',
      slug: 'negroni',
      spiritTypeIds: ['st-gin', 'st-campari', 'st-sweet-vermouth'],
      baseRating: 4.8,
      basePopularity: 95,
    })
  })

  it('没有 spirit 配料时 spiritTypeIds 为空数组（Phase 3 会判为不可调）', () => {
    const mocktail: RecipeWithIngredients = {
      ...negroni,
      id: 'r-mocktail',
      slug: 'virgin-mojito',
      recipe_ingredients: [
        { id: 'i-soda', recipe_id: 'r-mocktail', is_spirit: false, spirit_type_id: null, name_zh: '苏打水', name_en: 'Soda water', amount: 'Top', sort_order: 0 },
      ],
    }
    expect(toRecipeForMatching(mocktail).spiritTypeIds).toEqual([])
  })
})

describe('toOwnedBottles', () => {
  it('catalog 瓶经 join 取 bottles_catalog.spirit_type_id，自定义瓶取自身 spirit_type_id', () => {
    expect(toOwnedBottles([ownedCatalog, ownedCustom])).toEqual([
      { id: 'ub-catalog', spiritTypeId: 'st-gin', createdAt: '2026-07-01T10:00:00+00:00' },
      { id: 'ub-custom', spiritTypeId: 'st-coffee-liqueur', createdAt: '2026-07-02T10:00:00+00:00' },
    ])
  })

  it("过滤掉 status !== 'owned' 的行（wishlist 不参与匹配）", () => {
    expect(toOwnedBottles([wishlistCatalog])).toEqual([])
    expect(toOwnedBottles([ownedCatalog, wishlistCatalog]).map((b) => b.id)).toEqual(['ub-catalog'])
  })

  it('spirit_type_id 无法解析的脏行被防御性跳过（DB check 约束下不应出现）', () => {
    const corrupt: UserBottleRow = { ...ownedCustom, id: 'ub-corrupt', custom_name: '幽灵瓶', spirit_type_id: null }
    expect(toOwnedBottles([corrupt])).toEqual([])
  })

  it('空输入返回空数组', () => {
    expect(toOwnedBottles([])).toEqual([])
  })
})
