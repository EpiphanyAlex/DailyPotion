// lib/supabase/transform.ts —— DB Row → 匹配引擎纯数据结构（契约 B）。
import type { OwnedBottle, RecipeForMatching } from '@/lib/matching'
import type { RecipeWithIngredients, UserBottleRow } from '@/lib/supabase/queries'

/** recipes + 配料 → 匹配输入：spiritTypeIds 只取 is_spirit=true 配料，函数内按 sort_order 排序。 */
export function toRecipeForMatching(r: RecipeWithIngredients): RecipeForMatching {
  const spiritTypeIds = [...r.recipe_ingredients]
    .sort((a, b) => a.sort_order - b.sort_order)
    .flatMap((ri) => (ri.is_spirit && ri.spirit_type_id !== null ? [ri.spirit_type_id] : []))
  return {
    id: r.id,
    slug: r.slug,
    spiritTypeIds,
    baseRating: r.base_rating,
    basePopularity: r.base_popularity,
  }
}

/**
 * user_bottles → 匹配输入：过滤 status==='owned'（wishlist 不参与匹配，CLAUDE.md 红线）；
 * catalog 瓶经 join 取 bottles_catalog.spirit_type_id，自定义瓶取自身 spirit_type_id；
 * 两者皆空的脏行（user_bottles_source_check 约束下不应出现）防御性跳过。
 */
export function toOwnedBottles(rows: UserBottleRow[]): OwnedBottle[] {
  return rows.flatMap((row) => {
    if (row.status !== 'owned') return []
    const spiritTypeId = row.bottles_catalog?.spirit_type_id ?? row.spirit_type_id
    if (spiritTypeId === null) return []
    return [{ id: row.id, spiritTypeId, createdAt: row.created_at }]
  })
}
